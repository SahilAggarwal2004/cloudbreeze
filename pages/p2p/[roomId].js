/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BarProgress from '../../components/BarProgress';
import Loader from '../../components/Loader';
import { peerOptions } from '../../constants';
import { bytesToSize, download, speed } from '../../modules/functions';
import { getStorage } from '../../modules/storage';

export default function Id({ router }) {
    const { roomId } = router.query
    const [connection, setConnection] = useState()
    const [file, setFile] = useState()
    const [size, setSize] = useState()
    const [bytes, setBytes] = useState(-1)
    const [time, setTime] = useState(0)
    const [error, setError] = useState()
    const downPercent = Math.round(bytes * 100 / size) - +(bytes < 0);
    const isDownloading = downPercent >= 0

    const request = () => {
        connection?.send({ type: 'request' })
        setBytes(0)
        setTime(Date.now())
    }

    useEffect(() => {
        const Peer = require("peerjs").default
        const peer = new Peer(peerOptions)
        peer.on('open', () => {
            let fileName, fileSize, bytes, totalBytes = 0, blob = new Blob([]);
            const conn = peer.connect(roomId, { metadata: getStorage('username') })
            setTimeout(() => { if (!conn.open) setError("Connection couldn't be established. Retry again!") }, 5000);
            conn.on('open', () => {
                setConnection(conn)
                toast.success('Connection established')
            })
            conn.on('data', ({ type, name, length, totalSize, chunk, size, initial = false }) => {
                if (type === 'details') {
                    setFile(length === 1 ? name : `${length} files`)
                    setSize(totalSize)
                } else if (type === 'file') {
                    const { byteLength } = chunk;
                    totalBytes += byteLength
                    if (initial) {
                        fileName = name
                        fileSize = size
                        blob = new Blob([chunk])
                        bytes = byteLength
                    } else {
                        blob = new Blob([blob, chunk])
                        bytes += byteLength
                    }
                    conn.send({ type: 'progress', bytes, totalBytes })
                    setBytes(old => old + byteLength)
                    if (bytes === fileSize) download(blob, fileName)
                }
            })
            conn.on('close', () => toast.error("Peer disconnected"))
        })
        return () => {
            peer.removeAllListeners()
            peer.destroy()
        }
    }, [])

    return <>
        {error ? <div className='center space-y-5 text-center'>
            <h3 className='text-lg'>{error}</h3>
            <button className='mt-1 py-1 px-2 rounded-md border-[1.5px] border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-300' onClick={() => window.location.reload()}>Retry</button>
        </div> : file ? <div className='w-max min-w-[90vw] sm:min-w-[60vw] md:min-w-[40vw] lg:min-w-[25vw] x-center grid grid-cols-[auto_1fr] gap-2 px-2'>
            <span>File:</span>
            <span className='text-right'>{file}</span>
            <span>Size:</span>
            <span className='text-right'>{bytesToSize(size, size, true)}</span>
            <button className='primary-button' disabled={isDownloading} onClick={request}>Download File</button>
            {isDownloading && <>
                <BarProgress percent={downPercent} className='col-span-2 max-w-[100%]' />
                <div className='text-center w-full col-span-2'>Speed: {speed(bytes, size, time)}/s</div>
            </>}
        </div> : <Loader text='Connecting to the peer...' className='center flex flex-col items-center space-y-2 text-lg' />}
    </>
}