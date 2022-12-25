/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BarProgress from '../../components/BarProgress';
import Loader from '../../components/Loader';
import { useFileContext } from '../../contexts/ContextProvider';
import { bytesToSize, download, speed } from '../../modules/functions';

export default function Id({ router }) {
    const { roomId } = router.query
    const { username } = useFileContext();
    const [connection, setConnection] = useState()
    const [file, setFile] = useState()
    const [size, setSize] = useState()
    const [bytes, setBytes] = useState(0)
    const [time, setTime] = useState(0)
    const [error, setError] = useState()
    const downPercent = Math.round(bytes * 100 / size);
    const isDownloading = downPercent > 0

    const request = () => {
        connection?.send({ type: 'request' })
        setTime(Date.now())
    }

    useEffect(() => {
        const Peer = require("peerjs").default
        const peer = new Peer({ host: 'cloudbreeze-peer.onrender.com', secure: true })
        peer.on('open', () => {
            let blob = new Blob([])
            let bytes = 0
            const conn = peer.connect(roomId, { metadata: username })
            setTimeout(() => { if (!conn.open) setError("Connection couldn't be established. Retry again!") }, 5000);
            conn.on('open', () => {
                setConnection(conn)
                toast.success('Connection established')
            })
            conn.on('data', ({ type, names, totalSize, file, name, size, initial = false }) => {
                if (type === 'details') {
                    const len = names.length
                    setFile(len === 1 ? names[0] : `${len} files`)
                    setSize(totalSize)
                } else if (type === 'file') {
                    const { byteLength } = file;
                    if (initial) {
                        blob = new Blob([file])
                        bytes = byteLength
                    } else {
                        blob = new Blob([blob, file])
                        bytes += byteLength
                    }
                    conn.send({ type: 'proceed', bytesReceived: bytes })
                    setBytes(old => old + byteLength)
                    if (bytes === size) download(blob, name)
                }
            })
            conn.on('close', () => toast.error("Peer disconnected"))
        })
    }, [])

    return <>
        {error ? <div className='center space-y-5 text-center'>
            <h3 className='text-lg'>{error}</h3>
            <button className='mt-1 py-1 px-2 rounded-md border-[1.5px] border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-300' onClick={() => window.location.reload()}>Retry</button>
        </div> : file ? <div className='w-max min-w-[90vw] sm:min-w-[60vw] md:min-w-[40vw] lg:min-w-[25vw] x-center grid grid-cols-[auto_1fr] gap-2 px-2'>
            <span>File:</span>
            <span className='text-right'>{file}</span>
            <span>Size:</span>
            <span className='text-right'>{bytesToSize(size, true)}</span>
            <button className='primary-button' disabled={isDownloading} onClick={request}>Download File</button>
            {isDownloading && <>
                <BarProgress percent={downPercent} className='col-span-2 max-w-[100%]' />
                <div className='text-center w-full col-span-2'>Speed: {speed(bytes, size, time)}/s</div>
            </>}
        </div> : <Loader text='Connecting to the peer...' className='center flex flex-col items-center space-y-2 text-lg' />}
    </>
}