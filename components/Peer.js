/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { GoX } from 'react-icons/go'
import { chunkSize } from '../constants'
import { bytesToSize, speed } from '../modules/functions'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useFileContext } from '../contexts/ContextProvider'

export default function Peer({ names, sizes, totalSize, data }) {
    const { name, conn } = data
    const channel = conn.dataChannel
    const { files } = useFileContext()
    const [count, setCount] = useState(0)
    const [bytes, setBytes] = useState(0)
    const [totalBytes, setTotalBytes] = useState(0)
    const [time, setTime] = useState(0)
    const file = files[count]
    const size = sizes[count]

    function sendFile() {
        conn.send({ name: names[count], size, type: 'initial' })
        let bytesSent = 0
        const reader = new FileReader();
        const readChunk = () => reader.readAsArrayBuffer(file.slice(bytesSent, bytesSent += chunkSize))
        reader.onload = ({ target: { result: chunk, error } }) => {
            if (error) return readChunk();
            const proceed = setInterval(() => {
                if (channel.bufferedAmount > chunkSize) return;
                conn.send({ chunk, type: 'file' });
                clearInterval(proceed)
                if (bytesSent < size) readChunk();
            }, 10);
        };
        readChunk()
    }

    function acceptData({ type, bytes }) {
        if (type === 'request') {
            toast.success(`Transferring file(s) to ${name}`)
            setTime(Date.now())
            sendFile()
        } else if (type === 'progress') {
            setBytes(bytes)
            setTotalBytes(totalBytes + bytes)
            if (bytes >= size) setCount(count + 1)
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
        sendFile()
    }, [count])

    return <div className='relative flex flex-col justify-center p-4 pb-0 border rounded text-center bg-gray-50 hover:bg-transparent hover:shadow-lg transition-all duration-300 min-w-[270px]'>
        <GoX className='absolute top-2 right-2 scale-110' onClick={() => conn.close()} />
        <h4 className='font-medium'>{name}</h4>
        <CircularProgressbarWithChildren value={bytes} maxValue={size} strokeWidth={2.5} className='scale-75' styles={{ path: { stroke: '#48BB6A' } }}>
            <div className='text-sm md:text-base text-center space-y-1 w-1/2 break-words'>
                <div>{bytesToSize(totalBytes, totalSize)} / {bytesToSize(totalSize, totalSize, true)}</div>
                <div>{count} / {names.length} files transferred</div>
                <div>Speed: {speed(totalBytes, totalSize, time)}/s</div>
            </div>
        </CircularProgressbarWithChildren>
    </div>
}