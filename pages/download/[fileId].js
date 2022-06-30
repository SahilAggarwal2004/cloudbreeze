import React, { useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function FileId() {
  const router = useRouter()
  const { fileId } = router.query
  const password = useRef()

  async function downloadFile(event) {
    event.preventDefault()
    try {
      const { data: { path, name } } = await axios.post(`${process.env.NEXT_PUBLIC_API}file/${fileId}`, { pass: password.current.value })
      const pathList = path.split('/')
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API}download/${pathList[pathList.length - 1]}`,
        responseType: 'blob', // important for downlaoding file
      })
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = name; // giving default name to download prompt
      link.click();
    } catch (error) { console.log(error.response.data) }
  }

  return <div className='flex h-screen w-screen justify-center items-center'>
    <form onSubmit={downloadFile} className="grid grid-cols-[auto_1fr] max-w-[400px] gap-3 place-content-center">
      <label htmlFor="password">Password (if any):</label>
      <input type="password" id='password' ref={password} className='border rounded' />
      <button type="submit" className='col-span-2 border border-black rounded bg-gray-100'>Download</button>
    </form>
  </div>
}