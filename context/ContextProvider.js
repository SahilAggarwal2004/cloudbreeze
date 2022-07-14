/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, createContext, useState } from "react";

const Context = createContext()
export const useFileContext = () => useContext(Context);

const ContextProvider = props => {
    const [files, setFiles] = useState()
    // const [isOnline, setOnline] = useState(navigator.onLine);

    useEffect(() => {
    }, [])

    return <Context.Provider value={{ files, setFiles }}>
        {props.children}
    </Context.Provider>
}

export default ContextProvider;