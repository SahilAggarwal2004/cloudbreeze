import axios from 'axios'
import Link from 'next/link'
import { useRef, useState } from 'react'

export default function Home() {
  const password = useRef()
  const [file, setFile] = useState()
  const [link, setLink] = useState()

  function updateFile(event) { setFile(event.target.files[0]) }

  async function handleSubmit(event) {
    event.preventDefault()
    const data = new FormData();
    data.append('file', file) // FormData has some default attributes, one of them is file which stores a file
    if (password) data.append('password', password.current.value) // There is no default attribute named 'password' in FormData, so it will append normally as a key of body object in fetch or data object in axios

    try {
      const { data: fileId } = await axios.post(`${process.env.NEXT_PUBLIC_API}upload/file`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setLink(fileId)
    } catch (error) { console.log(error.response.data) }
  }

  return <div className='flex h-screen w-screen justify-center items-center'>
    <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] max-w-[400px] gap-3 place-content-center">
      <label htmlFor="file">File:</label>
      <input type="file" id='file' required onChange={updateFile} />
      <label htmlFor="password">Password:</label>
      <input type="password" id='password' ref={password} className='border rounded' />
      <button type="submit" className='col-span-2 border border-black rounded bg-gray-100'>Share</button>
      {link && <a className='col-span-2 text-center'><Link href={`/download/${link}`}>Click here to download the file</Link></a>}
    </form>
  </div>
}
