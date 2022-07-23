/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { useFileContext } from '../../contexts/ContextProvider'
import { FaRegCopy, FaRegTrashAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'

export default function History() {
    const { guest, token, uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles, fetchApp } = useFileContext()
    const [history, setHistory] = useState([]) // just to handle the 'initial render not matching' error
    const filters = ['Uploaded', 'Downloaded']
    const [filter, setFilter] = useState('Uploaded');
    const [limit, setLimit] = useState(30);

    useEffect(() => {
        token ? fetchApp({ url: 'file/history', method: 'GET', authtoken: token, showToast: false }).then(({ success, files }) => success ? setUploadFiles(files) : setUploadFiles([])) : setLimit(limit / 10)
    }, [])

    useEffect(() => { setHistory(filter === 'Uploaded' ? uploadFiles : downloadFiles) }, [filter, uploadFiles, downloadFiles])

    function copyUrl(url) {
        navigator.clipboard.writeText(url)
        toast.success('URL copied to clipboard')
    }

    async function deleteFile(fileId) {
        const { success, files } = await fetchApp({ url: `file/delete/${fileId}`, method: 'DELETE', authtoken: token, data: { guestId: guest } })
        if (!success) return
        if (!token) {
            const updatedFiles = uploadFiles.filter(file => file.fileId !== fileId)
            setUploadFiles(updatedFiles)
        } else setUploadFiles(files)
    }

    return <>
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 px-1 space-x-0.5">
            {filters.map(value => <li key={value} className={`inline-block px-4 py-3 rounded-t-lg ${filter === value ? 'text-white bg-black cursor-default' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer'}`} onClick={() => setFilter(value)}>{value} Files</li>)}
        </ul>
        {!history.length ? <div className='center'>
            No files to show
        </div> : <div className="overflow-x-auto">
            <div className="pb-2 inline-block min-w-full">
                <table className="min-w-full">
                    <thead className="border-b">
                        <tr>
                            <th scope="col" className="text-sm hidden sm:block font-medium text-gray-900 p-4 text-left">S.No.</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 p-4 text-left">Name</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 p-4 text-left">Time left</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 p-4 text-left">Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(({ nameList, name, fileId, createdAt, _id }, i) => {
                            fileId = fileId || _id
                            if (!nameList[0]) nameList = [name]
                            const daysLeft = limit - Math.ceil((Date.now() - new Date(createdAt)) / (30 * 24 * 60 * 60 * 1000))
                            if (daysLeft < 0) {
                                if (filter === 'Uploaded') {
                                    const updatedFiles = uploadFiles.filter(file => file.fileId !== fileId)
                                    setUploadFiles(updatedFiles)
                                } else {
                                    const updatedFiles = downloadFiles.filter(file => file.fileId !== fileId)
                                    setDownloadFiles(updatedFiles)
                                }
                                return;
                            }
                            return <tr key={fileId} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                                <td className="px-5 py-4 hidden sm:block text-sm font-medium text-gray-900">{i + 1}</td>
                                <td className="text-sm text-gray-900 font-light px-5 py-4">
                                    {nameList.length !== 1 ? <ul className='space-y-1'>
                                        {nameList.map(name => <li key={name}>{name}</li>)}
                                    </ul> : nameList[0]}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-5 py-4">{daysLeft ? `${daysLeft} day(s)` : 'Less than a day'}</td>
                                <td className="text-sm text-gray-900 font-light px-5 py-4 space-y-4 sm:space-x-5 sm:space-y-0">
                                    <FaRegCopy className='cursor-pointer scale-110 sm:inline' onClick={() => copyUrl(`${window.location.origin}/file/download/${fileId}`)} />
                                    {filter === 'Uploaded' && <FaRegTrashAlt className='cursor-pointer scale-110 sm:inline' onClick={() => deleteFile(fileId)} />}
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>}
    </>
}
