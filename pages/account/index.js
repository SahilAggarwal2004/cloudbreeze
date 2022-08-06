/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Loader from '../../components/Loader'
import { useFileContext } from '../../contexts/ContextProvider'

export default function Account() {
    const { token, username, uploadFiles, setUploadFiles, downloadFiles, logout, setModal, fetchApp } = useFileContext()
    const [name, setName] = useState()

    useEffect(() => {
        if (token) {
            fetchApp({ url: 'file/history', method: 'GET', authtoken: token, showToast: false }).then(({ success, files }) => success ? setUploadFiles(files) : setUploadFiles([]))
        }
    }, [])

    useEffect(() => { if (username) setName(`${username}${token ? '' : ' (Guest)'}`) }, [username, token])

    return name ? <div className='bg-gray-100 py-8 border-y border-black text-center space-y-12'>
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
    </div > : <div className='center flex flex-col items-center space-y-2'>
        <Loader />
        <div>Fetching account details...</div>
    </div>
}
