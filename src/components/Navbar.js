import Link from 'next/link'
import { FaUpload, FaDownload, FaUserAlt, FaHistory } from 'react-icons/fa'
import { GrSend } from 'react-icons/gr'
import LoadingBar from 'react-top-loading-bar'
import { useFileContext } from '../contexts/ContextProvider'

export default function Navbar() {
    const { progress, setProgress } = useFileContext()

    return <>
        <LoadingBar color='#ffffff' progress={progress} waitingTime={300} onLoaderFinished={() => setProgress(0)} />
        <nav className='sticky inset-0 z-30 flex bg-black text-white items-center justify-between p-2 xs:px-4 sm:px-5 shadow-lg'>
            {/* title attribute displays text on element hover */}
            <div className='flex space-x-3 sm:space-x-4 items-center'>
                <Link href="/account"><FaUserAlt className='xs:scale-110' title='Your Account' /></Link>
                <Link href="/"><h1 className='text-lg xs:text-xl cursor-pointer select-none font-medium' title='Home'>CloudBreeze</h1></Link>
            </div>
            <div className='flex space-x-4 xs:space-x-5 sm:space-x-6'>
                <Link href="/account/history?filter=upload"><FaHistory className='hidden sm:block scale-110 sm:scale-125' title='History' /></Link>
                <Link href="/file/upload"><FaUpload className='scale-110 sm:scale-125' title='Upload files' /></Link>
                <Link href="/file/download"><FaDownload className='scale-110 sm:scale-125' title='Download files' /></Link>
                <Link href="/p2p"><GrSend className='scale-110 sm:scale-125' title='Peer-to-peer transfer' /></Link>
            </div>
        </nav>
        <div className='h-10' />
    </>
}