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

    return <div className='flex flex-col sm:flex-wrap mx-[5vw] mb-10 sm:flex-row gap-x-8 gap-y-10 items-center sm:justify-center text-center sm:h-[calc(100vh-11rem)]'>
        <div className='image-container' onClick={() => redirect('/account')} onContextMenu={e => e.preventDefault()}>
            <img src='/images/account.webp' alt='' className='min-h-full aspect-square scale-90' />
            <div className='x-center bottom-4'>Your account</div>
        </div>
        <div className='image-container items-end' onMouseEnter={() => setHover('upload')} onMouseLeave={() => setHover()} onClick={() => redirect('/file/upload')} onContextMenu={e => e.preventDefault()}>
            <img src='/images/upload.webp' alt='' className='min-h-full aspect-square' />
            <div className={`x-center top-[57%] transition-all duration-300 ${hover === 'upload' ? '-translate-y-[5rem]' : 'opacity-0'}`}>
                <img src='/images/arrow.png' alt='' className='scale-95' fetchPriority='low' />
            </div>
            <div className='x-center bottom-4'>Upload files</div>
        </div>
        <div className='image-container' onMouseEnter={() => setHover('download')} onMouseLeave={() => setHover()} onClick={() => redirect('/file/download')} onContextMenu={e => e.preventDefault()}>
            <img src='/images/download.webp' alt='' className='min-h-full aspect-square scale-90 top-0 opacity-95' />
            <div className={`x-center top-0 transition-all duration-300 rotate-180 ${hover === 'download' ? 'top-[20%]' : 'opacity-0'}`}>
                <img src='/images/arrow.png' alt='' className='scale-[0.6]' fetchPriority='low' />
            </div>
            <div className='x-center bottom-4'>Download files</div>
        </div>
        <div className='image-container' onClick={() => redirect('/p2p')} onContextMenu={e => e.preventDefault()}>
            <img src='/images/p2p.webp' alt='' className='min-h-full aspect-square scale-90' />
            <div className='x-center bottom-4'>Peer-to-peer transfer</div>
        </div>
    </div>
}