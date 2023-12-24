/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState } from 'react';
import { File } from 'megajs';
import axios from 'axios';
import { FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { unzip } from 'unzipit';
import Loader from './Loader';
import { useFileContext } from '../contexts/ContextProvider';
import { download, generateId, getDownloadUrl, resolvePromises } from '../modules/functions';
import BarProgress from './BarProgress';
import useStorage from '../hooks/useStorage';
import { maxConnections, minChunkSize, regex } from '../constants';

export default function FileDownload({ fileIdFromUrl = false }) {
    const { setDownloadFiles, fetchApp, setModal } = useFileContext()
    const fileRef = useRef()
    const password = useRef()
    const [unzipFile, setUnzip] = useStorage('unzip', true)
    const [progress, setProgress] = useState(-1)
    const isDownloaded = progress === 100
    const isDownloading = progress >= 0 && !isDownloaded

    async function submit(e) {
        e.preventDefault()
        const id = fileIdFromUrl || generateId(fileRef.current.value, 'file')
        if (!id) return;
        setProgress(0)
        const [fileId, server] = id.split('@')

        async function fetchDownload() {
            const options = server ? { url: getDownloadUrl(fileId, server), method: 'POST', data: { pass: password.current.value } } : { url: link, method: 'GET' }
            try {
                return await axios({
                    ...options, responseType: 'blob',
                    onDownloadProgress: ({ loaded, total }) => setProgress(Math.round((loaded * 100) / total))
                })
            } catch {
                toast.error("Couldn't download file(s)")
                setProgress(-1)
                return {}
            }
        }

        async function downloadFile(blob, name) {
            try {
                if (!blob) throw new Error();
                try {
                    if (!unzipFile || !regex.test(name)) throw new Error();
                    const { entries } = await unzip(blob);
                    var nameList = Object.keys(entries);
                    const blobs = await resolvePromises(Object.values(entries).map(e => e.blob()));
                    for (let i = 0; i < nameList.length; i++) await download(blobs[i], nameList[i])
                } catch {
                    nameList = [name]
                    await download(blob, name)
                }
                toast.success('File(s) downloaded successfully!')
                if (server) return
                setDownloadFiles(prev => prev.filter(({ _id }) => _id !== fileId).concat({ nameList, _id: fileId, createdAt, daysLimit }))
                fetchApp({ url: `/file/downloaded/${fileId}`, showProgress: false })
            } catch { toast.error("Couldn't download file(s)") }
        }

        if (server) {
            const { data, headers } = await fetchDownload()
            return downloadFile(data, headers.filename)
        }

        const { createdAt, daysLimit, error, link, name, size } = await fetchApp({ url: getDownloadUrl(fileId), method: 'POST', data: { pass: password.current.value } })
        if (error) return setProgress(-1)
        try {
            const file = File.fromURL(link)
            const chunkSize = Math.max(minChunkSize, Math.round(size / maxConnections))
            const stream = file.download({ maxConnections, initialChunkSize: chunkSize, maxChunkSize: chunkSize });
            let blob = new Blob()
            stream.on('data', data => blob = new Blob([blob, data]))
            stream.on('progress', ({ bytesLoaded, bytesTotal }) => {
                setProgress(Math.round(bytesLoaded * 100 / bytesTotal))
                if (bytesLoaded === bytesTotal) {
                    stream.removeAllListeners();
                    downloadFile(blob, name)
                }
            })
        } catch {
            const { data } = await fetchDownload()
            downloadFile(data, name)
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
                <input type="checkbox" checked={unzipFile} className="sr-only peer" onChange={() => setUnzip(prev => !prev)} />
                <div className="w-[2.3125rem] h-[1.3125rem] bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2.5px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                <span className="ml-3 text-sm">Extract files</span>
            </label>
            <div className='col-span-2 text-center text-xs sm:text-sm'>
                <span className='font-semibold text-gray-800'>Tip:</span> No need of password if you are the author of the file!
            </div>
            <button type="submit" disabled={isDownloading} className='primary-button'>{isDownloaded ? 'Download Again' : 'Download'}</button>
        </form>

        {progress > 0 ? <BarProgress percent={progress} /> : progress === 0 ? <Loader className='flex items-center space-x-3' text='Please wait, accessing the file(s)...' /> : !fileIdFromUrl && <div className='text-center'>
            <div className='font-bold mb-3'>OR</div>
            <div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => setModal({ active: true, type: 'qrScanner' })}>
                <FaQrcode />
                <span>Scan a QR Code</span>
            </div>
        </div>}
    </div>
}