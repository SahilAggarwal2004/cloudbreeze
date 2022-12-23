import { toast } from "react-toastify";

export function verifyUrl(value) {
    try {
        const url = new URL(value)
        return url.origin === window.location.origin ? { verified: true, pathname: url.pathname } : { verified: false, error: 'Please enter a valid URL!' }
    } catch { return { verified: false } }
}

export function generateId(value) {
    const { verified, error } = verifyUrl(value)
    if (verified) return value.split('file/')[1]
    if (!error) return value
    toast.warning(error)
}

export function download(data, name, source) {
    try {
        const blob = source === 'p2p' ? new Blob([data]) : source === 'mega' ? new Blob(data) : data
        const url = window.URL.createObjectURL(blob);
        toast.success('File downloaded successfully!')
        const a = document.createElement('a');
        a.href = url;
        a.download = name; // giving default name to download prompt
        a.click();
    } catch { return toast.error("Couldn't download file") }
}