import React from 'react'
import QRCode from "react-qr-code";
import Link from 'next/link'
import { useFileContext } from '../contexts/ContextProvider';

export default function FileInfo({ fileId, modal = false }) {
    const link = `${window.location.origin}/file/download/${fileId}`
    const { setModal } = useFileContext()

    return <div className='text-center space-y-2'>
        {modal && <h2 className='font-bold text-xl mb-4'>Download File</h2>}
        <Link href={link}>Click here to download the file(s)</Link>
        <div className='font-bold'>OR</div>
        <div>Scan the QR Code given below</div>
        <div className='scale-[0.8]'><QRCode value={link} /></div>
        {modal && <div className='space-x-4 mt-4 text-sm'>
            <button className='py-1 px-3 rounded border button-animation' onClick={() => setModal({ active: true, type: 'deleteFile', props: { fileId } })}>Delete File</button>
            <button className='py-1 px-3 rounded border button-animation' onClick={() => setModal({ active: false })}>Close</button>
        </div>}
    </div>
}