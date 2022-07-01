/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { toast } from 'react-toastify';

export default function FileId() {
  const router = useRouter()
  const { fileId } = router.query
  const password = useRef()
  const [downPercent, setDownPercent] = useState(0)

  async function downloadFile(event) {
    event.preventDefault()
    try {
      const { data: { filename, originalname } } = await axios.post(`${process.env.NEXT_PUBLIC_API}file/${fileId}`, { pass: password.current.value })
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API}download/${filename}`,
        responseType: 'blob', // important for downloading file
        onDownloadProgress: ({ loaded, total }) => setDownPercent(Math.round((loaded * 100) / total))
      })
      toast.success('File downloaded successfully!')
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = originalname; // giving default name to download prompt
      link.click();
    } catch (error) {
      toast.error('Some error occurred...')
      console.log(error.response.data)
    }
  }

  return <div className='max-w-[400px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-5 justify-center items-center px-2'>
    <form onSubmit={downloadFile} className="grid grid-cols-[auto_1fr] gap-3 place-content-center">
      <label htmlFor="password">Password (if any):</label>
      <input type="password" id='password' ref={password} className='border rounded' />
      <button type="submit" disabled={downPercent && downPercent != 100} className='col-span-2 py-0.5 border border-black rounded bg-gray-100 disabled:opacity-50'>{downPercent == 100 ? 'Download Again' : 'Download'}</button>
    </form>
    {Boolean(downPercent) && <div className='w-full flex items-center justify-evenly'>
      <div className='bg-gray-300 rounded-full h-1 w-4/5'>
        <div className={`bg-green-500 rounded-full h-1`} style={{ width: `${downPercent}%` }} />
      </div>
      {downPercent}%
    </div>}
  </div>
}