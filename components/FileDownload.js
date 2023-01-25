/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState } from 'react';
import { File } from 'megajs';
import Loader from './Loader';
import { useFileContext } from '../contexts/ContextProvider';
import { FaQrcode } from 'react-icons/fa';
import axios from 'axios';
import { download, generateId } from '../modules/functions';
import BarProgress from './BarProgress';

export default function FileDownload({ fileIdFromUrl = false }) {
    const { downloadFiles, setDownloadFiles, fetchApp, setModal } = useFileContext()
    const fileRef = useRef()
    const password = useRef()
    const [downPercent, setDownPercent] = useState(-1)
    const isDownloaded = downPercent === 100
    const isDownloading = downPercent >= 0 && !isDownloaded

    async function downloadFile(event) {
        event.preventDefault()
        const fileId = fileIdFromUrl || generateId(fileRef.current.value, 'file')
        if (!fileId) return;
        setDownPercent(0)
        const { link, name, createdAt, daysLimit, error } = await fetchApp({ url: `file/get/${fileId}`, method: 'POST', data: { pass: password.current.value } })
        if (error) setDownPercent(-1)
        else {
            function downloadFile(blob) {
                download(blob, name)
                const updatedFiles = downloadFiles.filter(({ _id }) => _id !== fileId)
                updatedFiles.push({ nameList: [name], _id: fileId, createdAt, daysLimit })
                setDownloadFiles(updatedFiles)
                fetchApp({ url: `/file/downloaded/${fileId}`, showProgress: false })
            }
            try {
                const file = File.fromURL(link)
                const stream = file.download();
                let blob = new Blob([])
                stream.on('data', data => blob = new Blob([blob, data]))
                stream.on('progress', ({ bytesLoaded, bytesTotal }) => {
                    setDownPercent(Math.round(bytesLoaded * 100 / bytesTotal))
                    if (bytesLoaded == bytesTotal) {
                        stream.removeAllListeners();
                        downloadFile(blob)
                    }
                })
            } catch {
                const { data } = await axios({ url: link, method: 'GET', responseType: 'blob', onDownloadProgress: ({ loaded, total }) => setDownPercent(Math.round((loaded * 100) / total)) })
                downloadFile(data)
            }
        }
    }

    return <div className='flex flex-col space-y-5 justify-center items-center px-4 pb-5 text-sm sm:text-base'>
        <form onSubmit={downloadFile} className="grid grid-cols-[auto_1fr] gap-3 items-center">
            {!fileIdFromUrl && <>
                <label htmlFor="fileId">File Id or Link:</label>
                <input type="text" id='fileId' ref={fileRef} className='border rounded px-2 py-0.5' required autoComplete='off' />
            </>}
            <label htmlFor="password">Password (if any):</label>
            <input type="password" id='password' ref={password} className='border rounded px-2 py-0.5' autoComplete="new-password" />
            <div className='col-span-2 text-center text-xs sm:text-sm'>
                <span className='font-semibold text-gray-800'>Tip:</span> No need of password if you are the author of the file!
            </div>
            <button type="submit" disabled={isDownloading} className='primary-button'>{isDownloaded ? 'Download Again' : 'Download'}</button>
        </form>

        {downPercent > 0 ? <BarProgress percent={downPercent} /> : downPercent === 0 ? <Loader className='flex items-center space-x-2' text='Please wait, accessing the file(s)...' /> : !fileIdFromUrl && <div className='text-center'>
            <div className='font-bold mb-3'>OR</div>
            <div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => setModal({ active: true, type: 'qrReader' })}>
                <FaQrcode />
                <span>Scan a QR Code</span>
            </div>
        </div>}
    </div>
}