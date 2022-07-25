import React from 'react'
import { useFileContext } from '../contexts/ContextProvider'
import FileInfo from './FileInfo'

export default function Modal() {
  const { token, modal, setModal, deleteUser, deleteFile } = useFileContext()
  const { fileId, filter } = modal.props || {}
  const handleCancel = () => setModal({ active: false })

  return <>
    <div className={`${modal.active ? 'bg-opacity-50' : 'invisible bg-opacity-0'} bg-black fixed inset-0 transition-all duration-700 z-40`} onClick={handleCancel} />
    <div className={`z-50 center text-center bg-white rounded-md w-max py-5 ${modal.type === 'showFile' ? 'px-1' : 'px-5'} ${modal.active ? 'opacity-100' : 'hidden'}`}>
      {modal.type === 'deleteUser' ?
        <div>
          <h3 className='font-bold'>Delete Account?</h3>
          <p className='text-red-600 text-sm'>This action is irreversible</p>
          <div className='space-x-4 mt-6 text-sm'>
            <button className='py-1 px-3 rounded border button-animation' onClick={() => deleteUser(token)}>Yes</button>
            <button className='py-1 px-3 rounded border button-animation' onClick={handleCancel}>No</button>
          </div>
        </div> :
        modal.type === 'deleteFile' ? <div>
          <h3 className='font-bold'>Delete File?</h3>
          <p className='text-red-600 text-sm'>This action is irreversible</p>
          <div className='space-x-4 mt-6 text-sm'>
            <button className='py-1 px-3 rounded border button-animation' onClick={() => deleteFile(fileId)}>Yes</button>
            <button className='py-1 px-3 rounded border button-animation' onClick={handleCancel}>No</button>
          </div>
        </div> : modal.type === 'showFile' && <FileInfo fileId={fileId} filter={filter} modal={true} />}
    </div>
  </>
}
