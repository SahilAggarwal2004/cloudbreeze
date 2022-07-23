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

    function logout() {
        setToken('')
        setUsername('')
        setUploadFiles([])
        setDownloadFiles([])
        router.push('/account/login')
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

    async function handleDelete(token) {
        const { success } = await fetchApp({ url: 'auth/delete', method: 'DELETE', authtoken: token })
        if (success) logout()
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

    return <Context.Provider value={{ router, username, setUsername, guest, token, setToken, uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles, fetchApp, progress, setProgress, logout, handleDelete }}>
        {children}
    </Context.Provider>
}