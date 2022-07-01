import axios from 'axios'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify';

export default function Home() {
  const password = useRef()
  const [file, setFile] = useState()
  const [link, setLink] = useState()
  const [upPercent, setUpPercent] = useState(0)

  function updateFile(event) { setFile(event.target.files[0]) }

  function reset() {
    setLink();
    setUpPercent(0);
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const data = new FormData();
    data.append('file', file) // FormData has some default attributes, one of them is file which stores a file
    if (password) data.append('password', password.current.value) // There is no default attribute named 'password' in FormData, so it will append normally as a key of body object in fetch or data object in axios

    try {
      const { data: fileId } = await axios.post(`${process.env.NEXT_PUBLIC_API}upload/file`, data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: ({ loaded, total }) => setUpPercent(Math.round((loaded * 100) / total))
        })
      toast.success('File uploaded successfully!')
      setLink(fileId)
    } catch (error) {
      toast.error('Some error occurred...')
      console.log(error.response.data)
    }
  }

  return <div className='max-w-[400px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-5 justify-center items-center px-2'>
    <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 place-content-center">
      <label htmlFor="file">File:</label>
      <input type="file" id='file' required onChange={updateFile} />
      <label htmlFor="password">Password:</label>
      <input type="password" id='password' ref={password} className='border rounded' />
      <button type="submit" disabled={upPercent} className='col-span-2 border border-black rounded bg-gray-100 disabled:opacity-50'>Upload</button>
      {link && <button type="reset" className='col-span-2 border border-black rounded bg-gray-100' onClick={() => setTimeout(() => reset(), 0)}>Reset</button>}
    </form>

    {Boolean(upPercent) && <div className='w-full flex items-center justify-evenly'>
      <div className='bg-gray-300 rounded-full h-1 w-4/5'>
        <div className={`bg-green-500 rounded-full h-1`} style={{ width: `${upPercent}%` }} />
      </div>
      {upPercent}%
    </div>}

    {link && <Link href={`/download/${link}`}>Click here to download the file</Link>}
  </div >
}
