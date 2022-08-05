/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import Loader from '../../components/Loader';
import FileInfo from '../../components/FileInfo';
import { useFileContext } from '../../contexts/ContextProvider';

export default function Upload(props) {
  const { guest, token, uploadFiles, setUploadFiles, fetchApp } = useFileContext()
  const fileIdRef = useRef()
  const password = useRef()
  const [autoFileId, setAutoFileId] = useState(true)
  const [files, setFiles] = useState()
  const [link, setLink] = useState()
  const [upPercent, setUpPercent] = useState(0)
  const [share, setShare] = useState(props.share)
  const limit = 100;

  const verifyFileId = event => { if (!/[0-9a-zA-Z]/i.test(event.key)) event.preventDefault() }

  function toggleAutoFileId() {
    if (autoFileId) return setAutoFileId(false)
    setAutoFileId(true)
    fileIdRef.current.value = ''
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
    setLink();
    setUpPercent(0);
    setShare(false);
  }

  async function handleSubmit(event) {
    event.preventDefault()
    let content;
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
    if (!autoFileId) data.append('fileId', fileIdRef.current.value)
    if (files.length > 1) data.append('nameList', nameList)
    if (password) data.append('password', password.current.value)
    if (guest) data.append('guest', guest)

    // const { success: verified } = await fetchApp({ url: 'file/verify', method: 'POST', data: { fileId: fileIdRef.current.value }, authtoken: token })
    // if (!verified) return

    const { fileId, createdAt, success } = await fetchApp({
      url: 'file/upload', method: 'POST', data, type: 'multipart/form-data', authtoken: token, options: {
        onUploadProgress: ({ loaded, total }) => setUpPercent(Math.round((loaded * 100) / total))
      }
    })
    if (!success) return setLink('error')
    setLink(fileId)
    if (token) return
    const updatedFiles = uploadFiles.concat({ nameList, createdAt, fileId })
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

  return <div className='flex flex-col space-y-5 justify-center items-center px-4 pb-5'>
    <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 place-content-center">
      <label htmlFor="files">File(s):</label>
      {share ? <div>{files.length > 1 ? `${files.length} files` : files[0]?.name} selected</div>
        : <input type="file" id='files' required onChange={updateFile} multiple />}

      <div className='col-span-2 flex justify-between items-center'>
        Auto-generate File Id?
        <div className="inline-flex relative items-center cursor-pointer">
          <div onClick={toggleAutoFileId} className={`w-9 h-5 rounded-full peer after:content-[''] after:absolute after:top-1/2 after:left-[0.1875rem] after:-translate-y-1/2 after:bg-white after:border-gray-300 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all ${autoFileId ? 'after:translate-x-4 bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      </div>


      <label htmlFor="fileId">File Id:</label>
      <input type="text" id='fileId' ref={fileIdRef} className='border rounded' onKeyDown={verifyFileId} disabled={autoFileId} required />

      <label htmlFor="password">Password:</label>
      <input type="password" id='password' ref={password} className='border rounded' autoComplete="new-password" />

      <button type="submit" disabled={upPercent && link !== 'error'} className='col-span-2 border border-black rounded bg-gray-100 disabled:opacity-50' onClick={() => { if (link === 'error') reset() }}>Upload</button>
      {link && link !== 'error' && <button type="reset" className='col-span-2 border border-black rounded bg-gray-100' onClick={() => setTimeout(() => reset(), 0)}>Reset</button>}
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

    {link && link != 'error' && <FileInfo fileId={link} />}
  </div >
}