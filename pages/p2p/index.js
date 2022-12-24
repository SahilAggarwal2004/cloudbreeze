/* eslint-disable react-hooks/exhaustive-deps */
import JSZip from 'jszip';
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Info from '../../components/Info';
import Peer from '../../components/Peer';
import { useFileContext } from '../../contexts/ContextProvider';
import { generateId } from '../../modules/functions';

function reducer(state, { type = 'add', peer, data }) {
	switch (type) {
		case 'add':
			return { ...state, [peer]: data }
		case 'remove':
			const newState = {}
			Object.entries(state).filter(conn => conn[0] !== peer).forEach(conn => newState[conn[0]] = conn[1])
			return newState
		default:
			return state
	}
}

export default function P2p({ router }) {
	const { setModal, setProgress } = useFileContext()
	const room = useRef();
	const [files, setFiles] = useState()
	const [roomId, setRoomId] = useState('')
	const [link, setLink] = useState('')
	const [share, setShare] = useState()
	const [connections, dispatchConnections] = useReducer(reducer, {})
	const connArr = Object.entries(connections)
	const isReady = link && link !== 'error'

	const verifyRoomId = event => setRoomId(event.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
	const reset = event => {
		event.preventDefault()
		window.location.reload()
	}

	function enterRoom(event) {
		event?.preventDefault()
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
		const name = file.name || `cloudbreeze_${peerId}.zip`
		const size = file.size
		setProgress(100 / 3)
		const peer = new Peer(peerId, { host: 'cloudbreeze-peer.onrender.com', secure: true })
		peer.on('open', id => {
			setLink(id)
			setProgress(100)
		})
		peer.on('connection', conn => {
			const peerName = conn.metadata || 'Anonymous User'
			conn.on('open', () => {
				if (connections[peerName]) return
				conn.send({ name, size, type: 'details' })
				dispatchConnections({ peer: peerName, data: { file, name, size, conn } })
				toast.success(`${peerName} connected`)
			})
			conn.on('close', () => {
				dispatchConnections({ type: 'remove', peer: peerName })
				toast.error(`${peerName} disconnected`)
			})
		})
		peer.on('error', () => setProgress(100))
		peer.on('close', reset)
	}

	useEffect(() => {
		navigator.serviceWorker?.addEventListener('message', ({ data: { files } }) => {
			setFiles(files)
			setShare(true)
		})
	}, [])

	return <div className='space-y-12'>
		<div className='grid grid-cols-1 md:grid-cols-[50fr_0fr_50fr] items-center my-10 gap-x-4 gap-y-8 px-4 pb-5 text-sm sm:text-base'>
			<form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 items-center mx-auto">
				<label htmlFor="files">File(s):</label>
				{share ? <div>{files.length > 1 ? `${files.length} files` : files[0]?.name} selected</div>
					: <input type="file" id='files' disabled={isReady} required onChange={event => setFiles(event.target.files)} multiple />}
				<label htmlFor="room-id">Room Id: </label>
				<input type="text" id='room-id' value={roomId} disabled={isReady} className='border rounded px-2 py-0.5 placeholder:text-sm' onChange={verifyRoomId} autoComplete='off' placeholder='Auto' maxLength={30} />
				<button type="submit" disabled={isReady} className='primary-button'>Share</button>
				{isReady && <button type="reset" className='col-span-2 py-1 border border-black rounded bg-gray-100 font-medium text-gray-800' onClick={reset}>Reset</button>}
			</form>
			<div className='md:h-[calc(100%+2.5rem)] p-0 m-0 border-[0.5px] border-black col-span-1' />
			{isReady ? <Info roomId={link} /> : <div className='flex flex-col items-center space-y-5'>
				<form onSubmit={enterRoom} className="grid grid-cols-[auto_1fr] gap-3 items-center">
					<label htmlFor="fileId">Room Id or Link:</label>
					<input type="text" id='fileId' ref={room} className='border rounded px-2 py-0.5' required autoComplete='off' />
					<button type="submit" className='primary-button'>Receive</button>
				</form>
				<div className='text-center'>
					<div className='font-bold mb-3'>OR</div>
					<div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => setModal({ active: true, type: 'qrReader' })}>
						<FaQrcode />
						<span>Scan a QR Code</span>
					</div>
				</div>
			</div>}
		</div>
		{Boolean(connArr.length) && <div className='space-y-8'>
			<h2 className='text-lg md:text-xl font-medium text-center'>Active Users</h2>
			<div className='flex items-center justify-center space-x-5 pb-10 mx-5'>
				{connArr.map(conn => <Peer key={conn[0]} peer={conn[0]} data={conn[1]} />)}
			</div>
		</div>}
	</div>
}