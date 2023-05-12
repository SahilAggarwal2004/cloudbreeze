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
        <div className='image-container pt-12 pb-24' onClick={() => redirect('/account')} onContextMenu={e => e.preventDefault()}>
            <Image src='/images/account.webp' alt='' width={176} height={176} quality={100} />
            <div className='x-center bottom-4'>Your account</div>
        </div>
        <div className='image-container pt-1 pb-16' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => {
            setHover(true);
            redirect('/file/upload')
        }} onContextMenu={e => e.preventDefault()}>
            <Image src='/images/cloud.webp' alt='' width={250} height={250} quality={100} priority={true} />
            <div className={`x-center top-[55%] md:top-44 transition-all duration-300 ${hover ? '-translate-y-[5.5rem] opacity-100' : 'opacity-0'}`}>
                <Image src='/images/arrow.png' alt='' width={50} height={50} quality={100} />
            </div>
            <div className='x-center bottom-4'>Upload a file</div>
        </div>
        <div className='image-container pt-12 pb-24' onClick={() => redirect('/p2p')} onContextMenu={e => e.preventDefault()}>
            <Image src='/images/p2p.webp' alt='' width={176} height={176} quality={100} />
            <div className='x-center bottom-4'>Peer-to-peer transfer</div>
        </div>
    </div>
}