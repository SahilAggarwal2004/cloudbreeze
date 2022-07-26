import Image from 'next/image'
import React from 'react'

export default function Logo() {
    return <div className="h-16 text-center select-none">
        <Image src="/logo.png" alt="CloudBreeze" width={75} height={75} priority />
    </div>
}
