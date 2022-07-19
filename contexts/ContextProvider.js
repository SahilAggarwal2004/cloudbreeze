/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useEffect } from 'react'
import useFetch from '../hooks/useFetch';
import useStorage from '../hooks/useStorage';
import randomName from '../utilities/randomName';

const Context = createContext();
export const useFileContext = () => useContext(Context)

export default function ContextProvider({ children, router }) {
    const [uploadFiles, setUploadFiles] = useStorage('upload-files', [])
    const [downloadFiles, setDownloadFiles] = useStorage('download-files', [])
    const [guestName, setGuestName] = useStorage('guestName')
    const [token, setToken] = useStorage('token', { value: '', change: true })
    const fetchApp = useFetch()

    useEffect(() => { if (!guestName) setGuestName(randomName()) }, [])

    useEffect(() => {
        if (token.value || token.change) {
            const { error } = fetchApp({ url: 'auth/verify', authtoken: token.value })
            error ? setToken({ value: '', change: false }) : setToken({ value: token.value, change: false })
        }
    }, [token.change])

    return <Context.Provider value={{ router, guestName, token, setToken, uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles }}>
        {children}
    </Context.Provider>
}