/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useFileContext } from '../../contexts/ContextProvider'
import capitalize from '../../utilities/capitalize'

export default function History() {
    const { router, token, uploadFiles, setUploadFiles, downloadFiles, clearHistory, fetchApp, setModal } = useFileContext()
    const filters = ['upload', 'download']
    const filter = router.query.filter
    const [history, setHistory] = useState([]) // just to handle the 'initial render not matching' error

    useEffect(() => {
        if (token) {
            fetchApp({ url: 'file/history', method: 'GET', authtoken: token, showToast: false }).then(({ success, files }) => success ? setUploadFiles(files) : setUploadFiles([]))
        }
    }, [])

    useEffect(() => { setHistory(filter === 'upload' ? uploadFiles : downloadFiles) }, [filter, uploadFiles, downloadFiles])

    return <>
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-400 px-1 space-x-0.5">
            {filters.map(value => <Link key={value} href={`/account/history?filter=${value}`}><a className={`inline-block px-4 py-3 rounded-t-lg ${filter === value ? 'text-white bg-black cursor-default' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer'}`}>{capitalize(value)}ed Files</a></Link>)}
        </ul>
        {!history.length ? <div className='center'>
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
                        {history.map(({ nameList, name, fileId, createdAt, daysLimit, downloadCount, _id }, i) => {
                            fileId = fileId || _id
                            if (!nameList[0]) nameList = [name]
                            let hoursLeft, daysLeft;
                            const minutesLeft = (daysLimit * 24 * 60) - Math.ceil((Date.now() - new Date(createdAt)) / (60 * 1000))
                            if (minutesLeft < 0) return clearHistory(fileId, filter)
                            hoursLeft = Math.floor(minutesLeft / 60)
                            daysLeft = Math.floor(hoursLeft / 24)

                            return <tr key={fileId} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100" onClick={() => setModal({ active: true, type: 'showFile', props: { fileId, filter, downloadCount } })}>
                                <td className="text-sm text-gray-900 font-medium px-[1.0625rem] py-4">{i + 1}</td>
                                <td className="text-sm text-gray-900 font-light px-[1.0625rem] py-4" style={{ wordBreak: 'break-word' }}>
                                    {nameList.length !== 1 ? <ul className='space-y-1'>
                                        {nameList.map(name => <li key={name}>{name}</li>)}
                                    </ul> : nameList[0]}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-[1.0625rem] py-4">
                                    {Boolean(daysLeft) && `${daysLeft} day(s)`}
                                    {Boolean(daysLeft && hoursLeft % 24) && ', '}
                                    {hoursLeft % 24 ? `${hoursLeft % 24} hour(s) ` : hoursLeft ? '' : minutesLeft ? `${minutesLeft % 60} minute(s)` : 'Less than a minute'}
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>}
    </>
}
