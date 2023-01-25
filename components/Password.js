import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Password({ password }) {
    const [show, setShow] = useState(false);

    return <div className='relative p-0 m-0'>
        <input ref={password} type={show ? "text" : "password"} autoComplete="new-password" minLength={8} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black sm:text-sm" placeholder="Password" />
        <div onClick={() => setShow(old => !old)}>
            {!show ? <FaEye className='password-icon' /> : <FaEyeSlash className='password-icon' />}
        </div>
    </div>
}