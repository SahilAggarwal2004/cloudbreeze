/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext } from 'react'
import useStorage from '../hooks/useStorage';

const Context = createContext();
export const useFileContext = () => useContext(Context)

export default function ContextProvider({ children }) {
    const [uploadFiles, setUploadFiles] = useStorage('upload-files', [])
    const [downloadFiles, setDownloadFiles] = useStorage('download-files', [])

    return <Context.Provider value={{ uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles }}>
        {children}
    </Context.Provider>
}