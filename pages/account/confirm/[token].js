import React from 'react'
import { useFileContext } from '../../../contexts/ContextProvider'

export default function Confirm() {
  const { router, fetchApp } = useFileContext()
  const { token } = router.query

  async function verify() {
    const { success } = await fetchApp({ url: 'auth/confirm', method: 'PUT', authtoken: token })
    if (success) router.push('/account/login')
  }

  return <div className='center space-y-5 text-center'>
    <h3 className='text-lg font-semibold'>Confirm your CloudBreeze account</h3>
    <button className='mt-1 py-1 px-2 rounded-md border-[1.5px] border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-300' onClick={verify}>Click Here!</button>
  </div>
}
