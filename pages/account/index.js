/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useFileContext } from '../../contexts/ContextProvider'
import { getStorage, setStorage } from '../../modules/storage'
import { BsPatchCheckFill } from 'react-icons/bs'
import { types } from '../../constants'
import Head from 'next/head'

export default function Account() {
    const { uploadFiles, downloadFiles, logout, setModal } = useFileContext()
    const type = getStorage('type')
    const guest = !types.includes(type)

    useEffect(() => {
        if (guest && getStorage('tip', true, false)) {
            setStorage('tip', false, false)
            const toastId = toast(<span className='text-gray-700 text-sm sm:text-base'>
                Create a permanent account to keep your files <strong>synced</strong> across all your devices and increase time limit of cloud uploads to upto <strong>30 days (10x)</strong>!
            </span>, { autoClose: 5000, pauseOnFocusLoss: true, pauseOnHover: true })
            return () => { toast.dismiss(toastId) }
        }
    }, [])

    return <>
        <Head><title>Your account | CloudBreeze</title></Head>
        <div className='bg-gray-100 py-8 border-y border-black text-center space-y-12'>
            <div className='text-lg sm:text-xl flex items-center justify-center mx-2'>
                <div>Hello,&nbsp;<strong>{`${getStorage('username')}${guest ? ' (Guest)' : ''}`}</strong>&nbsp;</div>
                {type === 'premium' && <BsPatchCheckFill className='inline scale-90' title='Premium User' />}
            </div>
            <div className='flex flex-col items-center space-y-5 sm:flex-row sm:justify-center sm:space-x-10 sm:space-y-0 text-sm'>
                <Link href='/account/history?filter=upload'>
                    <a>
                        <div className='text-lg sm:text-xl font-semibold'>{uploadFiles.length}</div>
                        Files Uploaded
                    </a>
                </Link>
                <Link href='/account/history?filter=download'>
                    <a>
                        <div className='text-lg sm:text-xl font-semibold'>{downloadFiles.length}</div>
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
    </>
}