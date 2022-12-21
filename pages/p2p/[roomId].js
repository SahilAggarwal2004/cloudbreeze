/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useFileContext } from '../../contexts/ContextProvider';
import { download } from '../../modules/functions';
// import Peer from 'peerjs';

export default function Id({ router }) {
    const { roomId } = router.query
    const { username } = useFileContext();

    useEffect(() => {
        const Peer = require("peerjs").default
        const peer = new Peer()
        const connection = peer.connect(roomId + '-cloudbreeze')
        console.log(peer)
        setTimeout(() => {
            if (!connection.open) {
                console.log(connection)
                console.log("Connection couldn't be established")
            }
        }, 5000);
        connection.on('open', () => console.log('Miracle'))
        connection.on('close', () => console.log("Connection interrupted"))
        connection.on('data', ({ file, name, size, type }) => {
            console.log(type)
            if (type === 'details') {
                console.log(name, size)
            }
            else if (type === 'file') download(file, name, 'p2p')
        })
    }, [])

    return <>
        {roomId}
    </>
}