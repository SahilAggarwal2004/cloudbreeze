/* eslint-disable react-hooks/exhaustive-deps */
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCopy } from 'react-icons/fa';
import { Balancer } from 'react-wrap-balancer';
import BarProgress from '../../components/BarProgress';
import Loader from '../../components/Loader';
import useError from '../../hooks/useError';
import { peerOptions } from '../../constants';
import { bytesToSize, bytesToUnit, download, speed } from '../../modules/functions';
import { getStorage } from '../../modules/storage';

export default function Id({ router }) {
    const { roomId } = router.query
    const peerRef = useRef();
    const connection = useRef();
    const [file, setFile] = useState()
    const [size, setSize] = useState(0)
    const [text, setText] = useState()
    const [unit, setUnit] = useState('B')
    const [bytes, setBytes] = useState(-1)
    const [time, setTime] = useState(0)
    const [error, setError, clearError] = useError("Connection couldn't be established. Retry again!")
    const downPercent = Math.round(bytes * 100 / size)
    const isDownloading = bytes >= 0

    function connect() {
        let fileName, fileSize, bytes, blob, timeout;
        const conn = connection.current = peerRef.current.connect(roomId, { metadata: getStorage('username'), reliable: true })
        conn.on('open', () => {
            peerRef.current.off('error')
            clearError()
            setBytes(-1)
            toast.success('Connection established')
        })
        conn.on('data', async data => {
            const { byteLength, name, size, text, totalSize, type } = data
            if (!type) {
                setBytes(old => old + byteLength)
                blob = new Blob([blob, data])
                if ((bytes += byteLength) !== fileSize) return
                try {
                    conn.send({ type: 'next' })
                    await download(blob, fileName)
                    toast.success('File downloaded successfully!')
                } catch { toast.error("Couldn't download file") }
            } else if (type === 'initial') {
                fileName = name
                fileSize = size
                bytes = 0
                blob = new Blob()
            } else if (type === 'details') {
                setFile(name)
                setSize(totalSize)
                setText(text)
                setUnit(bytesToUnit(totalSize))
            } else if (type === 'text') {
                setText(text)
                toast.success('Text updated')
            }
        })
        conn.on('close', () => {
            peerRef.current.on('error', setError)
            conn.removeAllListeners()
            toast.error("Peer disconnected")
        })
        conn.on('iceStateChanged', state => {
            if (state === 'connected') clearTimeout(timeout)
            else if (state === 'disconnected') {
                timeout = setTimeout(() => {
                    peerRef.current.on('error', setError)
                    retry()
                }, peerOptions.pingInterval * 2)
            }
        })
    }

    function request() {
        connection.current?.send({ type: 'request' })
        setBytes(0)
        setTime(Date.now())
    }

    function retry(manual = false) {
        if (manual && !navigator.onLine) return toast.error('Please check your internet connectivity')
        connection.current?.removeAllListeners()
        connection.current?.close()
        connect()
        setFile()
        setText()
        setBytes(-1)
        clearError()
    }

    function copy() {
        navigator.clipboard.writeText(text)
        toast.success('Text copied to clipboard!')
    }

    useEffect(() => {
        const Peer = require("peerjs").default
        const peer = peerRef.current = new Peer(peerOptions)
        peer.on('open', connect)
        peer.on('error', setError)
        peer.on('disconnected', () => peer.reconnect())
        return () => {
            peer.removeAllListeners()
            peer.destroy()
        }
    }, [])

    return <>
        <Head><title>Peer-to-peer transfer | CloudBreeze</title></Head>
        {error ? <div className='center space-y-5 text-center'>
            <h3 className='text-lg'>{error}</h3>
            <button className='mt-1 py-1 px-2 rounded-md border-[1.5px] border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-300' onClick={() => retry(true)}>Retry</button>
        </div> : !file && !text ? <Loader text='Connecting to the peer...' className='center flex flex-col items-center space-y-2 text-lg' /> : <div className='mb-[4.5rem] space-y-8'>
            {file && <div className='flex justify-center'>
                <div className='w-max min-w-[90vw] sm:min-w-[60vw] md:min-w-[40vw] lg:min-w-[25vw] max-w-full grid grid-cols-[auto_1fr] gap-2 px-2'>
                    <span className='text-lg font-medium col-span-2 text-center'>Files</span>
                    <span>File:</span>
                    <span className='text-right'>{file}</span>
                    <span>Size:</span>
                    <span className='text-right'>{bytesToSize(size, size, unit)} {unit}</span>
                    <button className='primary-button' disabled={isDownloading} onClick={request}>Download</button>
                    {isDownloading && <>
                        <BarProgress percent={downPercent} className='col-span-2 max-w-[100%]' />
                        {bytes !== size && <div className='text-center w-full col-span-2'>Speed: {speed(bytes, size, unit, time)} {unit}/s</div>}
                    </>}
                </div>
            </div>}
            {text && <div className='flex flex-col items-center px-3 text-justify space-y-1'>
                <div className='flex items-center space-x-2'>
                    <span className='text-lg font-medium'>Text</span>
                    <FaCopy className='cursor-pointer' onClick={copy} />
                </div>
                <div className='whitespace-pre-line' style={{ wordBreak: 'break-word' }}>
                    <Balancer>{text}</Balancer>
                </div>
            </div>}
        </div>}
    </>
}