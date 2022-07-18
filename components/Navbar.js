import Link from 'next/link'
import React from 'react'
import { FaHistory } from 'react-icons/fa'

export default function Navbar() {
    return <>
        <nav className='sticky inset-0 z-20 flex bg-black text-white items-center justify-between py-1.5 px-5'>
            <h2 className='text-xl'>CloudBreeze</h2>
            {/* adding <a> tag inside <Link> as for some reason <Link> passes a ref to its child and we can't use ref in a react component(here, FaHistory) */}
            <Link href="/history"><a><FaHistory className='scale-125' /></a></Link>
        </nav >
        <div className='h-10' />
    </>
}