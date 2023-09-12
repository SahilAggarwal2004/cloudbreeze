/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState } from 'react';
import { File } from 'megajs';
import axios from 'axios';
import { FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { unzip } from 'unzipit';
import { wait } from 'random-stuff-js';
import { sign } from 'jssign';
import Loader from './Loader';
import { useFileContext } from '../contexts/ContextProvider';
import { download, generateId, getDownloadUrl, resolvePromises } from '../modules/functions';
import BarProgress from './BarProgress';
import useStorage from '../hooks/useStorage';
import { regex } from '../constants';

const csrfSecret = process.env.NEXT_PUBLIC_SECRET

export default function FileDownload({ fileIdFromUrl = false }) {
    const { downloadFiles, setDownloadFiles, fetchApp, setModal } = useFileContext()
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
            const options = server ? {
                url: getDownloadUrl(fileId, server), method: 'POST', data: { pass: password.current.value },
                headers: { csrftoken: sign(undefined, csrfSecret, { expiresIn: 300000 }) }
            } : { url: link, method: 'GET' }
            try {
                return await axios({
                    ...options, responseType: 'blob',
                    onDownloadProgress: ({ loaded, total }) => setProgress(Math.round((loaded * 100) / total))
                })
            } catch {
                toast.error("Couldn't download file")
                setProgress(-1)
                return {}
            }
        }

        if (server) {
            const { data, headers } = await fetchDownload()
            return data && download(data, headers.filename)
        }

        const { link, name, createdAt, daysLimit, error } = await fetchApp({ url: getDownloadUrl(fileId), method: 'POST', data: { pass: password.current.value } })
        if (error) setProgress(-1)
        else {
            async function downloadFile(blob) {
                if (!blob) return
                try {
                    if (!unzipFile || !regex.test(name)) throw new Error();
                    const { entries } = await unzip(blob);
                    var nameList = Object.keys(entries);
                    const blobs = await resolvePromises(Object.values(entries).map(e => e.blob()));
                    for (let i = 0; i < nameList.length;) {
                        download(blobs[i], nameList[i])
                        if (!(++i % 10)) await wait(1000)
                    }
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
                let blob = new Blob()
                stream.on('data', data => blob = new Blob([blob, data]))
                stream.on('progress', ({ bytesLoaded, bytesTotal }) => {
                    setProgress(Math.round(bytesLoaded * 100 / bytesTotal))
                    if (bytesLoaded == bytesTotal) {
                        stream.removeAllListeners();
                        try {
                            downloadFile(blob)
                            toast.success('File(s) downloaded successfully!')
                        } catch { toast.error("Couldn't download file") }
                    }
                })
            } catch {
                const { data } = await fetchDownload()
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
                <input type="checkbox" checked={unzipFile} className="sr-only peer" onChange={() => setUnzip(!unzipFile)} />
                <div className="w-[2.3125rem] h-[1.3125rem] bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2.5px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                <span className="ml-3 text-sm">Extract files</span>
            </label>
            <div className='col-span-2 text-center text-xs sm:text-sm'>
                <span className='font-semibold text-gray-800'>Tip:</span> No need of password if you are the author of the file!
            </div>
            <button type="submit" disabled={isDownloading} className='primary-button'>{isDownloaded ? 'Download Again' : 'Download'}</button>
        </form>

        {progress > 0 ? <BarProgress percent={progress} /> : progress === 0 ? <Loader className='flex items-center space-x-2' text='Please wait, accessing the file(s)...' /> : !fileIdFromUrl && <div className='text-center'>
            <div className='font-bold mb-3'>OR</div>
            <div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => setModal({ active: true, type: 'qrReader' })}>
                <FaQrcode />
                <span>Scan a QR Code</span>
            </div>
        </div>}
    </div>
}