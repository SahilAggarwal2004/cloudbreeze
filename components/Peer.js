import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { GoX } from 'react-icons/go'
import { chunkSize } from '../constants'
import { bytesToSize, speed } from '../modules/functions'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useFileContext } from '../contexts/ContextProvider'
import { getStorage, setStorage } from '../modules/storage'

export default function Peer({ peer, names, sizes, totalSize, conn }) {
    const { files } = useFileContext()
    const [count, setCount] = useState(0)
    const [totalBytes, setTotalBytes] = useState(0)
    const [time, setTime] = useState(0)
    const size = sizes[count]

    function sendFile(i = 0) {
        const file = files[i]
        const size = sizes[i]
        conn.send({ file: file.slice(0, chunkSize), name: names[i], size, type: 'file', initial: true })
        let bytesSent = chunkSize
        const proceed = setInterval(() => {
            if (bytesSent >= size) {
                clearInterval(proceed)
                if (i < files.length - 1) sendFile(i + 1)
            } else if (bytesSent - getStorage('bytes') < 10485760) conn.send({ file: file.slice(bytesSent, bytesSent += chunkSize), type: 'file' })
        }, 25);
    }

    function acceptData({ type, bytesReceived = 0, totalBytesReceived = 0 }) {
        if (type === 'request') {
            toast.success(`Transferring file(s) to ${peer}`)
            setTime(Date.now())
            sendFile()
        } else if (type === 'proceed') {
            setStorage('bytes', bytesReceived)
            setTotalBytes(totalBytesReceived)
            if (bytesReceived >= size) setCount(count + 1)
        }
    }

    useEffect(() => {
        setStorage('bytes', 0)
        conn.on('data', acceptData)
        return () => {
            conn.removeAllListeners()
            conn.close()
        }
    }, [])

    return <div className='relative flex flex-col justify-center p-4 pb-0 border rounded text-center bg-gray-50 hover:bg-transparent hover:shadow-lg transition-all duration-300 min-w-[270px]'>
        <GoX className='absolute top-2 right-2 scale-110' onClick={() => conn.close()} />
        <h4 className='font-medium'>{peer}</h4>
        <CircularProgressbarWithChildren value={getStorage('bytes')} maxValue={size} strokeWidth={2.5} className='scale-75' styles={{ path: { stroke: '#48BB6A' } }}>
            <div className='text-sm md:text-base text-center space-y-1 w-1/2 break-words'>
                <div>{bytesToSize(totalBytes)} / {bytesToSize(totalSize, true)}</div>
                <div>{count} / {names.length} files transferred</div>
                <div>Speed: {speed(totalBytes, totalSize, time)}/s</div>
            </div>
        </CircularProgressbarWithChildren>
    </div >
}