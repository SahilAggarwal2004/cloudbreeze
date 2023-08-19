import React from 'react'

export default function ModeSelect({ mode, setMode, modes }) {
    return <div className="flex rounded-xl bg-gray-100 p-1 text-gray-900 w-max mx-auto mb-5">
        <ul className="flex w-full list-none gap-1 sm:w-auto">
            {modes.map(({ value, label }) => <li key={value} className="w-full">
                <button type="button" className="w-full cursor-pointer" onClick={() => setMode(value)}>
                    <div className={`relative flex w-full items-center justify-center gap-1 rounded-lg border py-2 outline-none transition-opacity duration-100 sm:w-auto sm:min-w-[148px] md:gap-2 md:py-2.5 ${mode === value ? 'border-black/10 bg-white text-gray-900 shadow-[0_1px_7px_0px_rgba(0,0,0,0.06)] hover:!opacity-100' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        <span className="truncate text-sm font-medium px-2">{label}</span>
                    </div>
                </button>
            </li>)}
        </ul>
    </div>
}
