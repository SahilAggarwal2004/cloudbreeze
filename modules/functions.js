import { toast } from "react-toastify";

const round = (number, digits = 2) => Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits)
export const bytesToSize = (bytes, string = false) => bytes > 1048576 ? round(bytes / 1048576) + (+string && ' MB') : bytes > 1024 ? round(bytes / 1024) + (+string && ' KB') : bytes + (+string && ' B')
export const speed = (bytes, total, startTime = 0) => round(+(bytes !== total) && (bytesToSize(bytes) / (Date.now() - startTime) * 1000)) + ' ' + (total > 1048576 ? 'MB' : total > 1024 ? 'KB' : 'B')

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

export function download(blob, name) {
    try {
        const url = window.URL.createObjectURL(blob);
        toast.success('File downloaded successfully!')
        const a = document.createElement('a');
        a.href = url;
        a.download = name; // giving default name to download prompt
        a.click();
    } catch { return toast.error("Couldn't download file") }
}