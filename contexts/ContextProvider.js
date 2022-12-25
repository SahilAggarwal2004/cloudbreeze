/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { randomName } from 'random-stuff-js';
import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { fetchHistory } from '../constants';
import useStorage from '../hooks/useStorage';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API

const Context = createContext();
export const useFileContext = () => useContext(Context)

export default function ContextProvider({ children, router }) {
    const [uploadFiles, setUploadFiles] = useStorage('upload-files', [])
    const [downloadFiles, setDownloadFiles] = useStorage('download-files', [])
    const [username, setUsername] = useStorage('username', '')
    const [type, setType] = useStorage('type', '')
    const [progress, setProgress] = useState(0)
    const [modal, setModal] = useState({ active: false })
    const [files, setFiles] = useState()

    async function logout(type) {
        if (type === 'manual') {
            const { success } = await fetchApp({ url: 'auth/logout' })
            if (!success) return;
            toast.success('Logged out successfully')
        } else router.push('/account')
        setUsername(randomName())
        setType('guest')
        setUploadFiles([])
        setDownloadFiles([])
    }

    async function fetchApp({ url, authtoken, method = 'GET', type = 'application/json', data = {}, options = {}, showToast = true, showProgress = true }) {
        let json;
        try {
            if (showProgress) setProgress(100 / 3)
            const response = await axios({
                url, method, withCredentials: true, data, ...options,
                headers: { authtoken, 'Content-Type': type }
            })
            if (showProgress) setProgress(100)
            json = response.data;
            if (showToast) toast.success(json.msg)
        } catch (err) {
            if (showProgress) setProgress(100)
            if (!json) {
                const error = err.response?.data?.error || "Please check your internet connectivity"
                json = { success: false, error }
                const authenticationError = error.includes('authenticate')
                if (authenticationError) logout('auto')
                if (showToast || authenticationError) toast.error(error)
            }
        }
        return json
    }

    function clearHistory(fileId, filter) {
        let updatedFiles;
        if (filter === 'upload') {
            updatedFiles = uploadFiles.filter(({ _id }) => _id !== fileId)
            setUploadFiles(updatedFiles)
        } else if (filter === 'download') {
            updatedFiles = downloadFiles.filter(({ _id }) => _id !== fileId)
            setDownloadFiles(updatedFiles)
        }
    }

    useEffect(() => { if (!username) setUsername(randomName()) }, [])

    useEffect(() => {
        if (!type) fetchApp({ url: 'auth/logout', showProgress: false, showToast: false }).then(({ success }) => success && setType('guest'))
        else if (fetchHistory.includes(router.pathname)) fetchApp({ url: 'file/history', method: 'POST', showToast: false }).then(({ success, files }) => success && setUploadFiles(files))
    }, [router.pathname])


    return <Context.Provider value={{ username, setUsername, type, setType, uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles, fetchApp, progress, setProgress, logout, clearHistory, modal, setModal, files, setFiles }}>
        {children}
    </Context.Provider>
}