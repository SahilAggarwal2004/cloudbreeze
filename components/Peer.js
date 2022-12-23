import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { chunkSize } from '../constants'

export default function Peer({ peer, data }) {
    const { file, name, size, conn } = data
    const [bytesReceived, setBytesReceived] = useState(0)

    useEffect(() => {
        conn.on('data', async ({ type, bytesReceived = 0 }) => {
            if (type === 'request') {
                toast.success(`Transferring file to ${peer}`)
                conn.send({ file: file.slice(0, chunkSize), name, size, type: 'file' })
            } else if (type === 'proceed') {
                setBytesReceived(bytesReceived)
                if (bytesReceived < size) conn.send({ file: file.slice(bytesReceived, bytesReceived + chunkSize), name, size, type: 'file' })
            }
        })
    }, [])

    return <div className='inline-block'>
        <h4>{peer}</h4>
        <div>{bytesReceived / 1024 / 1024} MB transferred</div>
        <div>{Math.round(bytesReceived * 100 / size)}%</div>
    </div>
}
