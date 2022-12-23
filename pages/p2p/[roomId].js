/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import { useFileContext } from '../../contexts/ContextProvider';
import { download } from '../../modules/functions';
// import Peer from 'peerjs';

export default function Id({ router }) {
    const { roomId } = router.query
    const { username } = useFileContext();
    const [connection, setConnection] = useState()
    const [name, setName] = useState()
    const [size, setSize] = useState()
    const [error, setError] = useState()

    const request = () => connection?.send({ type: 'request' })

    useEffect(() => {
        const Peer = require("peerjs").default
        const peer = new Peer(`${username}-${Date.now()}`, { host: 'cloudbreeze-peer.onrender.com' })
        peer.on('open', () => {
            const conn = peer.connect(roomId)
            setTimeout(() => { if (!conn.open) setError("Connection couldn't be established. Try reloading the page!") }, 5000);
            conn.on('open', () => {
                setConnection(conn)
                toast.success('Connection established')
            })
            conn.on('data', ({ file, name, size, type }) => {
                if (type === 'details') {
                    setName(name)
                    setSize(size)
                } else if (type === 'file') download(file, name, 'p2p')
            })
            conn.on('close', () => toast.error("Peer disconnected"))
        })
    }, [])

    return <div>
        {error || <div>
            {name ? <div>
                <div>Name: {name}</div>
                <div>Size: {size}</div>
                <button onClick={request}>Download File</button>
            </div> : <Loader text='Connecting to the peer...' />}
        </div>}
    </div>
}