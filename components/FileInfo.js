import React from 'react'
import QRCode from "react-qr-code";
import { useFileContext } from '../contexts/ContextProvider';
import { toast } from 'react-toastify';
import { FaShareSquare } from 'react-icons/fa';

export default function FileInfo({ fileId, filter, downloadCount, modal = false }) {
    const link = `${window.location.origin}/file/${fileId}`
    const { setModal } = useFileContext()

    function share(type = 'URL') {
        const data = type === 'URL' ? { url: link } : { text: fileId }
        if (navigator.canShare(data) && navigator.userAgentData?.mobile) navigator.share(data) // navigator.userAgentData?.mobile checks if the device is a mobile device or not
        else {
            navigator.clipboard.writeText(type === 'URL' ? link : fileId)
            toast.success(`${type} copied to clipboard!`)
        }
    }

    return <div className='text-center space-y-2 bg-white text-black max-w-[95vw]'>
        {modal && <h2 className='font-bold text-xl mb-4'>Download file</h2>}
        <div className='cursor-pointer px-1 break-all text-sm' onClick={() => share('File Id')}>
            File Id: <span className='font-medium'>{fileId}</span>
        </div>
        <div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => share()}>
            <FaShareSquare />
            <span>Click here to share the url</span>
        </div>
        <div className='font-bold'>OR</div>
        <div>Scan the QR Code given below</div>
        <div className='scale-[0.8] flex justify-center'><QRCode value={link} bgColor='#FFFFFF' fgColor='#000000' /></div>
        {modal && filter === 'upload' && <div className='text-sm pb-2'>Download Count: {downloadCount}</div>}
        {modal && <div className='space-x-4 mt-4 text-sm'>
            {filter === 'upload' ? <button className='py-1 px-3 rounded border button-animation' onClick={() => setModal({ active: true, type: 'deleteFile', props: { fileId } })}>Delete File</button> : filter === 'download' && <button className='py-1 px-3 rounded border button-animation' onClick={() => setModal({ active: true, type: 'clearHistory', props: { fileId } })}>Clear from History</button>}
            <button className='py-1 px-3 rounded border button-animation' onClick={() => setModal({ active: false })}>Close</button>
        </div>}
    </div>
}