/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import Loader from '../../components/Loader';
import FileInfo from '../../components/FileInfo';
import { useFileContext } from '../../contexts/ContextProvider';
import { options } from '../../constants';

export default function Upload(props) {
  const { guest, token, uploadFiles, setUploadFiles, fetchApp } = useFileContext()
  const passwordRef = useRef()
  const [fileid, setFileid] = useState()
  const [daysLimitRef, setDaysLimit] = useState()
  const [downloadLimitRef, setDownloadLimit] = useState()
  const [files, setFiles] = useState()
  const [link, setLink] = useState()
  const [isUploading, setIsUploading] = useState(false)
  const [upPercent, setUpPercent] = useState(0)
  const [share, setShare] = useState(props.share)
  const limit = 100;
  const daysLimit = token ? 30 : 3
  const disabled = (isUploading || upPercent) && link !== 'error'

  const verifyFileId = event => setFileid(event.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
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
    if (calcSize(files) > limit * 1048576) { // size limit
      event.target.value = "";
      return toast.warning(`Total file(s) size exceed ${limit}MB!`);
    }
    setFiles(files)
  }

  function reset() {
    setFileid('');
    setLink();
    setUpPercent(0);
    setShare(false);
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsUploading(true)
    let content, password = passwordRef.current.value;
    if (files.length === 1) content = files[0]
    else {
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) zip.file(files[i].name, files[i])
      content = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    }

    const data = new FormData();
    data.append('files', content) // (attribute, value), this is the attribute that we will accept in backend as upload.single/array(attribute which contains the files) where upload is a multer function
    data.append('length', files.length)
    const nameList = []
    for (let i = 0; i < files.length; i++) nameList.push(files[i].name)
    if (fileid && options.includes(fileid)) {
      toast.warning(`File Id cannot be ${fileid}`);
      setIsUploading(false)
      return
    }
    if (files.length > 1) data.append('nameList', nameList)
    if (password) data.append('password', password)
    if (daysLimitRef) data.append('daysLimit', daysLimitRef)
    if (downloadLimitRef) data.append('downloadLimit', downloadLimitRef)
    if (guest) data.append('guest', guest)

    const { fileId, createdAt, success } = await fetchApp({
      url: 'file/upload', method: 'POST', data, type: 'multipart/form-data', authtoken: token, headers: { fileid }, options: {
        onUploadProgress: ({ loaded, total }) => setUpPercent(Math.round((loaded * 100) / total))
      }
    })
    if (!success) {
      setLink('error')
      setIsUploading(false)
      return
    }
    setLink(fileId)
    setIsUploading(false)
    const updatedFiles = uploadFiles.concat({ nameList, createdAt, _id: fileId, downloadCount: 0, daysLimit: daysLimitRef || daysLimit })
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
        : <input type="file" id='files' disabled={disabled} required onChange={updateFile} multiple />}

      <label htmlFor="file-id">File Id: </label>
      <input type="text" id='file-id' value={fileid} disabled={disabled} className='border rounded px-2 py-0.5 placeholder:text-sm' onChange={verifyFileId} autoComplete='off' placeholder='Auto' maxLength={30} />

      <label htmlFor="password">Password:</label>
      <input type="password" id='password' ref={passwordRef} disabled={disabled} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="new-password" placeholder='No protection' />

      <label htmlFor="days-limit">Days Limit:</label>
      <input type="number" id='days-limit' value={daysLimitRef} disabled={disabled} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="off" placeholder={`${daysLimit} (max)`} min={1} max={daysLimit} onChange={verifyDaysLimit} />

      <label htmlFor="download-limit">Download Limit:</label>
      <input type="number" id='download-limit' value={downloadLimitRef} disabled={disabled} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="off" placeholder='No limit' min={1} onChange={verifyDownloadLimit} />

      <button type="submit" disabled={disabled} className='col-span-2 mt-5 py-1 border border-black rounded bg-gray-100 disabled:opacity-50 font-medium text-gray-800'>Upload</button>
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