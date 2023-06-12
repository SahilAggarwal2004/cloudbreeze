/* eslint-disable react-hooks/exhaustive-deps */
import Head from 'next/head';
import { useEffect, useReducer, useRef, useState } from 'react'
import { FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Info from '../../components/Info';
import Peer from '../../components/Peer';
import { peerOptions } from '../../constants';
import { useFileContext } from '../../contexts/ContextProvider';
import { fileDetails, generateId } from '../../modules/functions';

function reducer(state, { type = 'add', peer, name, conn }) {
	switch (type) {
		case 'add':
			return { ...state, [peer]: { name, conn } }
		case 'remove':
			const newState = {}
			Object.entries(state).filter(conn => conn[0] !== peer).forEach(conn => newState[conn[0]] = conn[1])
			return newState
		default:
			return state
	}
}

export default function P2p({ router }) {
	const { setModal, progress, setProgress, files, setFiles } = useFileContext()
	const { share } = router.query
	const shareRoom = useRef();
	const receiveRoom = useRef();
	const textRef = useRef();
	const peerRef = useRef();
	const [link, setLink] = useState('')
	const [connections, dispatchConnections] = useReducer(reducer, {})
	const connArr = Object.entries(connections)
	const disable = progress > 0 || link
	const { names, sizes, totalSize } = fileDetails(files);
	const length = files.length

	const verifyRoomId = e => e.target.value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "")

	function reset() {
		peerRef.current?.destroy()
		setTimeout(() => setLink(''), 0)
	}

	function enterRoom(event) {
		event?.preventDefault()
		router.push(`/p2p/${generateId(receiveRoom.current.value, 'p2p')}`)
	}

	async function handleSubmit(e) {
		e.preventDefault()
		const text = textRef.current.value
		if (!length && !text) return toast.error('Please provide files or text to share!')
		setProgress(100 / 8)
		const Peer = require("peerjs").default
		const peerId = shareRoom.current.value || Date.now()
		setProgress(100 / 3)
		const peer = new Peer(peerId, peerOptions)
		peerRef.current = peer;
		peer.on('open', id => {
			setLink(id)
			setProgress(100)
		})
		peer.on('connection', conn => {
			const peer = conn.peer
			const peerName = conn.metadata || 'Anonymous User'
			conn.on('open', () => {
				if (connections[peerName]) return
				conn.send({ name: names[0], length: names.length, totalSize, text, type: 'details' })
				dispatchConnections({ peer, name: peerName, conn })
				toast.success(`${peerName} connected`)
			})
			conn.on('close', () => {
				dispatchConnections({ type: 'remove', peer })
				toast.error(`${peerName} disconnected`)
			})
		})
		peer.on('error', ({ type }) => {
			toast.error(type === 'network' ? 'Reconnecting...' : type === 'unavailable-id' && 'Room busy. Try another!')
			setProgress(100)
		})
		peer.on('disconnected', () => setTimeout(() => !peer.destroyed && peer.reconnect(), 1000))
	}

	useEffect(() => {
		if (!share) setFiles([])
		return reset
	}, [])

	return <>
		<Head><title>Peer-to-peer transfer | CloudBreeze</title></Head>
		<div className='space-y-12'>
			<div className='grid grid-cols-1 md:grid-cols-[50fr_0fr_50fr] items-center my-10 gap-x-4 gap-y-8 px-4 pb-5 text-sm sm:text-base'>
				<form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 items-center mx-auto">
					<label htmlFor="files">File(s):</label>
					{share && length ? <div>{length > 1 ? `${length} files` : files[0]?.name} selected</div>
						: <input type="file" id='files' onChange={e => setFiles(e.target.files)} disabled={disable} multiple />}
					<label htmlFor="text" className='self-start pt-1 sm:pt-0.5'>Text: </label>
					<textarea id='text' ref={textRef} disabled={disable} className='border rounded px-2 py-0.5 placeholder:text-sm' placeholder='Text / Description (Optional)' rows='3' />
					<label htmlFor="room-id">Room Id: </label>
					<input type="text" id='room-id' ref={shareRoom} onInput={verifyRoomId} disabled={disable} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete='off' placeholder='Auto' maxLength={30} />
					<button type="submit" disabled={disable} className='primary-button'>Share</button>
					{link && <button type="reset" className='col-span-2 py-1 border border-black rounded bg-gray-100 font-medium text-gray-800' onClick={reset}>Reset</button>}
				</form>
				<div className='md:h-[calc(100%+2.5rem)] p-0 m-0 border-[0.5px] border-black col-span-1' />
				{link ? <Info roomId={link} /> : <div className='flex flex-col items-center space-y-5'>
					<form onSubmit={enterRoom} className="grid grid-cols-[auto_1fr] gap-3 items-center">
						<label htmlFor="fileId">Room Id or Link:</label>
						<input type="text" id='fileId' ref={receiveRoom} onInput={verifyRoomId} className='border rounded px-2 py-0.5' required autoComplete='off' />
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
			{Boolean(files.length && connArr.length) && <div className='space-y-8'>
				<h2 className='text-lg md:text-xl font-medium text-center'>Active Users</h2>
				<div className='flex items-center justify-center gap-5 pb-10 mx-5 flex-wrap'>
					{connArr.map(conn => <Peer key={conn[0]} data={conn[1]} names={names} sizes={sizes} totalSize={totalSize} />)}
				</div>
			</div>}
		</div>
	</>
}