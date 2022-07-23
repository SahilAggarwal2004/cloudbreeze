/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Home() {
    const [hover, setHover] = useState(false)

    return <div className='flex flex-col mb-12 space-y-8 md:flex-row md:space-y-0 items-center justify-evenly text-center md:h-[calc(100vh-8rem)]'>
        <Link href='/file/upload'>
            <div className='shadow-md rounded-lg w-80 h-80 max-w-[80vw] cursor-pointer hover:shadow-2xl transition-all duration-300 relative' onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
                <Image src='/cloud.jpg' alt='Upload file' width={250} height={250} objectFit='scale-down' quality={100} />
                <div className={`absolute top-[10.25rem] md:top-44 left-1/2 -translate-x-1/2 transition-all duration-300 ${hover ? '-translate-y-[5.5rem] opacity-100' : 'opacity-0'}`}>
                    <Image src='/arrow.png' alt='Upload file' width={50} height={50} objectFit='scale-down' quality={100} />
                </div>
                <div className='absolute bottom-4 left-1/2 -translate-x-1/2'>Upload a File</div>
            </div>
        </Link>
        <Link href='/about'>
            <div className='shadow-md rounded-lg w-80 h-80 max-w-[80vw] cursor-pointer hover:shadow-2xl transition-all duration-300 relative'>
                <Image src='/about.png' alt='Upload file' width={250} height={250} objectFit='scale-down' quality={100} />
                <div className='absolute bottom-4 left-1/2 -translate-x-1/2'>About Us</div>
            </div>
        </Link>
    </div >
}