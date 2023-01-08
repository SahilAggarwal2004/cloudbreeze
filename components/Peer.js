import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { GoX } from 'react-icons/go'
import { bytesToSize, speed } from '../modules/functions'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useFileContext } from '../contexts/ContextProvider'
import { chunkSize } from '../constants';

export default function Peer({ peer, names, sizes, totalSize, conn }) {
    const { files } = useFileContext()
    const [count, setCount] = useState(0)
    const [bytes, setBytes] = useState(0)
    const [totalBytes, setTotalBytes] = useState(0)
    const [time, setTime] = useState(0)
    const size = sizes[count]
    const isMobile = () => navigator.userAgentData?.mobile

    function sendFile(i = 0) {
        const mobile = isMobile();
        const duration = mobile ? 500 : 55
        const minBuffer = 2 * chunkSize;
        const file = files[i]
        const size = sizes[i]
        conn.send({ file: file.slice(0, chunkSize), name: names[i], size, type: 'file', initial: true, progress: mobile })
        let bytesSent = chunkSize
        const proceed = setInterval(() => {
            const bufferedAmount = conn.dataChannel?.bufferedAmount
            if (bufferedAmount === undefined || bytesSent >= size) {
                clearInterval(proceed)
                if (mobile) return
                setBytes(size)
                setCount(count => count + 1)
            } else if (bufferedAmount < minBuffer && totalBytes < totalSize) {
                conn.send({ file: file.slice(bytesSent, bytesSent += chunkSize), type: 'file' })
                if (mobile) return
                setBytes(bytesSent)
                setTotalBytes(old => old + chunkSize)
            }
        }, duration);
    }

    function acceptData({ type, bytes, totalBytes }) {
        if (type === 'request') {
            toast.success(`Transferring file(s) to ${peer}`)
            setTime(Date.now())
            sendFile()
        } else if (type === 'progress') {
            setBytes(bytes)
            setTotalBytes(totalBytes)
            if (bytes >= size) setCount(count => count + 1)
        }
    }

    useEffect(() => { conn.on('data', acceptData) }, [])

    useEffect(() => {
        if (!count) return
        if (count >= names.length) return setTotalBytes(totalSize)
        if (isMobile()) {
            conn.removeAllListeners('data')
            conn.on('data', acceptData)
        }
        sendFile(count)
    }, [count])

    return <div className='relative flex flex-col justify-center p-4 pb-0 border rounded text-center bg-gray-50 hover:bg-transparent hover:shadow-lg transition-all duration-300 min-w-[270px]'>
        <GoX className='absolute top-2 right-2 scale-110' onClick={() => conn.close()} />
        <h4 className='font-medium'>{peer}</h4>
        <CircularProgressbarWithChildren value={bytes} maxValue={size} strokeWidth={2.5} className='scale-75' styles={{ path: { stroke: '#48BB6A' } }}>
            <div className='text-sm md:text-base text-center space-y-1 w-1/2 break-words'>
                <div>{bytesToSize(totalBytes, totalSize)} / {bytesToSize(totalSize, totalSize, true)}</div>
                <div>{count} / {names.length} files transferred</div>
                <div>Speed: {speed(totalBytes, totalSize, time)}/s</div>
            </div>
        </CircularProgressbarWithChildren>
    </div >
}