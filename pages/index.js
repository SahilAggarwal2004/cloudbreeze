/* eslint-disable react-hooks/exhaustive-deps */
import Image from 'next/image'
import { useState } from 'react'
import { useFileContext } from '../contexts/ContextProvider'

export default function Home({ router }) {
    const { setProgress } = useFileContext()
    const [hover, setHover] = useState(false)
    const redirect = url => {
        setProgress(100 / 3)
        setTimeout(() => {
            router.push(url)
            setProgress(100)
        }, 300)
    }

    return <div className='flex flex-col mx-[5vw] mb-12 space-y-12 md:flex-row md:space-x-6 md:space-y-0 items-center md:justify-center lg:justify-evenly text-center md:h-[calc(100vh-8rem)]'>
        <div className='shadow-md rounded-lg w-80 h-80 max-w-[90vw] cursor-pointer select-none hover:shadow-2xl transition-all duration-300 relative' onClick={() => redirect('/account')} onContextMenu={event => event.preventDefault()}>
            <Image src='/images/account.png' alt='' width={250} height={250} objectFit='scale-down' quality={100} />
            <div className='x-center bottom-4'>Your account</div>
        </div>
        <div className='shadow-md rounded-lg w-80 h-80 max-w-[90vw] cursor-pointer select-none hover:shadow-2xl transition-all duration-300 relative' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => { setHover(true); redirect('/file/upload') }} onContextMenu={event => event.preventDefault()}>
            <Image src='/images/cloud.jpg' alt='' width={250} height={250} objectFit='scale-down' quality={100} />
            <div className={`x-center top-[55%] md:top-44 transition-all duration-300 ${hover ? '-translate-y-[5.5rem] opacity-100' : 'opacity-0'}`}>
                <Image src='/images/arrow.png' alt='' width={50} height={50} objectFit='scale-down' quality={100} />
            </div>
            <div className='x-center bottom-4'>Upload a file</div>
        </div>
        <div className='shadow-md rounded-lg w-80 h-80 max-w-[90vw] cursor-pointer select-none hover:shadow-2xl transition-all duration-300 relative' onClick={() => redirect('/p2p')} onContextMenu={event => event.preventDefault()}>
            <Image src='/images/p2p.png' alt='' width={250} height={250} objectFit='scale-down' quality={100} />
            <div className='x-center bottom-4'>Peer-to-peer transfer</div>
        </div>
    </div >
}