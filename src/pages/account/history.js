/* eslint-disable react-hooks/exhaustive-deps */
import Head from 'next/head'
import Link from 'next/link'
import { options } from '../../constants'
import { useFileContext } from '../../contexts/ContextProvider'
import { relativeTime } from '../../modules/functions'

export default function History({ router }) {
    const { uploadFiles, transferFiles, downloadFiles, clearHistory, setModal } = useFileContext()
    const { filter = 'upload' } = router.query
    const history = filter === 'upload' ? uploadFiles : filter === 'transfer' ? transferFiles : filter === 'download' ? downloadFiles : []

    return <>
        <Head><title>File history | CloudBreeze</title></Head>
        <ul className="flex overflow-x-scroll text-xs xs:text-sm font-medium text-center text-gray-500 border-b border-gray-400 px-1">
            {Object.entries(options).map(([option, label]) => <Link key={option} href={`/account/history?filter=${option}`} replace className={`inline-block p-3 rounded-t-lg ${filter === option ? 'text-white bg-black cursor-default' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer'}`}>
                {label}
                <span className='hidden sm:inline-block'>&nbsp;Files</span>
            </Link>)}
        </ul>
        {!history.length ? <div className='center text-sm xs:text-base'>
            No files to show
        </div> : <div className="overflow-x-auto">
            <div className="pb-2 inline-block min-w-full">
                <table className="min-w-full">
                    <thead className="border-b">
                        <tr>
                            <th scope="col" className="text-sm font-medium text-gray-900 p-4 text-left">S.No.</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 p-4 text-left">Name</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 p-4 text-left">Time left</th>
                        </tr>
                    </thead>
                    <tbody className='cursor-pointer'>
                        {history.map(({ nameList, name, _id: fileId, createdAt, daysLimit, downloadCount }, i) => {
                            if (!nameList[0]) nameList = [name]
                            const minutesLeft = (daysLimit * 24 * 60) - Math.ceil((Date.now() - new Date(createdAt)) / (60 * 1000))
                            if (minutesLeft < 0) return clearHistory(fileId, filter)

                            return <tr key={fileId} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100" onClick={() => setModal({ active: true, type: 'showFile', fileId, filter, downloadCount })}>
                                <td className="text-sm text-gray-900 font-medium px-[1.0625rem] py-4">{i + 1}</td>
                                <td className="text-sm text-gray-900 font-light px-[1.0625rem] py-4" style={{ wordBreak: 'break-word' }}>
                                    <ul className='space-y-1'>
                                        {nameList.map(name => <li key={name}>{name}</li>)}
                                    </ul>
                                </td>
                                <td className="text-sm text-gray-900 font-light px-[1.0625rem] py-4">{relativeTime(minutesLeft)}</td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>}
    </>
}