import React, { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFileContext } from '../../contexts/ContextProvider';
import useFetch from '../../hooks/useFetch';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Signup() {
    const { router } = useFileContext()
    const fetchApp = useFetch()
    const name = useRef();
    const email = useRef();
    const password = useRef();
    const [show, setShow] = useState(false);

    async function submit(event) {
        event.preventDefault()
        const { error } = await fetchApp({ url: `auth/signup`, method: 'POST', data: { name: name.current.value, email: email.current.value, password: password.current.value } })
        if (!error) router.push('/account/login')
    }

    return <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
            <div>
                <div className="h-16 text-center">
                    <Image src="/logo.png" alt="CloudBreeze" width={75} height={75} priority />
                </div>
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Sign up for an account</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    or <Link href='/account/login'><a className="font-medium text-darkorange hover:text-black">Log in</a></Link>
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={submit}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <input ref={name} type="text" autoComplete="name" required minLength={3} maxLength={20} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm" placeholder="Your name" />
                    <input ref={email} type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm" placeholder="Email address" />
                    <div className='relative p-0 m-0'>
                        <input ref={password} type={show ? "text" : "password"} autoComplete="new-password" minLength={8} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black sm:text-sm" placeholder="Password" />
                        <div onClick={() => setShow(!show)}>
                            {!show ? <FaEye className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:bg-gray-100 rounded-full p-1 box-content' /> :
                                <FaEyeSlash className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:bg-gray-100 rounded-full p-1 box-content' />}
                        </div>
                    </div>
                </div>
                <button type="submit" className="relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-darkorange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">Sign up</button>
            </form>
        </div>
    </div>
}