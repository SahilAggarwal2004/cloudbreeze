/* eslint-disable react-hooks/exhaustive-deps */
import JSZip from 'jszip';
import React, { useRef, useState } from 'react'
import { FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Info from '../../components/Info';
import { useFileContext } from '../../contexts/ContextProvider';
import { generateId } from '../../modules/functions';

export default function P2p({ router, share }) {
	const { setModal } = useFileContext()
	const room = useRef();
	const [files, setFiles] = useState()
	const [roomId, setRoomId] = useState('')
	const [link, setLink] = useState('')
	const [upPercent, setUpPercent] = useState(-1)
	const [connections, setConnections] = useState({})
	const isUploaded = link && link !== 'error'
	const verifyRoomId = event => setRoomId(event.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))

	function enterRoom(event) {
		event.preventDefault()
		router.push(generateId(`/p2p/${room.current.value}`))
	}

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
		const peerId = roomId || Date.now()
		const peer = new Peer(peerId, { host: 'cloudbreeze-peer.onrender.com' })
		peer.on('open', id => setLink(`${window.location.href}/${id}`))
		peer.on('connection', conn => {
			const peerName = conn.peer.split('-')[0]
			conn.on('open', () => {
				conn.send({ name: file.name || `cloudbreeze_${peerId}.zip`, size: file.size, type: 'details' })
				toast.success(`${peerName} connected`)
			})
			conn.on('close', () => {
				delete connections[peerName]
				setConnections(connections)
				toast.error(`${peerName} disconnected`)
			})
			conn.on('data', ({ type }) => {
				if (type !== 'request' || connections.includes(peerName)) return
				setConnections(old => ({ ...old, [peerName]: conn }))
				toast.success(`Transferring file to ${peerName}`)
				conn.send({ file, name: file.name || `cloudbreeze_${peerId}.zip`, size: file.size, type: 'file' })
			})
		})
	}

	return <div className='grid grid-cols-1 md:grid-cols-[50fr_0fr_50fr] items-center my-10 gap-4 px-4 pb-5 text-sm sm:text-base'>
		<form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 items-center mx-auto">
			<label htmlFor="files">File(s):</label>
			{share ? <div>{files.length > 1 ? `${files.length} files` : files[0]?.name} selected</div>
				: <input type="file" id='files' disabled={isUploaded} required onChange={event => setFiles(event.target.files)} multiple />}
			<label htmlFor="room-id">Room Id: </label>
			<input type="text" id='room-id' value={roomId} disabled={isUploaded} className='border rounded px-2 py-0.5 placeholder:text-sm' onChange={verifyRoomId} autoComplete='off' placeholder='Auto' maxLength={30} />
			<button type="submit" disabled={isUploaded} className='col-span-2 mt-5 py-1 border border-black rounded bg-gray-100 disabled:opacity-50 font-medium text-gray-800'>Share</button>
			{isUploaded && <button type="reset" className='col-span-2 py-1 border border-black rounded bg-gray-100 font-medium text-gray-800' onClick={() => window.location.reload()}>Reset</button>}
		</form>
		<div className='w-0 h-[calc(100%+2.5rem)] p-0 m-0 border-[0.5px] border-black col-span-1' />
		{isUploaded ? <Info roomId={link} /> : <div className='flex flex-col items-center space-y-5'>
			<form onSubmit={enterRoom} className="grid grid-cols-[auto_1fr] gap-3 items-center">
				<label htmlFor="fileId">Room Id or Link:</label>
				<input type="text" id='fileId' ref={room} className='border rounded px-2 py-0.5' required autoComplete='off' />
				<button type="submit" className='col-span-2 mt-3 py-1 border border-black rounded bg-gray-100 disabled:opacity-50 font-medium text-gray-800'>Receive</button>
			</form>
			<div className='text-center'>
				<div className='font-bold mb-3'>OR</div>
				<div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => setModal({ active: true, type: 'qrReader' })}>
					<FaQrcode />
					<span>Scan a QR Code</span>
				</div>
			</div>
		</div>}
	</div >
}