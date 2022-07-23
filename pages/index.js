/* eslint-disable react-hooks/exhaustive-deps */
import Image from 'next/image'
import { useState } from 'react'
import { useFileContext } from '../contexts/ContextProvider'

export default function Home() {
    const { router, setProgress } = useFileContext()
    const [hover, setHover] = useState(false)
    const redirect = url => {
        setProgress(100 / 3)
        setTimeout(() => {
            router.push(url)
            setProgress(100)
        }, 300)
    }

    return <div className='flex flex-col mb-12 space-y-12 md:flex-row md:space-y-0 items-center justify-evenly text-center md:h-[calc(100vh-8rem)]'>
        <div className='shadow-md rounded-lg w-80 h-80 max-w-[90vw] cursor-pointer hover:shadow-2xl transition-all duration-300 relative' onClick={() => redirect('/account')} onContextMenu={event => event.preventDefault()}>
            <Image src='/images/account.png' alt='Upload file' width={250} height={250} objectFit='scale-down' quality={100} />
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2'>Your account</div>
        </div>
        <div className='shadow-md rounded-lg w-80 h-80 max-w-[90vw] cursor-pointer hover:shadow-2xl transition-all duration-300 relative' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => { setHover(true); redirect('/file/upload') }} onContextMenu={event => event.preventDefault()}>
            <Image src='/images/cloud.jpg' alt='Upload file' width={250} height={250} objectFit='scale-down' quality={100} />
            <div className={`absolute top-[55%] md:top-44 left-1/2 -translate-x-1/2 transition-all duration-300 ${hover ? '-translate-y-[5.5rem] opacity-100' : 'opacity-0'}`}>
                <Image src='/images/arrow.png' alt='Upload file' width={50} height={50} objectFit='scale-down' quality={100} />
            </div>
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2'>Upload a file</div>
        </div>
        <div className='shadow-md rounded-lg w-80 h-80 max-w-[90vw] cursor-pointer hover:shadow-2xl transition-all duration-300 relative' onClick={() => redirect('/about')} onContextMenu={event => event.preventDefault()}>
            <Image src='/images/about.png' alt='Upload file' width={250} height={250} objectFit='scale-down' quality={100} />
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2'>About us</div>
        </div>
    </div >
}