import React, { useEffect, useState } from 'react'
import { useFileContext } from '../contexts/ContextProvider'
import FileInfo from './FileInfo'
import QrReader from 'react-qr-scanner'
import { toast } from 'react-toastify'

export default function Modal() {
  const { router, token, modal, setModal, deleteUser, deleteFile, clearHistory, verifyUrl } = useFileContext()
  const { fileId, filter, downloadCount } = modal.props || {}
  const handleCancel = () => setModal({ active: false })
  const [error, setError] = useState(false)

  function handleQrScan(value) {
    if (!value) return
    const { verified, pathname } = verifyUrl(value.text)
    if (!verified) return setError(true)
    setModal({ active: false })
    toast.success('Successfuly scanned the QR Code')
    router.push(pathname)
  }

  useEffect(() => { setError(false) }, [modal.type])

  return <>
    <div className={`${modal.active ? 'bg-opacity-50' : 'invisible bg-opacity-0'} bg-black fixed inset-0 transition-all duration-700 z-40`} onClick={handleCancel} />
    <div className={`z-50 center text-center bg-white rounded-md w-max py-5 ${modal.type === 'showFile' ? 'px-1' : 'px-5'} ${modal.active ? 'opacity-100' : 'hidden'}`}>
      {modal.type === 'deleteUser' ?
        <div>
          <h3 className='font-bold'>Delete account?</h3>
          <p className='text-red-600 text-sm'>This action is irreversible</p>
          <div className='space-x-4 mt-6 text-sm'>
            <button className='py-1 px-3 rounded border button-animation' onClick={() => deleteUser(token)}>Yes</button>
            <button className='py-1 px-3 rounded border button-animation' onClick={handleCancel}>No</button>
          </div>
        </div> :
        modal.type === 'deleteFile' ? <div>
          <h3 className='font-bold'>Delete file?</h3>
          <p className='text-red-600 text-sm'>This action is irreversible</p>
          <div className='space-x-4 mt-6 text-sm'>
            <button className='py-1 px-3 rounded border button-animation' onClick={() => deleteFile(fileId)}>Yes</button>
            <button className='py-1 px-3 rounded border button-animation' onClick={handleCancel}>No</button>
          </div>
        </div> :
          modal.type === 'clearHistory' ? <div>
            <h3 className='font-bold'>Clear file from history?</h3>
            <p className='text-red-600 text-sm'>This action is irreversible</p>
            <div className='space-x-4 mt-6 text-sm'>
              <button className='py-1 px-3 rounded border button-animation' onClick={() => {
                setModal({ active: false })
                clearHistory(fileId, 'download')
              }}>Yes</button>
              <button className='py-1 px-3 rounded border button-animation' onClick={handleCancel}>No</button>
            </div>
          </div> : modal.type === 'showFile' ? <FileInfo fileId={fileId} filter={filter} downloadCount={downloadCount} modal={true} /> : modal.type === 'qrReader' && <div className='text-center h-[50vh] aspect-square max-w-[80vw]'>
            {error ? 'Please scan a valid QR Code' : 'Scan QR Code using camera'}
            <QrReader onError={() => toast.error('Device or browser not supported')} onScan={handleQrScan} className='mt-2 w-full h-[90%] rounded-sm' />
          </div>}
    </div>
  </>
}
