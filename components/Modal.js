import { showModal } from '../constants'
import { useFileContext } from '../contexts/ContextProvider'
import Info from './Info'
import QrScanner from './QrScanner'

export default function Modal({ pathname, redirect }) {
	const { modal: { active, type, allowed, props }, setModal, setProgress, fetchApp, logout, setUploadFiles } = useFileContext()
	const { fileId, filter, downloadCount } = props || {}
	const handleCancel = () => setModal({ active: false })

	async function deleteFile(fileId) {
		setModal({ active: false })
		const { success, files } = await fetchApp({ url: `file/delete/${fileId}`, method: 'DELETE' })
		if (!success) return
		setUploadFiles(files)
	}

	async function deleteUser() {
		setModal({ active: false })
		setProgress(100 / 3)
		const { success, error } = await fetchApp({ url: 'auth/delete', method: 'DELETE' })
		setProgress(100)
		if (success || error === 'User not found!') logout('auto')
	}

	return showModal.includes(pathname) && <>
		<div className={`${active ? 'bg-opacity-50' : 'invisible bg-opacity-0'} bg-black fixed inset-0 transition-all duration-700 z-40`} onClick={handleCancel} />
		<div className={`z-50 w-max max-w-[90vw] max-h-[98vh] overflow-y-auto center text-center bg-white rounded-md py-4 ${type === 'showFile' ? 'px-1' : 'px-3'} ${active ? 'opacity-100' : 'hidden'}`}>
			{type === 'deleteUser' ? <div>
				<h3 className='font-bold'>Delete account?</h3>
				<p className='text-red-600 text-sm'>This action is irreversible</p>
				<div className='space-x-4 mt-6 text-sm'>
					<button className='py-1 px-3 rounded border button-animation' onClick={deleteUser}>Yes</button>
					<button className='py-1 px-3 rounded border button-animation' onClick={handleCancel}>No</button>
				</div>
			</div> : type === 'deleteFile' ? <div>
				<h3 className='font-bold'>Delete file?</h3>
				<p className='text-red-600 text-sm'>This action is irreversible</p>
				<div className='space-x-4 mt-6 text-sm'>
					<button className='py-1 px-3 rounded border button-animation' onClick={() => deleteFile(fileId)}>Yes</button>
					<button className='py-1 px-3 rounded border button-animation' onClick={handleCancel}>No</button>
				</div>
			</div> : type === 'showFile' ? <Info fileId={fileId} filter={filter} downloadCount={downloadCount} modal={true} /> : type === 'qrReader' && <QrScanner redirect={redirect} />}
		</div>
	</>
}