import { useState, useRef } from 'react'
import Link from 'next/link'
import { useFileContext } from '../../contexts/ContextProvider';
import Logo from '../../components/Logo';
import Password from '../../components/Password';
import Head from 'next/head';

export default function Forgot({ router }) {
  const { fetchApp } = useFileContext()
  const email = useRef();
  const otp = useRef();
  const password = useRef();
  const [stage, setStage] = useState(0)

  async function submit(e) {
    e.preventDefault()
    if (!stage) {
      const { success, error } = await fetchApp({ url: 'auth/otp', method: 'POST', data: { email: email.current.value } })
      if (success || error === 'OTP already sent!') setStage(1)
    } else {
      const { success } = await fetchApp({ url: 'auth/forgot', method: 'PUT', data: { email: email.current.value, otp: otp.current.value, password: password.current.value } })
      if (success) router.push('/account/login')
    }
  }

  return <>
    <Head><title>Reset password | CloudBreeze</title></Head>
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Logo />
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            or <Link href='/account/login' className="font-medium hover:text-black">Login</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input ref={email} type="email" autoComplete="email" required className={`appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md ${stage ? 'rounded-b-none' : ''} focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm`} placeholder="Email address" />
            {Boolean(stage) && <>
              <input ref={otp} type="text" autoComplete="new-password" minLength={6} maxLength={6} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm" placeholder="Enter OTP" />
              <Password password={password} />
            </>}
          </div>
          <button type="submit" className="relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md border button-animation">{stage ? 'Reset password' : 'Send OTP'}</button>
        </form>
      </div>
    </div>
  </>
}