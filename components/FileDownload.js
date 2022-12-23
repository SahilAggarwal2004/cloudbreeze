/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState } from 'react';
import { File } from 'megajs';
import Loader from './Loader';
import { useFileContext } from '../contexts/ContextProvider';
import { FaQrcode } from 'react-icons/fa';
import axios from 'axios';
import { download, generateId } from '../modules/functions';

export default function FileDownload({ fileIdFromUrl = false }) {
    const { downloadFiles, setDownloadFiles, fetchApp, setModal } = useFileContext()
    const fileRef = useRef()
    const password = useRef()
    const [downPercent, setDownPercent] = useState(-1)
    const isDownloaded = downPercent === 100
    const isDownloading = downPercent > 0 && !isDownloaded

    async function downloadFile(event) {
        event.preventDefault()
        const fileId = fileIdFromUrl || generateId(fileRef.current.value)
        if (!fileId) return;
        setDownPercent(0)
        const { link, name, createdAt, daysLimit, error } = await fetchApp({ url: `file/get/${fileId}`, method: 'POST', data: { pass: password.current.value } })
        if (error) setDownPercent(-1)
        else {
            function downloadFile(data, source) {
                download(data, name, source)
                const updatedFiles = downloadFiles.filter(({ _id }) => _id !== fileId)
                updatedFiles.push({ nameList: [name], _id: fileId, createdAt, daysLimit })
                setDownloadFiles(updatedFiles)
                fetchApp({ url: `/file/downloaded/${fileId}`, showProgress: false })
            }
            try {
                const file = File.fromURL(link)
                const stream = file.download();
                let dataList = [];
                stream.on('data', data => dataList.push(data))
                stream.on('progress', ({ bytesLoaded, bytesTotal }) => {
                    setDownPercent(Math.round(bytesLoaded * 100 / bytesTotal))
                    if (bytesLoaded == bytesTotal) downloadFile(dataList, 'mega')
                })
            } catch {
                const { data } = await axios({ url: link, method: 'GET', responseType: 'blob', onDownloadProgress: ({ loaded, total }) => setDownPercent(Math.round((loaded * 100) / total)) })
                downloadFile(data, 'local')
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
            <button type="submit" disabled={isDownloading} className='col-span-2 mt-3 py-1 border border-black rounded bg-gray-100 disabled:opacity-50 font-medium text-gray-800'>{isDownloaded ? 'Download Again' : 'Download'}</button>
        </form>

        {isDownloading ? <div className='w-full flex items-center justify-evenly max-w-[400px]'>
            <div className='bg-gray-300 rounded-full h-1 w-4/5'>
                <div className='bg-green-500 rounded-full h-1' style={{ width: `${downPercent}%` }} />
            </div>
            {downPercent}%
        </div> : downPercent === 0 ? <Loader style='flex items-center space-x-2' text='Please wait, accessing the file(s)...' /> : !fileIdFromUrl && <div className='text-center'>
            <div className='font-bold mb-3'>OR</div>
            <div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => setModal({ active: true, type: 'qrReader' })}>
                <FaQrcode />
                <span>Scan a QR Code</span>
            </div>
        </div>}
    </div>
}