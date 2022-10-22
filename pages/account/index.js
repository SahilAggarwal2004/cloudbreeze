/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useFileContext } from '../../contexts/ContextProvider'

export default function Account() {
    const { token, username, uploadFiles, downloadFiles, logout, setModal } = useFileContext()
    const [name, setName] = useState()
    const toastId = useRef();

    useEffect(() => {
        if (username) setName(`${username}${token ? '' : ' (Guest)'}`)
        if (!token) toastId.current = toast(<span className='text-gray-700 text-sm sm:text-base'>
            Create a permanent account to keep your files <strong>synced</strong> across all your devices and increase time limit of cloud uploads to upto <strong>30 days (10x)</strong>!
        </span>, { autoClose: 5000 })
        return () => { toast.dismiss(toastId.current) }
    }, [username, token])

    return <div className='bg-gray-100 py-8 border-y border-black text-center space-y-12'>
        <div className='text-xl' > Hello, <span className='font-bold'>{name}</span></div>
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
            {!token ? <>
                <Link href='/account/signup'><a className='hover:text-black'>Create a new account</a></Link>
                <Link href='/account/login'><a className='hover:text-black'>Login to an existing account</a></Link>
            </> : <>
                <div className='cursor-pointer hover:text-black' onClick={() => logout('manual')}>Logout</div>
                <div className='cursor-pointer hover:text-black' onClick={() => setModal({ active: true, type: 'deleteUser' })}>Delete Account</div>
            </>}
        </div>
    </div >
}