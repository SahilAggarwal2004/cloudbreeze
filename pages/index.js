/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link'

export default function Home() {
    return <div className='flex flex-col space-y-2 items-center'>
        <Link href='/file/upload'>Upload a File</Link>
        <Link href='/about'>About Us</Link>
    </div >
}