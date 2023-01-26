import { useState } from "react";
import { getStorage, setStorage } from "../modules/storage";

export default function useStorage(key, initialValue, local = true) {
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === "undefined") return initialValue
        return getStorage(key, initialValue, local)
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = value => {
        setStoredValue(value);
        if (typeof window !== "undefined") setStorage(key, value, local)
    };
    return [storedValue, setValue];
}