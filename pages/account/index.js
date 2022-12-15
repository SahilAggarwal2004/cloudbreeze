/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useFileContext } from '../../contexts/ContextProvider'
import { getStorage, setStorage } from '../../modules/storage'
import { BsPatchCheckFill } from 'react-icons/bs'

export default function Account() {
    const { guest, username, type, uploadFiles, downloadFiles, logout, setModal } = useFileContext()
    const [name, setName] = useState()

    useEffect(() => {
        if (guest && getStorage('account-tip', true)) {
            setStorage('account-tip', false)
            const toastId = toast(<span className='text-gray-700 text-sm sm:text-base'>
                Create a permanent account to keep your files <strong>synced</strong> across all your devices and increase time limit of cloud uploads to upto <strong>30 days (10x)</strong>!
            </span>, { autoClose: 5000, pauseOnFocusLoss: true, pauseOnHover: true })
            return () => { toast.dismiss(toastId) }
        }
    }, [])

    useEffect(() => { if (username) setName(`${username}${guest ? ' (Guest)' : ''}`) }, [username, guest])

    return <div className='bg-gray-100 py-8 border-y border-black text-center space-y-12'>
        <div className='text-xl flex items-center justify-center'>
            Hello,&nbsp;<strong>{name}</strong>&nbsp;
            {type === 'premium' && <BsPatchCheckFill className='inline scale-90' title='Premium User' />}
        </div>
        <div className='flex flex-col items-center space-y-5 sm:flex-row sm:justify-center sm:space-x-10 sm:space-y-0 text-sm'>
            <Link href='/account/history?filter=upload'>
                <a>
                    <div className='text-xl font-semibold'>{uploadFiles.length}</div>
                    Files Uploaded
                </a>
            </Link>
            <Link href='/account/history?filter=download'>
                <a>
                    <div className='text-xl font-semibold'>{downloadFiles.length}</div>
                    Files Downloaded
                </a>
            </Link>
        </div>
        <div className='text-sm font-medium text-gray-600 flex flex-col items-center space-y-1.5'>
            {guest ? <>
                <Link href='/account/signup'><a className='hover:text-black'>Create a new account</a></Link>
                <Link href='/account/login'><a className='hover:text-black'>Login to an existing account</a></Link>
            </> : <>
                <div className='cursor-pointer hover:text-black' onClick={() => logout('manual')}>Logout</div>
                <div className='cursor-pointer hover:text-black' onClick={() => setModal({ active: true, type: 'deleteUser' })}>Delete Account</div>
            </>}
        </div>
    </div >
}