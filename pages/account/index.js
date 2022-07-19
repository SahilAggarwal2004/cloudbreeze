/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { useFileContext } from '../../contexts/ContextProvider'

export default function Account() {
    const { token, guestName, uploadFiles, downloadFiles } = useFileContext()
    const [name, setName] = useState()

    useEffect(() => { if (!token.value) setName(`${guestName} (Guest)`) }, [guestName])

    return <div className='bg-gray-100 py-8 border-y border-black text-center space-y-10'>
        <div className='text-xl'>Hello, <span className='font-bold'>{name}</span></div>
        <div className='flex flex-col items-center space-y-5 sm:flex-row sm:justify-center sm:space-x-10 sm:space-y-0'>
            <div className='text-sm'>
                <div className='text-xl font-semibold'>{uploadFiles.length}</div>
                Files Uploaded
            </div>
            <div className='text-sm'>
                <div className='text-xl font-semibold'>{downloadFiles.length}</div>
                Files Downloaded
            </div>
        </div>
    </div>
}
