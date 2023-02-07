import { toast } from "react-toastify";

const round = (number, digits = 2) => Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits)

export const getUploadUrl = server => (process.env.NODE_ENV === 'production' ? `https://cloudbreeze-upload-${server}.onrender.com` : 'http://localhost:5002') + '/file/upload'

export const speed = (bytes, total, startTime = 0) => round(+(bytes !== total) && (bytesToSize(bytes, total) / (Date.now() - startTime) * 1000) || 0) + ' ' + (total >= 1048576 ? 'MB' : total >= 1024 ? 'KB' : 'B')

export function bytesToSize(bytes, max = 0, string = false) {
    const digits = bytes === max ? 2 : 0;
    return Math.max(bytes, max) >= 1048576 ? round(bytes / 1048576, digits) + (+string && ' MB') : Math.max(bytes, max) >= 1024 ? round(bytes / 1024, digits) + (+string && ' KB') : bytes + (+string && ' B')
}

export function remove(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) arr.splice(index, 1);
}

export function verifyUrl(value) {
    try {
        const url = new URL(value)
        return url.origin === window.location.origin ? { verified: true, pathname: url.pathname } : { verified: false, error: 'Please enter a valid URL!' }
    } catch { return { verified: false } }
}

export function generateId(value, type) {
    const { verified, error } = verifyUrl(value)
    if (verified) return value.split(`${type}/`)[1]
    if (!error) return value
    toast.warning(error)
}

export function fileDetails(files) {
    const names = [], sizes = []
    let totalSize = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const { name, size } = file
        names.push(name)
        sizes.push(size)
        totalSize += size
    }
    return { names, sizes, totalSize }
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