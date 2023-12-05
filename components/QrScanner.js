import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { QrReader } from 'react-qr-reader'
import { toast } from 'react-toastify'
import { useFileContext } from '../contexts/ContextProvider'
import { verifyUrl } from '../modules/functions'
import { uselessErrors } from '../constants'

export default function QrScanner() {
    const router = useRouter()
    const { modal, setModal } = useFileContext()
    const [error, setError] = useState(false)

    function handleQrScan(result, error) {
        if (error && !uselessErrors.includes(error.name)) {
            setModal({ active: false })
            return toast.error('Permission denied or browser not supported')
        }
        if (!result) return
        const { verified, pathname } = verifyUrl(result.text)
        if (!verified) return setError(true)
        setModal({ active: false })
        toast.success('Successfuly scanned the QR Code')
        router.push(pathname)
    }

    useEffect(() => { setError(false) }, [modal.type])

    return <div className='text-center h-[50vh] aspect-square max-w-[80vw] flex flex-col justify-center mt-5'>
        {error ? 'Please scan a valid QR Code' : 'Scan QR Code using camera'}
        <QrReader onResult={handleQrScan} constraints={{ facingMode: 'environment' }} />
    </div>
}