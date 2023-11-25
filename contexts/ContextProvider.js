/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { randomName } from 'random-stuff-js';
import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { fetchHistory, onlyGuest, types } from '../constants';
import useStorage from '../hooks/useStorage';
import { getStorage, removeStorage, setStorage } from '../modules/storage';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API

const dimensions = typeof screen !== 'undefined' && screen.width + screen.height

const Context = createContext();
export const useFileContext = () => useContext(Context)

export default function ContextProvider({ children, router, setLoading }) {
    const [uploadFiles, setUploadFiles] = useStorage('upload-files', [])
    const [downloadFiles, setDownloadFiles] = useStorage('download-files', [])
    const [transferFiles, setTransferFiles] = useStorage('transfer-files', [])
    const [type, setType] = useStorage('type', '')
    const [progress, setProgress] = useState(0)
    const [modal, setModal] = useState({ active: false })
    const [files, setFiles] = useState([])

    async function logout(type = 'auto') {
        if (type === 'auto') router.push('/account')
        else if (type === 'manual') toast.success('Logged out successfully')
        setStorage('username', randomName())
        removeStorage('token')
        setStorage('guest', crypto.randomUUID?.() || Date.now())
        setType('guest')
        setUploadFiles([])
        setTransferFiles([])
        setDownloadFiles([])
    }

    async function fetchApp({ url, token, method = 'GET', type = 'application/json', data = {}, options = {}, showToast = true, showProgress = true }) {
        try {
            if (showProgress) setProgress(100 / 3)
            const response = await axios({
                url, method, data, ...options,
                headers: {
                    'Content-Type': type, dimensions,
                    token: token || getStorage('token'), guest: getStorage('guest')
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
                const authenticationError = error.toLowerCase().includes('session expired')
                if (authenticationError) logout()
                if (authenticationError || showToast === true) toast.error(error)
            }
        }
        return json
    }

    function clearHistory(fileId, filter) {
        if (filter === 'upload') setUploadFiles(prev => prev.filter(({ _id }) => _id !== fileId))
        else if (filter === 'transfer') setTransferFiles(prev => prev.filter(({ _id }) => _id !== fileId))
        else if (filter === 'download') setDownloadFiles(prev => prev.filter(({ _id }) => _id !== fileId))
    }

    useEffect(() => { getStorage('username', randomName()) }, [])

    useEffect(() => {
        if (!type) logout()
        else if (types.includes(type) && onlyGuest.includes(router.pathname)) router.replace('/account')
        else {
            setLoading(false)
            if (fetchHistory.includes(router.pathname)) fetchApp({ url: 'file/history', method: 'POST', showToast: false }).then(({ success, files }) => success && setUploadFiles(files))
        }
    }, [router.pathname])

    return <Context.Provider value={{ uploadFiles, setUploadFiles, transferFiles, setTransferFiles, downloadFiles, setDownloadFiles, fetchApp, progress, setProgress, logout, clearHistory, modal, setModal, files, setFiles, type, setType }}>
        {children}
    </Context.Provider>
}