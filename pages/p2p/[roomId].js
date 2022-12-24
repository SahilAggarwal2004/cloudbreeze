/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BarProgress from '../../components/BarProgress';
import Loader from '../../components/Loader';
import { useFileContext } from '../../contexts/ContextProvider';
import { bytesToMb, download, speed } from '../../modules/functions';
// import Peer from 'peerjs';

export default function Id({ router }) {
    const { roomId } = router.query
    const { username } = useFileContext();
    const [connection, setConnection] = useState()
    const [name, setName] = useState()
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
            const dataList = []
            let bytes = 0
            const conn = peer.connect(roomId, { metadata: username })
            setTimeout(() => { if (!conn.open) setError("Connection couldn't be established. Retry again!") }, 5000);
            conn.on('open', () => {
                setConnection(conn)
                toast.success('Connection established')
            })
            conn.on('data', ({ file, name, size, type }) => {
                if (type === 'details') {
                    setName(name)
                    setSize(size)
                } else if (type === 'file') {
                    bytes += file.byteLength;
                    conn.send({ type: 'proceed', bytesReceived: bytes })
                    dataList.push(file)
                    setBytes(bytes)
                    if (bytes >= size) download(dataList, name, 'p2p')
                }
            })
            conn.on('close', () => toast.error("Peer disconnected"))
        })
    }, [])

    return <>
        {error ? <div className='center space-y-5 text-center'>
            <h3 className='text-lg'>{error}</h3>
            <button className='mt-1 py-1 px-2 rounded-md border-[1.5px] border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-300' onClick={() => window.location.reload()}>Retry</button>
        </div> : name ? <div className='w-fit x-center grid grid-cols-[auto_1fr] gap-2 px-2'>
            <span>Name:</span>
            <span>{name}</span>
            <span>Size:</span>
            <span>{bytesToMb(size)} MB</span>
            <button className='primary-button' disabled={isDownloading} onClick={request}>Download File</button>
            {isDownloading && <>
                <BarProgress percent={downPercent} className='col-span-2' />
                <div className='text-center w-full col-span-2'>Speed: {speed(bytes, size, time)} MB/s</div>
            </>}
        </div> : <Loader text='Connecting to the peer...' className='center flex flex-col items-center space-y-2 text-lg' />}
    </>
}