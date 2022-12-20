/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { servers } from '../../constants';
import { useFileContext } from '../../contexts/ContextProvider';
import { download } from '../../modules/functions';
// import Peer from 'peerjs';

export default function Id({ router }) {
    const { roomId } = router.query
    const { username } = useFileContext();

    useEffect(() => {
        if (!navigator) return
        const Peer = require("peerjs").default
        const peer = new Peer(username, { host: process.env.NEXT_PUBLIC_PEER, port: 10000 })
        const connection = peer.connect(roomId)
        setTimeout(() => { if (!connection._open) console.log("Connection couldn't be established") }, 5000);
        connection.on('close', () => console.log("Connection interrupted"))
        connection.on('data', ({ file, name, size, type }) => {
            if (type==='details') {
                console.log(name, size)
            }
            else if (type === 'file') download(file, name, 'p2p')
        })
    }, [])

    return <>
        {roomId}
    </>
}