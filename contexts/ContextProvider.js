/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import useStorage from '../hooks/useStorage';
import randomName from '../utilities/randomName';

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

    function logout(prelogin = false) {
        setUsername('')
        setUploadFiles([])
        setDownloadFiles([])
        if (!prelogin) {
            setToken('')
            router.push('/account/signup')
        } else router.push('/')
    }

    async function fetchApp({ url, authtoken = '', method = 'GET', type = 'application/json', data = {}, options = {}, showToast = true }) {
        let json;
        try {
            setProgress(100 / 3)
            const response = await axios({
                url, method, data, ...options,
                headers: { authtoken, 'Content-Type': type }
            })
            setProgress(100)
            json = response.data;
            if (showToast) toast.success(json.msg)
        } catch (err) {
            setProgress(100)
            if (!json) {
                const error = err.response?.data?.error || "Server Down! Please try again later..."
                if (error.includes('authenticate')) logout()
                json = { success: false, error }
                if (showToast) toast.error(error)
            }
        }
        return json
    }

    async function deleteUser(token) {
        setModal({ active: false })
        setProgress(100 / 3)
        const { success, error } = await fetchApp({ url: 'auth/delete', method: 'DELETE', authtoken: token })
        setProgress(100)
        if (success || error === 'User not found!') logout()
    }

    async function deleteFile(fileId) {
        setModal({ active: false })
        const { success, files } = await fetchApp({ url: `file/delete/${fileId}`, method: 'DELETE', authtoken: token, data: { guestId: guest } })
        if (!success) return
        if (!token) {
            const updatedFiles = uploadFiles.filter(file => file.fileId !== fileId)
            setUploadFiles(updatedFiles)
        } else setUploadFiles(files)
    }

    useEffect(() => {
        if (!username) {
            fetchApp({ url: 'auth/verify', method: 'POST', authtoken: token, showToast: false }).then(({ success, isGuest, name }) => {
                if (!success || isGuest) {
                    setToken('')
                    setGuest(Date.now())
                    setUsername(randomName())
                } else {
                    setUsername(name)
                    setGuest('')
                }
            })
        }
    }, [token])

    return <Context.Provider value={{ router, username, setUsername, guest, token, setToken, uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles, fetchApp, progress, setProgress, logout, deleteUser, deleteFile, modal, setModal }}>
        {children}
    </Context.Provider>
}