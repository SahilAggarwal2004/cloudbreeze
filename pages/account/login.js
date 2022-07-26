import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useFileContext } from '../../contexts/ContextProvider';
import Logo from '../../components/Logo';

export default function Login() {
  const { setToken, setUploadFiles, logout, fetchApp } = useFileContext()
  const email = useRef();
  const password = useRef();
  const [show, setShow] = useState(false);

  async function submit(event) {
    event.preventDefault()
    const { success, authtoken, files } = await fetchApp({ url: 'auth/login', method: 'POST', data: { email: email.current.value, password: password.current.value } })
    if (success) {
      setToken(authtoken)
      setUploadFiles(files)
      logout('login')
    }
  }

  return <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8">
      <div>
        <Logo />
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Log in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          or <Link href='/account/signup'><a className="font-medium hover:text-black">Sign Up</a></Link>
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={submit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <input ref={email} type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm" placeholder="Email address" />
          <div className='relative p-0 m-0'>
            <input ref={password} type={show ? "text" : "password"} autoComplete="new-password" minLength={8} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black sm:text-sm" placeholder="Password" />
            <div onClick={() => setShow(!show)}>
              {!show ? <FaEye className='password-icon' /> : <FaEyeSlash className='password-icon' />}
            </div>
          </div>
        </div>

        <Link passHref href='/account/forgot'><div className="cursor-pointer font-medium text-sm text-gray-600 hover:text-black">Forgot your password?</div></Link>

        <button type="submit" className="relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md border button-animation">Log in</button>
      </form>
    </div>
  </div>
}
