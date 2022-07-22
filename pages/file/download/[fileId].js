/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState } from 'react';
import { File } from 'megajs';
import download from '../../../utilities/download';
import Loader from '../../../components/Loader';
import { useFileContext } from '../../../contexts/ContextProvider';

export default function FileId() {
  const { router, token, downloadFiles, setDownloadFiles, fetchApp } = useFileContext()
  const { fileId } = router.query
  const password = useRef()
  const [downPercent, setDownPercent] = useState(0)
  const [loading, setLoading] = useState(false)

  async function downloadFile(event) {
    event.preventDefault()
    setLoading(true)
    setDownPercent(0)
    const { link, name, createdAt, error } = await fetchApp({ url: `file/get/${fileId}`, method: 'POST', data: { pass: password.current.value }, authtoken: token })
    if (!error) {
      const file = File.fromURL(link)
      const stream = file.download();
      let dataList = [];
      stream.on('data', data => dataList = dataList.concat(Array.from(data)))
      stream.on('progress', ({ bytesLoaded, bytesTotal }) => {
        setDownPercent(Math.round((bytesLoaded * 100) / bytesTotal))
        if (bytesLoaded == bytesTotal) {
          setLoading(false)
          const data = new Uint8Array(dataList)
          download(data, name)
          const updatedFiles = downloadFiles.concat({ nameList: [name], fileId, createdAt })
          setDownloadFiles(updatedFiles)
        }
      })
    } else setLoading(false)
  }

  return <div className='flex flex-col space-y-5 justify-center items-center px-4 pb-5'>
    <form onSubmit={downloadFile} className="grid grid-cols-[auto_1fr] gap-3 place-content-center">
      <label htmlFor="password">Password (if any):</label>
      <input type="password" id='password' ref={password} className='border rounded' />
      <button type="submit" disabled={downPercent && downPercent != 100} className='col-span-2 py-0.5 border border-black rounded bg-gray-100 disabled:opacity-50'>{downPercent == 100 ? 'Download Again' : 'Download'}</button>
    </form>

    {Boolean(downPercent) ? <div className='w-full flex items-center justify-evenly max-w-[400px]'>
      <div className='bg-gray-300 rounded-full h-1 w-4/5'>
        <div className='bg-green-500 rounded-full h-1' style={{ width: `${downPercent}%` }} />
      </div>
      {downPercent}%
    </div> : loading && <div className='flex items-center space-x-2'>
      <Loader />
      <div>Please wait, accessing the file(s)...</div>
    </div>}
  </div>
}