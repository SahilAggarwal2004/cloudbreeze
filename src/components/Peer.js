/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { FaXmark } from 'react-icons/fa6'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { wait } from 'utility-kit'
import { chunkSize, maxBufferSize } from '../constants'
import { bytesToFraction, bytesToUnit, speed } from '../modules/functions'
import 'react-circular-progressbar/dist/styles.css';
import { useFileContext } from '../contexts/ContextProvider'

const reader = typeof FileReader !== "undefined" && new FileReader();

export default function Peer({ data, names, sizes, totalSize }) {
    const { name, conn } = data
    const { files } = useFileContext()
    const [count, setCount] = useState(0)
    const [bytes, setBytes] = useState(0)
    const [time, setTime] = useState(0)
    const file = useMemo(() => files[count], [count])
    const size = useMemo(() => sizes[count], [count])
    const unit = useMemo(() => bytesToUnit(totalSize), [])
    const prevBytes = useMemo(() => sizes.slice(0, count).reduce((size, cur) => size + cur, 0), [count])
    const totalBytes = prevBytes + bytes

    function sendFile() {
        conn.send({ name: names[count], size, type: 'initial' })
        let bytesSent = 0;
        const channel = conn.dataChannel
        const readChunk = () => reader.readAsArrayBuffer(file.slice(bytesSent, bytesSent + chunkSize))
        reader.onload = async ({ target: { result, error } }) => {
            if (error || !conn.open) return readChunk();
            while (channel.bufferedAmount > maxBufferSize) await wait(0);
            setBytes(bytesSent)
            if ((bytesSent += chunkSize) < size) readChunk();
            conn.send(result);
        };
        readChunk()
    }

    function acceptData({ type }) {
        if (type === 'request') {
            toast.success(`Transferring file(s) to ${name}`)
            setTime(Date.now())
            sendFile()
        } else if (type === 'next') {
            setBytes(0)
            setCount(count + 1)
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
        conn.off('data')
        reader.onload = null;
        if (totalBytes >= totalSize) return
        conn.on('data', acceptData)
        sendFile()
    }, [count])

    return <div className='relative flex flex-col justify-center p-4 pb-0 border rounded text-center bg-gray-50 hover:bg-transparent hover:shadow-lg transition-all duration-300 min-w-[270px]'>
        <FaXmark className='absolute top-2 right-2 scale-110' onClick={() => conn.close()} />
        <h4 className='font-medium'>{name}</h4>
        <CircularProgressbarWithChildren value={bytes} maxValue={size} strokeWidth={2.5} className='scale-75' styles={{ path: { stroke: '#48BB6A' } }}>
            <div className='text-sm md:text-base text-center space-y-1 w-1/2 break-words'>
                <div>{bytesToFraction(totalBytes, totalSize, unit)} {unit}</div>
                <div>{count} / {names.length} files transferred</div>
                {totalBytes !== totalSize && <div>Speed: {speed(totalBytes, totalSize, unit, time)} {unit}/s</div>}
            </div>
        </CircularProgressbarWithChildren>
    </div>
}