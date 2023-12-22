/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import { useLayoutEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { toast } from 'react-toastify'
import { useFileContext } from '../contexts/ContextProvider'
import { verifyUrl } from '../modules/functions'

export default function Scanner() {
    const router = useRouter()
    const { setModal } = useFileContext()
    const [message, setMessage] = useState('')
    const video = useRef()

    useLayoutEffect(() => {
        const qrScanner = new QrScanner(video.current, ({ result }) => {
            const { verified, pathname } = verifyUrl(result)
            if (!verified) return setMessage('Please scan a valid QR Code')
            setModal({ active: false })
            toast.success('Successfuly scanned the QR Code')
            router.push(pathname)
        });
        qrScanner.start().then(() => {
            setMessage('Scan QR Code using camera')
        }).catch(() => {
            setModal({ active: false })
            toast.error('Camera not accessible')
        })
        return () => qrScanner.stop()
    }, [])

    return <div className={`text-center w-[80vw] max-w-96 max-h-[50vh] flex flex-col justify-center px-3 space-y-3 ${!message && 'hidden'}`}>
        <span className='text-xs xs:text-sm md:text-base'>{message}</span>
        <video ref={video} />
    </div>
}