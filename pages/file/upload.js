/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import Loader from '../../components/Loader';
import Info from '../../components/Info';
import { useFileContext } from '../../contexts/ContextProvider';
import { limit, options } from '../../constants';
import BarProgress from '../../components/BarProgress';
import { fileDetails, getUploadUrl, remove } from '../../modules/functions';
import Head from 'next/head';
import { randomElement } from 'random-stuff-js';
import { Storage } from 'megajs'

export default function Upload({ router }) {
	const { fetchApp, files, setFiles, uploadFiles, setUploadFiles, type } = useFileContext()
	const { share } = router.query
	const storage = useRef()
	const fileIdRef = useRef()
	const password = useRef()
	const daysLimit = useRef()
	const downloadLimit = useRef()
	const [link, setLink] = useState()
	const [progress, setProgress] = useState(-1)
	const isUploading = progress >= 0
	const isUploaded = link && link !== 'error'
	const maxDaysLimit = type === 'premium' ? 365 : type === 'normal' ? 30 : 3
	const length = files.length

	const verifyFileId = e => e.target.value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "")
	const verifyDownloadLimit = e => e.target.value = Math.abs(e.target.value) || ''
	const verifyDaysLimit = e => e.target.value = Math.min(Math.abs(e.target.value), maxDaysLimit) || ''

	function handleMessage({ data: { files } }) {
		setFiles(files)
		if (fileDetails(files).totalSize > limit * 1048576) router.push('/p2p?share=true')
	}

	async function initStorage() {
		try {
			const sto = await new Storage({ email: process.env.NEXT_PUBLIC_MEGA_EMAIL, password: process.env.NEXT_PUBLIC_MEGA_PASSWORD, userAgent: null }).ready
			storage.current = sto
			const worker = new Worker('/workers/upload.js')
			worker.postMessage(new Blob(sto))
		} catch (e) { console.log(e); await initStorage() }
	}

	async function updateFile(e) {
		const { files } = e.target
		const size = fileDetails(files).totalSize
		if (!size) {
			e.target.value = "";
			return toast.warning('Empty file(s)');
		}
		if (size > limit * 1048576) { // size limit
			// toast('Try Peer-to-peer transfer for big files')
			// setFiles(files)
			// return router.push('/p2p?share=true')
		}
		setFiles(files)
	}

	function reset() {
		// Don't remove the setTimeout as file reset doesn't work without it
		setTimeout(() => {
			setFiles([])
			setLink()
			setProgress(-1)
		}, 0);
	}

	function trackProgress(total) {
		console.log(window.performance.getEntries().length, window.performance.getEntriesByType('resource').length)
		const resources = window.performance.getEntriesByType('resource').filter(resource => resource.name.includes('userstorage.mega.co.nz'))
		const bytes = +resources.at(-1)?.name?.split('/')?.at(-1)
		if (bytes) setProgress(Math.floor(bytes / total * 100))
	}

	async function uploadFile(file, zip = false) {
		try {
			if (zip) {
				var name = `cloudbreeze${Date.now()}.zip`
				var size = file.byteLength
				var arrayBuffer = file
			} else {
				name = file.name
				size = file.size
				arrayBuffer = new Uint8Array(await file.arrayBuffer())
			}
			var progress = setInterval(() => trackProgress(size), 250)
			if (!storage.current) await initStorage()
			const upload = await storage.current?.upload({ name, size }, arrayBuffer).complete
			clearInterval(progress)
			const link = await upload.link()
			return link
		} catch {
			clearInterval(progress)
			return uploadFile(file, zip)
		}
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setProgress(0)
		if (length === 1) var content = files[0]
		else {
			const jszip = new JSZip();
			for (let i = 0; i < length; i++) jszip.file(files[i].name, files[i])
			content = await jszip.generateAsync({ type: 'arraybuffer', compression: 'STORE' })
			var zip = true
		}

		const data = new FormData();
		data.append('files', content) // (attribute, value), this is the attribute that we will accept in backend as upload.single/array(attribute which contains the files) where upload is a multer function
		data.append('length', length)
		const nameList = []
		for (let i = 0; i < length; i++) nameList.push(files[i].name)
		if (fileId = fileIdRef.current.value) {
			if (options.includes(fileId)) {
				toast.warning(`File Id cannot be ${fileId}`);
				setProgress(-1)
				return
			}
			data.append('fileId', fileId)
		}
		if (length > 1) data.append('nameList', nameList)
		data.append('password', password.current.value)
		data.append('daysLimit', daysLimit.current.value)
		data.append('downloadLimit', downloadLimit.current.value)

		// let { success: verified, token, server, servers } = await fetchApp({ url: 'file/verify', method: 'POST', data: { fileId } })
		// if (!verified) return setProgress(-1)

		var fileId
		setLink(await uploadFile(content, zip))

		// while (!success) {
		// 	if (!servers.length) {
		// 		setLink('error')
		// 		setProgress(-1)
		// 		return
		// 	}
		// 	var { fileId, name, success } = await fetchApp({
		// 		url: getUploadUrl(server), method: 'POST', data, type: 'multipart/form-data', token,
		// 		showToast: servers.length === 1 || 'success', options: {
		// 			onUploadProgress: ({ loaded, total }) => setProgress(Math.round(loaded * 100 / total))
		// 		}
		// 	})
		// 	remove(servers, server)
		// 	server = randomElement(servers)
		// }
		// setLink(fileId)
		// setUploadFiles(uploadFiles.concat({ _id: fileId, name, nameList, downloadCount: 0, createdAt: Date.now(), daysLimit: daysLimit.current.value || maxDaysLimit }))
	}

	useEffect(() => {
		initStorage()
		if (!share) setFiles([])
		navigator.serviceWorker?.addEventListener('message', handleMessage)
		return () => {
			storage.current?.close()
			navigator.serviceWorker?.removeEventListener('message', handleMessage)
		}
	}, [])

	useEffect(() => { isUploaded && window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) }, [link])

	return <>
		<Head><title>Upload a file | CloudBreeze</title></Head>
		<div className='flex flex-col space-y-5 justify-center items-center px-4 pb-5 text-sm sm:text-base'>
			<form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] gap-3 items-center">
				<label htmlFor="files">File(s):</label>
				{share && length ? <div>{length > 1 ? `${length} files` : files[0]?.name} selected</div>
					: <input type="file" id='files' onChange={updateFile} disabled={isUploading} required multiple />}

				<label htmlFor="file-id">File Id: </label>
				<input type="text" id='file-id' ref={fileIdRef} onInput={verifyFileId} disabled={isUploading} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete='off' placeholder='Auto' maxLength={30} />

				<label htmlFor="password">Password:</label>
				<input type="password" id='password' ref={password} disabled={isUploading} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="new-password" placeholder='No protection' />

				<label htmlFor="days-limit">Days Limit:</label>
				<input type="number" id='days-limit' ref={daysLimit} onInput={verifyDaysLimit} disabled={isUploading} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="off" placeholder={`${maxDaysLimit} (max)`} min={1} max={maxDaysLimit} />

				<label htmlFor="download-limit">Download Limit:</label>
				<input type="number" id='download-limit' ref={downloadLimit} onInput={verifyDownloadLimit} disabled={isUploading} className='border rounded px-2 py-0.5 placeholder:text-sm' autoComplete="off" placeholder='No limit' min={1} />

				<button type="submit" disabled={isUploading} className='primary-button'>Upload</button>
				{isUploaded && <button type="reset" className='col-span-2 py-1 border border-black rounded bg-gray-100 font-medium text-gray-800' onClick={reset}>Reset</button>}
			</form>

			{!link && (progress === 100 ? <Loader className='flex items-center space-x-2' text='Please wait, processing the file(s)...' /> : <BarProgress percent={progress} />)}

			{isUploaded && <div className='pb-16'><Info fileId={link} /></div>}
		</div>
	</>
}