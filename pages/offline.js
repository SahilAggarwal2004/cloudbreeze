/* eslint-disable react-hooks/exhaustive-deps */
// import React, { useEffect } from 'react'
// import { useRouter } from 'next/router'

export default function Offline() {
    // const router = useRouter();

    // useEffect(() => { if (navigator.onLine) router.route('/') }, [])

    // document.title = 'You are Offline'

    return <div className="w-screen h-screen flex justify-center items-center inset-0 fixed z-20">
        <div className='text-center px-4 font-sans space-y-2'>
            <h1 className='text-3xl'>Offline...</h1>
            <p>{"The current page isn't available offline. Please try again when you're back online."}</p>
        </div>
    </div>
}
