import React from 'react'

export default function Loader({ style, text }) {
    return <div className={style}>
        <div className='w-[1.375rem] h-[1.375rem] border-2 border-transparent border-t-black border-b-black rounded-[50%] animate-spin-fast' />
        <div>{text}</div>
    </div>
}
