/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import { useFileContext } from '../contexts/ContextProvider'

export default function Home({ router }) {
    const { setProgress } = useFileContext()
    const [hover, setHover] = useState()
    const redirect = url => {
        setProgress(100 / 3)
        setTimeout(() => {
            router.push(url)
            setProgress(100)
        }, 300)
    }

    return <div className='flex flex-col mx-[5vw] mb-12 space-y-12 md:flex-row md:space-x-6 md:space-y-0 items-center md:justify-center lg:justify-evenly text-center md:h-[calc(100vh-8rem)]'>
        <div className='image-container pt-1 pb-16' onMouseEnter={() => setHover('upload')} onMouseLeave={() => setHover()} onClick={() => redirect('/file/upload')} onContextMenu={e => e.preventDefault()}>
            <img src='/images/upload.webp' alt='' width={250} />
            <div className={`x-center top-44 transition-all duration-300 ${hover === 'upload' ? '-translate-y-[5.5rem]' : 'opacity-0'}`}>
                <img src='/images/arrow.png' alt='' width={50} fetchPriority='low' />
            </div>
            <div className='x-center bottom-4'>Upload files</div>
        </div>
        <div className='image-container pt-1 pb-16' onMouseEnter={() => setHover('download')} onMouseLeave={() => setHover()} onClick={() => redirect('/file/download')} onContextMenu={e => e.preventDefault()}>
            <img src='/images/download.webp' alt='' width={250} className='opacity-95' />
            <div className={`x-center top-3 transition-all duration-300 rotate-180 ${hover === 'download' ? 'translate-y-[3.5rem] opacity-100' : 'opacity-0'}`}>
                <img src='/images/arrow.png' alt='' width={40} fetchPriority='low' />
            </div>
            <div className='x-center bottom-4'>Download files</div>
        </div>
        <div className='image-container pt-12 pb-24' onClick={() => redirect('/p2p')} onContextMenu={e => e.preventDefault()}>
            <img src='/images/p2p.webp' alt='' width={176} />
            <div className='x-center bottom-4'>Peer-to-peer transfer</div>
        </div>
    </div>
}