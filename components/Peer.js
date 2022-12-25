import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { GoX } from 'react-icons/go'
import { chunkSize } from '../constants'
import { bytesToSize, speed } from '../modules/functions'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getStorage, setStorage } from '../modules/storage'

export default function Peer({ peer, data }) {
    const { files, names, sizes, totalSize, conn } = data
    const getCount = () => getStorage(`${peer}-count`, 0)
    const setCount = value => setStorage(`${peer}-count`, value)
    const [bytes, setBytes] = useState(0)
    const [totalBytes, setTotalBytes] = useState(0)
    const [time, setTime] = useState(0)

    async function acceptData({ type, bytesReceived = 0, totalBytesReceived = 0 }) {
        if (type === 'request') {
            toast.success(`Transferring file(s) to ${peer}`)
            setTime(Date.now())
            conn.send({ file: files[getCount()].slice(0, chunkSize), name: names[getCount()], size: sizes[getCount()], type: 'file', initial: true })
        } else if (type === 'proceed') {
            setBytes(bytesReceived)
            setTotalBytes(totalBytesReceived)
            if (bytesReceived < sizes[getCount()]) conn.send({ file: files[getCount()].slice(bytesReceived, bytesReceived + chunkSize), name: names[getCount()], size: sizes[getCount()], type: 'file' })
            else {
                setCount(getCount() + 1)
                if (getCount() === names.length) return
                conn.send({ file: files[getCount()].slice(0, chunkSize), name: names[getCount()], size: sizes[getCount()], type: 'file', initial: true })
            }
        }
    }

    useEffect(() => {
        setCount(0)
        conn.on('data', acceptData)
    }, [])

    return <div className='relative flex flex-col justify-center p-4 pb-0 border rounded text-center bg-gray-50 hover:bg-transparent hover:shadow-lg transition-all duration-300'>
        <GoX className='absolute top-2 right-2 scale-110' onClick={() => conn.close()} />
        <h4 className='font-medium'>{peer}</h4>
        <CircularProgressbarWithChildren value={bytes} maxValue={sizes[getCount()]} strokeWidth={2.5} className='scale-75' styles={{ path: { stroke: '#48BB6A' } }}>
            <div className='text-sm md:text-base text-center space-y-1 w-1/2 break-words'>
                <div>{bytesToSize(totalBytes)} / {bytesToSize(totalSize, true)}</div>
                <div>{getCount()} / {names.length} files transferred</div>
                <div>Speed: {speed(totalBytes, totalSize, time)}/s</div>
            </div>
        </CircularProgressbarWithChildren>
    </div >
}
