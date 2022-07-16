/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import Loader from '../components/Loader';
import Qr from '../components/Qr';
import { useFileContext } from '../context/ContextProvider';
import formidable from 'formidable';
import { readFileSync } from 'fs';

export default function Home(props) {
  const password = useRef()
  const { files, setFiles } = useFileContext()
  const [link, setLink] = useState()
  const [upPercent, setUpPercent] = useState(0)
  const [share, setShare] = useState(props.share)
  const [shareFile, setShareFile] = useState(props.shareFile)
  const [shareFileName, setShareFileName] = useState(props.shareFileName)
  const [shareFileSize, setShareFileSize] = useState(props.shareFileSize)

  function updateFile(event) {
    const { files } = event.target
    if (files.length > 10) {
      event.target.value = "";
      return toast.warning("Cannot select more than 10 files!");
    }
    let size = 0;
    for (let i = 0; i < files.length; i++) size += files[i].size
    if (size > 50 * 1048576) { // 50MB
      event.target.value = "";
      return toast.warning("Total file(s) size exceed 50MB!");
    }
    setFiles(files)
  }

  function reset() {
    setLink();
    setUpPercent(0);
    setShare(false);
    setShareFile();
    setShareFileName();
    setShareFileSize(0);
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
    if (share) data.append('shareFileName', shareFileName)
    if (password) data.append('password', password.current.value)

    try {
      const { data: fileId } = await axios.post(`${process.env.NEXT_PUBLIC_API}upload/files`, data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: ({ loaded, total }) => setUpPercent(Math.round((loaded * 100) / total))
        })
      toast.success('Files uploaded successfully!')
      setLink(fileId)
    } catch (error) {
      toast.error(error.response?.data || 'Some error occurred...')
      setLink('error')
    }
  }

  useEffect(() => {
    if (share) shareFileSize > 50 * 1048576 ? toast.warning("Total file(s) size exceed 50MB!") : setFiles([new Blob([new Uint8Array(shareFile)])])
  }, [])

  return <div className='flex flex-col space-y-5 justify-center items-center px-4 py-5'>
    <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 place-content-center">
      <label htmlFor="files">File(s):</label>
      {share ? <div>{shareFileName} selected</div>
        : <input type="file" id='files' required onChange={updateFile} multiple />}
      <label htmlFor="password">Password:</label>
      <input type="password" id='password' ref={password} className='border rounded' />
      <button type="submit" disabled={upPercent} className='col-span-2 border border-black rounded bg-gray-100 disabled:opacity-50'>Upload</button>
      {link && link != 'error' && <button type="reset" className='col-span-2 border border-black rounded bg-gray-100' onClick={() => setTimeout(() => reset(), 0)}>Reset</button>}
    </form>

    {Boolean(upPercent) && link != 'error' && <div className='w-full flex items-center justify-evenly max-w-[400px]'>
      <div className='bg-gray-300 rounded-full h-1 w-4/5'>
        <div className={`bg-green-500 rounded-full h-1`} style={{ width: `${upPercent}%` }} />
      </div>
      {upPercent}%
    </div>}

    {upPercent == 100 && !link && <div className='flex items-center space-x-2'>
      <Loader />
      <div>Please wait, processing the file(s)...</div>
    </div>}

    {link && link != 'error' && <div className='text-center space-y-2'>
      <Link href={`/download/${link}`}>Click here to download the file(s)</Link>
      <div className='font-bold'>OR</div>
      <Qr link={`${window.location.origin}/download/${link}`} />
    </div>}
  </div >
}

export async function getServerSideProps({ req, query }) {
  try {
    if (req.method !== 'POST' || !query.share) return { props: { share: false } }

    const form = new formidable.IncomingForm();
    const { files } = await new Promise((resolve, reject) => { // Promisifying form.parse
      form.parse(req, function (err, _fields, files) { err ? reject({ err }) : resolve({ files }); });
    });
    const shareFileObject = files?.files
    if (!shareFileObject) return { props: { share: false } }

    const data = readFileSync(shareFileObject.filepath) // buffer
    const shareFile = JSON.parse(JSON.stringify(data)).data // uint8array
    const { originalFilename: shareFileName, size: shareFileSize } = shareFileObject
    return { props: { share: true, shareFile, shareFileName, shareFileSize } }
  } catch (error) { console.log(error); return { props: { share: false } } }
}