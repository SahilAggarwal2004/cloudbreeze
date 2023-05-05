/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState } from 'react';
import { File } from 'megajs';
import axios from 'axios';
import { FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { unzip } from 'unzipit';
import Loader from './Loader';
import { useFileContext } from '../contexts/ContextProvider';
import { download, generateId, resolvePromises } from '../modules/functions';
import BarProgress from './BarProgress';
import useStorage from '../hooks/useStorage';

export default function FileDownload({ fileIdFromUrl = false }) {
    const { downloadFiles, setDownloadFiles, fetchApp, setModal } = useFileContext()
    const fileRef = useRef()
    const password = useRef()
    const [unzipFile, setUnzip] = useStorage('unzip', true)
    const [downPercent, setDownPercent] = useState(-1)
    const isDownloaded = downPercent === 100
    const isDownloading = downPercent >= 0 && !isDownloaded

    async function submit(event) {
        event.preventDefault()
        const fileId = fileIdFromUrl || generateId(fileRef.current.value, 'file')
        if (!fileId) return;
        setDownPercent(0)
        const { link, name, createdAt, daysLimit, error } = await fetchApp({ url: `file/get/${fileId}`, method: 'POST', data: { pass: password.current.value } })
        if (error) setDownPercent(-1)
        else {
            async function downloadFile(blob) {
                try {
                    if (!unzipFile) throw new Error();
                    const { entries } = await unzip(blob);
                    var nameList = Object.keys(entries);
                    const blobs = await resolvePromises(Object.values(entries).map(e => e.blob()));
                    for (let i = 0; i < nameList.length; i++) download(blobs[i], nameList[i])
                } catch {
                    nameList = [name]
                    download(blob, name)
                }
                const updatedFiles = downloadFiles.filter(({ _id }) => _id !== fileId)
                updatedFiles.push({ nameList, _id: fileId, createdAt, daysLimit })
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
                        try {
                            downloadFile(blob)
                            toast.success('File(s) downloaded successfully!')
                        } catch { toast.error("Couldn't download file") }
                    }
                })
            } catch {
                const { data } = await axios({ url: link, method: 'GET', responseType: 'blob', onDownloadProgress: ({ loaded, total }) => setDownPercent(Math.round((loaded * 100) / total)) })
                downloadFile(data)
            }
        }
    }

    return <div className='flex flex-col space-y-5 justify-center items-center px-4 pb-5 text-sm sm:text-base'>
        <form onSubmit={submit} className="grid grid-cols-[auto_1fr] gap-3 items-center">
            {!fileIdFromUrl && <>
                <label htmlFor="fileId">File Id or Link:</label>
                <input type="text" id='fileId' ref={fileRef} className='border rounded px-2 py-0.5' required autoComplete='off' />
            </>}
            <label htmlFor="password">Password (if any):</label>
            <input type="password" id='password' ref={password} className='border rounded px-2 py-0.5' autoComplete="new-password" />
            <label className="col-span-2 relative inline-flex items-center cursor-pointer place-self-center">
                <input type="checkbox" checked={unzipFile} className="sr-only peer" onClick={() => setUnzip(!unzipFile)} />
                <div className="w-[2.3125rem] h-[1.3125rem] bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[0.125rem] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                <span className="ml-3 text-sm">Unzip zipped files</span>
            </label>
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