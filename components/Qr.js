import React from 'react'
import QRCode from "react-qr-code";

export default function Qr({ link }) {
    return <div>
        <div>Scan the QR Code given below</div>
        <div className='scale-[0.8]'><QRCode value={link} /></div>
    </div>
}