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
    const [guest, setGuest] = useStorage('guest', '')
    const [token, setToken] = useStorage('token', '')
    const [progress, setProgress] = useState(0)
    const [modal, setModal] = useState({ active: false })

    function logout(type) {
        setUsername('')
        setToken('')
        setUploadFiles([])
        setDownloadFiles([])
        type === 'manual' ? toast.success('Logged out successfully') : router.push('/account')
    }

    async function fetchApp({ url, authtoken = '', method = 'GET', type = 'application/json', data = {}, headers = {}, options = {}, showToast = true, showProgress = true }) {
        let json;
        try {
            if (showProgress) setProgress(100 / 3)
            const response = await axios({
                url, method, data, ...options,
                headers: { authtoken, 'Content-Type': type, ...headers }
            })
            if (showProgress) setProgress(100)
            json = response.data;
            if (showToast) toast.success(json.msg)
        } catch (err) {
            if (showProgress) setProgress(100)
            if (!json) {
                const error = err.response?.data?.error || "Server Down! Please try again later..."
                json = { success: false, error }
                const authenticationError = error.includes('authenticate')
                if (authenticationError) logout('auto')
                if (showToast || authenticationError) toast.error(error)
            }
        }
        return json
    }

    async function deleteUser(token) {
        setModal({ active: false })
        setProgress(100 / 3)
        const { success, error } = await fetchApp({ url: 'auth/delete', method: 'DELETE', authtoken: token })
        setProgress(100)
        if (success || error === 'User not found!') logout('auto')
    }

    async function deleteFile(fileId) {
        setModal({ active: false })
        const { success, files } = await fetchApp({ url: `file/delete/${fileId}`, method: 'DELETE', authtoken: token, data: { guestId: guest } })
        if (!success) return
        token ? setUploadFiles(files) : clearHistory(fileId, 'upload')
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

    function verifyUrl(value) {
        try {
            const url = new URL(value)
            return (url.origin === window.location.origin && url.pathname.startsWith('/file/')) ? { verified: true, pathname: url.pathname } : { verified: false, error: 'Please enter a valid URL!' }
        } catch { return { verified: false } }
    }

    useEffect(() => {
        if (fetchHistory.includes(router.pathname)) {
            if (token) fetchApp({ url: 'file/history', method: 'POST', authtoken: token, showToast: false }).then(({ success, files }) => success && setUploadFiles(files))
            else fetchApp({ url: 'file/history', method: 'POST', data: { guestId: guest }, showToast: false }).then(({ success, files }) => success && setUploadFiles(files))
        }
    }, [router.pathname])

    useEffect(() => {
        if (!username && !token) {
            setUsername(randomName())
            setToken('')
            setGuest(Date.now())
        }
    }, [username, token])

    return <Context.Provider value={{ router, username, setUsername, guest, token, setToken, uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles, setGuest, fetchApp, progress, setProgress, logout, deleteUser, deleteFile, clearHistory, modal, setModal, verifyUrl }}>
        {children}
    </Context.Provider>
}