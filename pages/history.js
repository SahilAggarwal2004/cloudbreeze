/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { useFileContext } from '../contexts/ContextProvider'
import { FaRegCopy, FaRegTrashAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'

export default function History() {
    const { uploadFiles, downloadFiles } = useFileContext()
    const [history, setHistory] = useState([]) // just to handle the 'initial render not matching' error
    const filter = 'All';

    useEffect(() => { setHistory(uploadFiles.concat(downloadFiles)) }, [])

    function copyUrl(fileId) {
        navigator.clipboard.writeText(`${window.location.origin}/download/${fileId}`)
        toast.success('URL copied to clipboard')
    }

    async function deleteFile(fileId) {
        const { error } = await fetchApp({ url: `file/get/${fileId}`, method: 'DELETE' })
        error ? toast.error(error) : toast.success('File deleted successfully!')
    }

    return <>
        <h1 className='text-center text-xl font-bold mb-2'>{filter} Files</h1>
        <div className="overflow-x-auto">
            <div className="py-2 inline-block min-w-full">
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
                        {history.map(({ nameList, fileId, createdAt, type }, i) => {
                            const daysLeft = 30 - Math.ceil((Date.now() - new Date(createdAt)) / (30 * 24 * 60 * 60 * 1000))
                            if (daysLeft < 0) {
                                const updatedFiles = uploadFiles.filter(file => file.fileId !== fileId)
                                setUploadFiles(updatedFiles)
                                return;
                            }
                            return <tr key={fileId} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                                <td className="px-5 py-4 hidden sm:block text-sm font-medium text-gray-900">{i + 1}</td>
                                <td className="text-sm text-gray-900 font-light px-5 py-4">
                                    {nameList.length !== 1 ? <ul className='space-y-1'>
                                        {nameList.map(name => <li key={name}>{name}</li>)}
                                    </ul> : nameList[0]}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-5 py-4">{daysLeft} day(s)</td>
                                <td className="text-sm text-gray-900 font-light px-5 py-4 space-y-4 sm:space-x-5 sm:space-y-0">
                                    <FaRegCopy className='cursor-pointer scale-110 sm:inline' onClick={() => copyUrl(fileId)} />
                                    {type === 'upload' && <FaRegTrashAlt className='cursor-pointer scale-110 sm:inline' onClick={() => deleteFile(fileId)} />}
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </>
}
