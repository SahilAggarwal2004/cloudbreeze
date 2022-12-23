/* eslint-disable react-hooks/exhaustive-deps */
import JSZip from 'jszip';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

export default function P2p(props) {
  const [files, setFiles] = useState()
  const [roomId, setRoomId] = useState('')
  const [link, setLink] = useState('')
  const [upPercent, setUpPercent] = useState(-1)
  const [connections, setConnections] = useState([])
  const [share, setShare] = useState(props.share)
  const isUploading = link && link !== 'error' && upPercent >= 0
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
    const peer = new Peer(roomId || Date.now(), { host: 'cloudbreeze-peer.onrender.com' })
    peer.on('open', id => setLink(`${window.location.href}/${id}`))
    peer.on('connection', conn => {
      const peerName = conn.peer.split('-')[0]
      conn.on('open', () => conn.send({ name: file.name, size: file.size, type: 'details' }))
      conn.on('close', () => {
        setConnections(old => old.filter(name => name !== peerName))
        toast.error(`${peerName} disconnected`)
      })
      conn.on('data', ({ type }) => {
        if (type !== 'request') return
        setConnections(old => ([...old, peerName]))
        toast.success(`${peerName} connected`)
        conn.send({ file, name: file.name, size: file.size, type: 'file' })
      })
    })
  }

  function reset() {
    setRoomId('');
    setLink();
    setUpPercent(-1);
    setShare(false);
  }

  return <div className='flex flex-col space-y-5 justify-center items-center px-4 pb-5 text-sm sm:text-base'>
    <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 items-center">
      <label htmlFor="files">File(s):</label>
      {share ? <div>{files.length > 1 ? `${files.length} files` : files[0]?.name} selected</div>
        : <input type="file" id='files' disabled={isUploading} required onChange={event => setFiles(event.target.files)} multiple />}

      <label htmlFor="room-id">Room Id: </label>
      <input type="text" id='room-id' value={roomId} disabled={isUploading} className='border rounded px-2 py-0.5 placeholder:text-sm' onChange={verifyRoomId} autoComplete='off' placeholder='Auto' maxLength={30} />

      <button type="submit" disabled={isUploading} className='col-span-2 mt-5 py-1 border border-black rounded bg-gray-100 disabled:opacity-50 font-medium text-gray-800'>Share</button>
      {isUploading && <button type="reset" className='col-span-2 py-1 border border-black rounded bg-gray-100 font-medium text-gray-800' onClick={() => setTimeout(() => reset(), 0)}>Reset</button>}
    </form>
    {link}
  </div >
}