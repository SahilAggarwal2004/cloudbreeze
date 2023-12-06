import { useState } from "react";

export default function useError(error) {
    const [state, setState] = useState()
    const setError = () => setState(error)
    const clearError = () => setState()
    return [state, setError, clearError];
}