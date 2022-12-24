import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { GoX } from 'react-icons/go'
import { chunkSize } from '../constants'
import { bytesToSize, speed } from '../modules/functions'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Peer({ peer, data }) {
    const { file, name, size, conn } = data
    const [bytesReceived, setBytesReceived] = useState(0)
    const [time, setTime] = useState(0)

    useEffect(() => {
        console.log(data)
        conn.on('data', async ({ type, bytesReceived = 0 }) => {
            if (type === 'request') {
                toast.success(`Transferring file to ${peer}`)
                setTime(Date.now())
                conn.send({ file: file.slice(0, chunkSize), name, size, type: 'file' })
            } else if (type === 'proceed') {
                setBytesReceived(bytesReceived)
                if (bytesReceived < size) conn.send({ file: file.slice(bytesReceived, bytesReceived + chunkSize), name, size, type: 'file' })
            }
        })
    }, [])

    return <div className='relative flex flex-col justify-center p-4 pb-0 border rounded text-center bg-gray-50 hover:bg-transparent hover:shadow-lg transition-all duration-300'>
        <GoX className='absolute top-2 right-2 scale-110' onClick={() => conn.close()} />
        <h4 className='font-medium'>{peer}</h4>
        <CircularProgressbarWithChildren value={bytesReceived} maxValue={size} strokeWidth={2.5} className='scale-75' styles={{ path: { stroke: '#48BB6A' } }}>
            <div className='text-sm md:text-base text-center space-y-1 w-1/2 break-words'>
                <div>{bytesToSize(bytesReceived)} / {bytesToSize(size, true)} transferred</div>
                <div>Speed: {speed(bytesReceived, size, time)}/s</div>
            </div>
        </CircularProgressbarWithChildren>
    </div >
}
