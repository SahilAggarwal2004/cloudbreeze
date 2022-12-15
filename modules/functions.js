import { toast } from "react-toastify";

export function verifyUrl(value) {
    try {
        const url = new URL(value)
        return (url.origin === window.location.origin && url.pathname.startsWith('/file/')) ? { verified: true, pathname: url.pathname } : { verified: false, error: 'Please enter a valid URL!' }
    } catch { return { verified: false } }
}

export function download(data, name, source) {
    try {
        const blob = source === 'mega' ? new Blob(data) : data
        const url = window.URL.createObjectURL(blob);
        toast.success('File downloaded successfully!')
        const a = document.createElement('a');
        a.href = url;
        a.download = name; // giving default name to download prompt
        a.click();
    } catch { return toast.error("Couldn't download file") }
}