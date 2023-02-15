/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import Loader from '../../components/Loader';
import Info from '../../components/Info';
import { useFileContext } from '../../contexts/ContextProvider';
import { limit, options } from '../../constants';
import BarProgress from '../../components/BarProgress';
import { fileDetails, getUploadUrl, remove } from '../../modules/functions';
import { getStorage } from '../../modules/storage';
import Head from 'next/head';
import { randomElement } from 'random-stuff-js';

export default function Upload({ router }) {
  const { uploadFiles, setUploadFiles, fetchApp, files, setFiles } = useFileContext()
  const { share } = router.query
  const type = getStorage('type')
  const passwordRef = useRef()
  const [fileIdRef, setFileId] = useState('')
  const [daysLimitRef, setDaysLimit] = useState()
  const [downloadLimitRef, setDownloadLimit] = useState()
  const [link, setLink] = useState()
  const [upPercent, setUpPercent] = useState(-1)
  const isUploading = upPercent >= 0
  const isUploaded = link && link !== 'error'
  const daysLimit = type === 'premium' ? 365 : type === 'normal' ? 30 : 3
  const length = files.length

  const verifyFileId = event => setFileId(event.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
  const verifyDownloadLimit = event => setDownloadLimit(Math.abs(event.target.value) || '')
  const verifyDaysLimit = event => {
    const value = Math.abs(event.target.value)
    if (value <= daysLimit) setDaysLimit(value || '')
  }

  function updateFile(event) {
    const { files } = event.target
    const size = fileDetails(files).totalSize
    if (!size) {
      event.target.value = "";
      return toast.warning('Empty file(s)');
    }
    if (size > limit * 1048576) { // size limit
      toast('Try Peer-to-peer transfer for big files')
      setFiles(files)
      return router.push('/p2p?share=true')
    }
    setFiles(files)
  }

  function reset() {
    setFileId('');
    setLink();
    setUpPercent(-1);
    router.push('/file/upload')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setUpPercent(0)
    let content, password = passwordRef.current.value;
    if (length === 1) content = files[0]
    else {
      const zip = new JSZip();
      for (let i = 0; i < length; i++) zip.file(files[i].name, files[i])
      content = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    }

    const data = new FormData();
    data.append('files', content) // (attribute, value), this is the attribute that we will accept in backend as upload.single/array(attribute which contains the files) where upload is a multer function
    data.append('length', length)
    const nameList = []
    for (let i = 0; i < length; i++) nameList.push(files[i].name)
    if (fileIdRef) {
      if (options.includes(fileIdRef)) {
        toast.warning(`File Id cannot be ${fileIdRef}`);
        setUpPercent(-1)
        return
      }
      data.append('fileId', fileIdRef)
    }
    if (length > 1) data.append('nameList', nameList)
    if (password) data.append('password', password)
    if (daysLimitRef) data.append('daysLimit', daysLimitRef)
    if (downloadLimitRef) data.append('downloadLimit', downloadLimitRef)

    let { success: verified, accesstoken, server, servers } = await fetchApp({ url: 'file/verify', method: 'POST', data: { fileId: fileIdRef } })
    if (!verified) return setUpPercent(-1)

    while (!success) {
      if (!servers.length) {
        setLink('error')
        setUpPercent(-1)
        return
      }
      var { fileId, createdAt, success } = await fetchApp({
        url: getUploadUrl(server), method: 'POST', data, type: 'multipart/form-data', accesstoken,
        showToast: servers.length === 1 || 'success', options: {
          onUploadProgress: ({ loaded, total }) => setUpPercent(Math.round(loaded * 100 / total))
        }
      })
      remove(servers, server)
      server = randomElement(servers)
    }
    setLink(fileId)
    const updatedFiles = uploadFiles.concat({ nameList, createdAt, _id: fileId, downloadCount: 0, daysLimit: daysLimitRef || daysLimit })
    setUploadFiles(updatedFiles)
  }

  useEffect(() => {
    if (!share) setFiles([])
    navigator.serviceWorker?.addEventListener('message', ({ data: { files } }) => {
      setFiles(files)
      if (fileDetails(files).totalSize > limit * 1048576) router.push('/p2p?share=true')
    })
  }, [])

  useEffect(() => { isUploaded && window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) }, [link])

  return <>
    <Head><title>Upload a file | CloudBreeze</title></Head>
    <div className='flex flex-col space-y-5 justify-center items-center px-4 pb-5 text-sm sm:text-base'>
      <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 items-center">
        <label htmlFor="files">File(s):</label>
        {share && length ? <div>{length > 1 ? `${length} files` : files[0]?.name} selected</div>
          : <input type="file" id='files' disabled={isUploading} required onChange={updateFile} multiple />}

        <label htmlFor="file-id">File Id: </label>
        <input type="text" id='file-id' value={fileIdRef} disabled={isUploading} className='border rounded px-2 py-0.5 placeholder:text-sm' onChange={verifyFileId} autoComplete='off' placeholder='Auto' maxLength={30} />

        <label htmlFor="password">Password:</label>
        <input type="password" id='password' ref={passwordRef} disabled={isUploading} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="new-password" placeholder='No protection' />

        <label htmlFor="days-limit">Days Limit:</label>
        <input type="number" id='days-limit' value={daysLimitRef} disabled={isUploading} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="off" placeholder={`${daysLimit} (max)`} min={1} max={daysLimit} onChange={verifyDaysLimit} />

        <label htmlFor="download-limit">Download Limit:</label>
        <input type="number" id='download-limit' value={downloadLimitRef} disabled={isUploading} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="off" placeholder='No limit' min={1} onChange={verifyDownloadLimit} />

        <button type="submit" disabled={isUploading} className='primary-button'>Upload</button>
        {isUploaded && <button type="reset" className='col-span-2 py-1 border border-black rounded bg-gray-100 font-medium text-gray-800' onClick={() => setTimeout(() => reset(), 0)}>Reset</button>}
      </form>

      {!link && (upPercent === 100 ? <Loader className='flex items-center space-x-2' text='Please wait, processing the file(s)...' /> : <BarProgress percent={upPercent} />)}

      {isUploaded && <div className='pb-16'><Info fileId={link} /></div>}
    </div >
  </>
}