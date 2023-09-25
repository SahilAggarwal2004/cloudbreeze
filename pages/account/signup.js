import { useRef } from 'react'
import Head from 'next/head';
import Link from 'next/link'
import { useFileContext } from '../../contexts/ContextProvider';
import Logo from '../../components/Logo';
import Password from '../../components/Password';

export default function Signup({ router }) {
    const { fetchApp } = useFileContext()
    const name = useRef();
    const email = useRef();
    const password = useRef();

    async function submit(e) {
        e.preventDefault()
        const { error } = await fetchApp({ url: 'auth/signup', method: 'POST', data: { name: name.current.value, email: email.current.value, password: password.current.value } })
        if (!error) router.replace('/account/login')
    }

    return <>
        <Head><title>Sign up | CloudBreeze</title></Head>
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <Logo />
                    <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Sign up for an account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        or <Link href='/account/login' className="font-medium hover:text-black">Log in</Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={submit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <input ref={name} type="text" autoComplete="name" required minLength={3} maxLength={20} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm" placeholder="Your name" />
                        <input ref={email} type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm" placeholder="Email address" />
                        <Password password={password} />
                    </div>
                    <button type="submit" className="relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md border button-animation">Sign up</button>
                </form>
            </div>
        </div>
    </>
}