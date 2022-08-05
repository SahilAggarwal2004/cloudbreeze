import Link from 'next/link'
import React from 'react'
import { FaUpload, FaDownload, FaHistory } from 'react-icons/fa'
import LoadingBar from 'react-top-loading-bar'
import { useFileContext } from '../contexts/ContextProvider'

export default function Navbar() {
    const { progress, setProgress } = useFileContext()

    return <>
        <LoadingBar color='#ffffff' progress={progress} waitingTime={300} onLoaderFinished={() => setProgress(0)} />
        <nav className='sticky inset-0 z-20 flex bg-black text-white items-center justify-between py-2 px-4 sm:px-5 shadow-lg'>
            <Link href="/"><h1 className='text-xl cursor-pointer select-none' title='Home'>CloudBreeze</h1></Link>
            {/* adding <a> tag inside <Link> as for some reason <Link> passes a ref to its child and we can't use ref in a react component(here, FaHistory) */}
            {/* title attribute displays text on element hover */}
            <div className='flex space-x-5 sm:space-x-6'>
                <Link href="/file/upload"><a><FaUpload className='scale-110 sm:scale-125 text-white' title='Upload File' /></a></Link>
                <Link href="/file/download"><a><FaDownload className='scale-110 sm:scale-125 text-white' title='Download File' /></a></Link>
                <Link href="/account/history?filter=upload"><a><FaHistory className='scale-110 sm:scale-125' title='History' /></a></Link>
            </div>
        </nav >
        <div className='h-10' />
    </>
}