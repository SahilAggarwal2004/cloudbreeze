/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import Loader from '../../components/Loader';
import FileInfo from '../../components/FileInfo';
import { useFileContext } from '../../contexts/ContextProvider';

export default function Upload(props) {
  const { guest, token, uploadFiles, setUploadFiles, fetchApp } = useFileContext()
  const passwordRef = useRef()
  const [fileIdRef, setFileId] = useState()
  const [daysLimitRef, setDaysLimit] = useState()
  const [downloadLimitRef, setDownloadLimit] = useState()
  const [files, setFiles] = useState()
  const [link, setLink] = useState()
  const [upPercent, setUpPercent] = useState(0)
  const [share, setShare] = useState(props.share)
  const limit = 100;
  const daysLimit = token ? 30 : 3

  const verifyFileId = event => setFileId(event.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
  const verifyDownloadLimit = event => setDownloadLimit(Math.abs(event.target.value) || '')
  const verifyDaysLimit = event => {
    const value = Math.abs(event.target.value)
    if (value <= daysLimit) setDaysLimit(value || '')
  }

  function calcSize(files) {
    let size = 0;
    for (let i = 0; i < files.length; i++) size += files[i].size
    return size
  }

  function updateFile(event) {
    const { files } = event.target
    if (files.length > 10) {
      event.target.value = "";
      return toast.warning("Cannot select more than 10 files!");
    }
    if (calcSize(files) > limit * 1048576) { // size limit
      event.target.value = "";
      return toast.warning(`Total file(s) size exceed ${limit}MB!`);
    }
    setFiles(files)
  }

  function reset() {
    setFileId('');
    setLink();
    setUpPercent(0);
    setShare(false);
  }

  async function handleSubmit(event) {
    event.preventDefault()
    let content, password = passwordRef.current.value;
    if (files.length === 1) content = files[0]
    else {
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) zip.file(files[i].name, files[i])
      content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
    }

    const data = new FormData();
    data.append('files', content) // (attribute, value), this is the attribute that we will accept in backend as upload.single/array(attribute which contains the files) where upload is a multer function
    data.append('length', files.length)
    const nameList = []
    for (let i = 0; i < files.length; i++) { nameList.push(files[i].name); }
    if (fileIdRef) data.append('fileId', fileIdRef)
    if (files.length > 1) data.append('nameList', nameList)
    if (password) data.append('password', password)
    if (daysLimitRef) data.append('daysLimit', daysLimitRef)
    if (downloadLimitRef) data.append('downloadLimit', downloadLimitRef)
    if (guest) data.append('guest', guest)

    const { success: verified } = await fetchApp({ url: 'file/verify', method: 'POST', data: { fileId: fileIdRef }, authtoken: token })
    if (!verified) return

    const { fileId, createdAt, success } = await fetchApp({
      url: 'file/upload', method: 'POST', data, type: 'multipart/form-data', authtoken: token, options: {
        onUploadProgress: ({ loaded, total }) => setUpPercent(Math.round((loaded * 100) / total))
      }
    })
    if (!success) return setLink('error')
    setLink(fileId)
    const updatedFiles = uploadFiles.concat({ nameList, createdAt, fileId, downloadCount: 0, daysLimit: daysLimitRef || daysLimit })
    setUploadFiles(updatedFiles)
  }

  useEffect(() => {
    navigator.serviceWorker?.addEventListener('message', ({ data: { files } }) => {
      if (calcSize(files) > limit * 1048576) toast.warning(`Total file(s) size exceed ${limit}MB!`)
      else {
        setFiles(files);
        setShare(true)
      }
    })
  }, [])

  return <div className='flex flex-col space-y-5 justify-center items-center px-4 pb-5 text-sm sm:text-base'>
    <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 items-center">
      <label htmlFor="files">File(s):</label>
      {share ? <div>{files.length > 1 ? `${files.length} files` : files[0]?.name} selected</div>
        : <input type="file" id='files' disabled={upPercent && link !== 'error'} required onChange={updateFile} multiple />}

      <label htmlFor="file-id">File Id: </label>
      <input type="text" id='file-id' value={fileIdRef} disabled={upPercent && link !== 'error'} className='border rounded px-2 py-0.5 placeholder:text-sm' onChange={verifyFileId} autoComplete='off' placeholder='Auto' />

      <label htmlFor="password">Password:</label>
      <input type="password" id='password' ref={passwordRef} disabled={upPercent && link !== 'error'} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="new-password" placeholder='No protection' />

      <label htmlFor="time-limit">Days Limit:</label>
      <input type="number" id='download-limit' value={daysLimitRef} disabled={upPercent && link !== 'error'} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="off" placeholder={`${daysLimit} (max)`} min={1} max={daysLimit} onChange={verifyDaysLimit} />

      <label htmlFor="download-limit">Download Limit:</label>
      <input type="number" id='download-limit' value={downloadLimitRef} disabled={upPercent && link !== 'error'} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="off" placeholder='No limit' min={1} onChange={verifyDownloadLimit} />

      <button type="submit" disabled={upPercent && link !== 'error'} className='col-span-2 mt-5 py-1 border border-black rounded bg-gray-100 disabled:opacity-50 font-medium text-gray-800' onClick={() => { if (link === 'error') reset() }}>Upload</button>
      {link && link !== 'error' && <button type="reset" className='col-span-2 py-1 border border-black rounded bg-gray-100 font-medium text-gray-800' onClick={() => setTimeout(() => reset(), 0)}>Reset</button>}
    </form>

    {Boolean(upPercent) && link != 'error' && <div className='w-full flex items-center justify-evenly max-w-[400px]'>
      <div className='bg-gray-300 rounded-full h-1 w-4/5'>
        <div className='bg-green-500 rounded-full h-1' style={{ width: `${upPercent}%` }} />
      </div>
      {upPercent}%
    </div>}

    {upPercent == 100 && !link && <div className='flex items-center space-x-2'>
      <Loader />
      <div>Please wait, processing the file(s)...</div>
    </div>}

    {link && link != 'error' && <div className='pb-16'><FileInfo fileId={link} /></div>}
  </div >
}