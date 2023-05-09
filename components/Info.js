import QRCode from "react-qr-code";
import { useFileContext } from '../contexts/ContextProvider';
import { toast } from 'react-toastify';
import { FaShareSquare } from 'react-icons/fa';
import Link from 'next/link';

export default function Info({ fileId, roomId, filter, downloadCount, modal = false }) {
    const link = fileId ? `${window.location.origin}/file/${fileId}` : `${window.location.origin}/p2p/${roomId}`
    const { setModal, clearHistory } = useFileContext()

    function share(type = 'URL') {
        const id = fileId || roomId
        const data = type === 'URL' ? { url: link } : { text: id }
        if (navigator.canShare(data) && navigator.userAgentData?.mobile) navigator.share(data) // navigator.userAgentData?.mobile checks if the device is a mobile device or not
        else {
            navigator.clipboard.writeText(type === 'URL' ? link : id)
            toast.success(`${type} copied to clipboard!`)
        }
    }

    return <div className='text-center text-sm sm:text-base space-y-2 bg-white text-black max-w-[95vw]'>
        {modal && <h2 className='font-bold text-lg mb-2'>File Details</h2>}
        {fileId ? <div className='cursor-pointer px-1 break-all mb-4' onClick={() => share('File Id')}>
            File Id: <span className='font-medium'>{fileId}</span>
        </div> : <div className='cursor-pointer px-1 break-all mb-4' onClick={() => share('Room Id')}>
            Room Id: <span className='font-medium'>{roomId}</span>
        </div>}
        <div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => share()}>
            <FaShareSquare />
            <span>Click here to share the url</span>
        </div>
        <div className='font-bold'>OR</div>
        <div>Scan the QR Code given below</div>
        <div className='scale-[0.8] flex justify-center'>
            <QRCode value={link} bgColor='#FFFFFF' fgColor='#000000' />
        </div>
        {modal && filter === 'upload' && <div className='text-sm pb-2'>Download Count: {downloadCount}</div>}
        {modal && <div className='grid grid-cols-2 gap-2 mt-2 mx-4 text-sm'>
            {filter === 'upload' ? <>
                <Link href={link} className='col-span-2 py-1 px-3 rounded border button-animation' onClick={() => setModal({ active: false })}>Download</Link>
                <button className='py-1 px-3 rounded border button-animation' onClick={() => setModal({ active: true, type: 'deleteFile', props: { fileId } })}>Delete</button>
            </> : filter === 'download' && <button className='py-1 px-3 rounded border button-animation' onClick={() => {
                setModal({ active: false })
                clearHistory(fileId, 'download')
            }}>Clear History</button>}
            <button className='py-1 px-3 rounded border button-animation' onClick={() => setModal({ active: false })}>Close</button>
        </div>}
    </div>
}