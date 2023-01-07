import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { GoX } from 'react-icons/go'
import { chunkSize } from '../constants'
import { bytesToSize, speed } from '../modules/functions'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useFileContext } from '../contexts/ContextProvider'

export default function Peer({ peer, names, sizes, totalSize, conn }) {
    const { files } = useFileContext();
    const [count, setCount] = useState(0)
    const [bytes, setBytes] = useState(0)
    const [totalBytes, setTotalBytes] = useState(0)
    const [time, setTime] = useState(0)
    const file = files[count]
    const name = names[count]
    const size = sizes[count]

    function acceptData({ type, bytesReceived = 0, totalBytesReceived = 0 }) {
        if (type === 'request') {
            toast.success(`Transferring file(s) to ${peer}`)
            setTime(Date.now())
            conn.send({ file: file.slice(0, chunkSize), name, size, type: 'file', initial: true })
        } else if (type === 'proceed') {
            setBytes(bytesReceived)
            setTotalBytes(totalBytesReceived)
            if (bytesReceived < size) conn.send({ file: file.slice(bytesReceived, bytesReceived + chunkSize), type: 'file' })
            else setCount(count + 1)
        }
    }

    useEffect(() => {
        conn.on('data', acceptData)
        return () => {
            conn.removeAllListeners()
            conn.close()
        }
    }, [])

    useEffect(() => {
        if (!count) return
        conn.removeAllListeners('data')
        if (totalBytes >= totalSize) return
        conn.on('data', acceptData)
        conn.send({ file: file.slice(0, chunkSize), name, size, type: 'file', initial: true })
    }, [count])


    return <div className='relative flex flex-col justify-center p-4 pb-0 border rounded text-center bg-gray-50 hover:bg-transparent hover:shadow-lg transition-all duration-300 min-w-[270px]'>
        <GoX className='absolute top-2 right-2 scale-110' onClick={() => conn.close()} />
        <h4 className='font-medium'>{peer}</h4>
        <CircularProgressbarWithChildren value={bytes} maxValue={size} strokeWidth={2.5} className='scale-75' styles={{ path: { stroke: '#48BB6A' } }}>
            <div className='text-sm md:text-base text-center space-y-1 w-1/2 break-words'>
                <div>{bytesToSize(totalBytes)} / {bytesToSize(totalSize, true)}</div>
                <div>{count} / {names.length} files transferred</div>
                <div>Speed: {speed(totalBytes, totalSize, time)}/s</div>
            </div>
        </CircularProgressbarWithChildren>
    </div >
}