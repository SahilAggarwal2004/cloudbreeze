/* eslint-disable react-hooks/exhaustive-deps */
// import Peer from 'peerjs'
import JSZip from 'jszip';
import React, { useEffect, useState } from 'react'

export default function New() {
  const reset = () => { }
  const [files, setFiles] = useState()
  const [roomId, setRoomId] = useState('')
  const [connections, setConnections] = useState([])
  const share = false;
  const disabled = false

  const verifyRoomId = event => setRoomId(event.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))

  async function handleSubmit(event) {
    event.preventDefault()
    let file;
    if (files.length === 1) file = files[0]
    else {
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) zip.file(files[i].name, files[i])
      file = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    }
    const Peer = require("peerjs").default
    const peer = new Peer(`${roomId || 'a'}-cloudbreeze`)
    peer.on('open', id => console.log(id))
    peer.on('connection', conn => {
      console.log('connected')
      conn.on('open', () => {
        console.log('Miracle?')
        // conn.send({ file, name: file.name, size: file.size, type: 'details' })
      })
      conn.on('error', e => console.log(e))
      conn.on('close', () => console.log('closed'))
      conn.on('data', data => {
        console.log(data)
        if (data.type !== 'request') return
        conn.send({ file, name: file.name, size: file.size, type: 'file' })
        // setConnections(old => ([...old, conn.peer]))
      })
    })
  }

  useEffect(() => { }, [])

  // useEffect(() => console.log(connections), [connections])

  return <div className='flex flex-col space-y-5 justify-center items-center px-4 pb-5 text-sm sm:text-base'>
    <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 items-center">
      <label htmlFor="files">File(s):</label>
      {share ? <div>{files.length > 1 ? `${files.length} files` : files[0]?.name} selected</div>
        : <input type="file" id='files' disabled={disabled} required onChange={event => setFiles(event.target.files)} multiple />}

      <label htmlFor="room-id">Room Id: </label>
      <input type="text" id='room-id' value={roomId} disabled={disabled} className='border rounded px-2 py-0.5 placeholder:text-sm' onChange={verifyRoomId} autoComplete='off' placeholder='Auto' maxLength={30} />

      <button type="submit" disabled={disabled} className='col-span-2 mt-5 py-1 border border-black rounded bg-gray-100 disabled:opacity-50 font-medium text-gray-800'>Share</button>
      {/* {link && link !== 'error' && <button type="reset" className='col-span-2 py-1 border border-black rounded bg-gray-100 font-medium text-gray-800' onClick={() => setTimeout(() => reset(), 0)}>Reset</button>} */}
    </form>

    {/* {Boolean(upPercent) && link != 'error' && <div className='w-full flex items-center justify-evenly max-w-[400px]'>
      <div className='bg-gray-300 rounded-full h-1 w-4/5'>
        <div className='bg-green-500 rounded-full h-1' style={{ width: `${upPercent}%` }} />
      </div>
      {upPercent}%
    </div>}

    {upPercent == 100 && !link && <div className='flex items-center space-x-2'>
      <Loader />
      <div>Please wait, processing the file(s)...</div>
    </div>}

    {link && link !== 'error' && <div className='pb-16'><FileInfo fileId={link} /></div>} */}
  </div >
}