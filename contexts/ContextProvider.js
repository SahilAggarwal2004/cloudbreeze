/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { randomName } from 'random-stuff-js';
import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { fetchHistory, onlyGuest, types } from '../constants';
import useStorage from '../hooks/useStorage';
import { getStorage, setStorage } from '../modules/storage';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API

const Context = createContext();
export const useFileContext = () => useContext(Context)

export default function ContextProvider({ children, router }) {
    const [uploadFiles, setUploadFiles] = useStorage('upload-files', [])
    const [downloadFiles, setDownloadFiles] = useStorage('download-files', [])
    const [type, setType] = useStorage('type', '')
    const [progress, setProgress] = useState(0)
    const [modal, setModal] = useState({ active: false })
    const [files, setFiles] = useState([])

    async function logout(type) {
        if (type === 'manual') toast.success('Logged out successfully')
        else if (type === 'auto') router.push('/account')
        setStorage('username', randomName())
        setStorage('guest', crypto.randomUUID())
        setType('guest')
        setUploadFiles([])
        setDownloadFiles([])
    }

    async function fetchApp({ url, token, method = 'GET', type = 'application/json', data = {}, options = {}, showToast = true, showProgress = true }) {
        try {
            if (showProgress) setProgress(100 / 3)
            const response = await axios({
                url, method, data, ...options,
                headers: {
                    'Content-Type': type,
                    token: token || getStorage('token'),
                    guest: getStorage('guest')
                }
            })
            if (showProgress) setProgress(100)
            var json = response.data;
            if (showToast) toast.success(json.msg)
        } catch (err) {
            if (showProgress) setProgress(100)
            if (!json) {
                const error = err.response?.data?.error || "Please check your internet connectivity"
                json = { success: false, error }
                const authenticationError = error.includes('authenticate')
                if (authenticationError) logout('auto')
                if (authenticationError || showToast === true) toast.error(error)
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

    useEffect(() => { getStorage('username', randomName()) }, [])

    useEffect(() => {
        if (!type) logout()
        else if (types.includes(type) && onlyGuest.includes(router.pathname)) router.replace('/account')
        else if (fetchHistory.includes(router.pathname)) fetchApp({ url: 'file/history', method: 'POST', showToast: false }).then(({ success, files }) => success && setUploadFiles(files))
    }, [router.pathname])


    return <Context.Provider value={{ uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles, fetchApp, progress, setProgress, logout, clearHistory, modal, setModal, files, setFiles, type, setType }}>
        {children}
    </Context.Provider>
}