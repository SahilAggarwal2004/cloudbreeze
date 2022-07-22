/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Loader from '../../components/Loader'
import { useFileContext } from '../../contexts/ContextProvider'

export default function Account() {
    const { token, username, uploadFiles, downloadFiles, logout, handleDelete } = useFileContext()
    const [name, setName] = useState()

    useEffect(() => { if (username) setName(`${username}${token ? '' : ' (Guest)'}`) }, [username, token])

    return name ? <div className='bg-gray-100 py-8 border-y border-black text-center space-y-12'>
        <div className='text-xl' > Hello, <span className='font-bold'>{name}</span></div>
        <div className='flex flex-col items-center space-y-5 sm:flex-row sm:justify-center sm:space-x-10 sm:space-y-0'>
            <div className='text-sm'>
                <div className='text-xl font-semibold'>{uploadFiles.length}</div>
                Files Uploaded
            </div>
            <div className='text-sm'>
                <div className='text-xl font-semibold'>{downloadFiles.length}</div>
                Files Downloaded
            </div>
        </div>
        <div className='text-sm font-medium text-gray-600 flex flex-col items-center space-y-1.5'>
            {!token ? <>
                <Link href='/account/signup'><a className='hover:text-black'>Create a new account</a></Link>
                <Link href='/account/login'><a className='hover:text-black'>Login to an existing account</a></Link>
            </> : <>
                <div className='cursor-pointer hover:text-black' onClick={logout}>Logout</div>
                <div className='cursor-pointer hover:text-black' onClick={() => handleDelete(token)}>Delete Account</div>
            </>}
        </div>
    </div > : <div className='center flex flex-col items-center space-y-2'>
        <Loader />
        <div>Fetching account details...</div>
    </div>
}
