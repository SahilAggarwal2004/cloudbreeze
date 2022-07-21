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
    const [guest, setGuest] = useStorage('guest', { id: '', name: '' })
    const [token, setToken] = useStorage('token', { value: '', change: true })
    const fetchApp = useFetch()

    useEffect(() => {
        if (token.value || token.change) {
            fetchApp({ url: 'auth/verify', method: 'POST', authtoken: token.value, showError: false }).then(({ error }) => {
                if (error) {
                    setToken({ value: '', change: false })
                    if (!guest.id) setGuest({ id: Date.now(), name: randomName() })
                } else {
                    setToken({ value: token.value, change: false })
                    setGuest({ id: '', name: '' })
                }
            })
        }
    }, [token])

    return <Context.Provider value={{ router, guest, token, setToken, uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles }}>
        {children}
    </Context.Provider>
}