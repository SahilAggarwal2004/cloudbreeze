import { randomNumber } from "random-stuff-js";
import { toast } from "react-toastify";

const production = process.env.NODE_ENV === 'production'
const transferServerCount = process.env.NEXT_PUBLIC_TRANSFER_SERVER_COUNT

const round = (number, digits = 2) => Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits)

export const getUploadUrl = server => (production ? `https://cloudbreeze-upload-${server}.onrender.com` : 'http://localhost:5002') + '/file/upload'

export const getTransferUploadUrl = () => (production ? `https://cloudbreeze-transfer-${randomNumber(0, transferServerCount - 1)}.onrender.com` : '') + '/file/upload'

export const getDownloadUrl = (fileId, server) => ((server && production) ? `https://cloudbreeze-transfer-${server}.onrender.com` : '') + `/file/get/${fileId}`

export const speed = (bytes, total, startTime = 0) => round(+(bytes !== total) && (bytesToSize(bytes, total) / (Date.now() - startTime) * 1000) || 0) + ' ' + (total >= 1048576 ? 'MB' : total >= 1024 ? 'KB' : 'B')

export function bytesToSize(bytes, max = 0, string = false) {
    const digits = bytes === max ? 2 : 0;
    return Math.max(bytes, max) >= 1048576 ? round(bytes / 1048576, digits) + (+string && ' MB') : Math.max(bytes, max) >= 1024 ? round(bytes / 1024, digits) + (+string && ' KB') : bytes + (+string && ' B')
}

export function relativeTime(minutes) {
    let result = '';
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const displayHours = hours % 24
    const displayMinutes = minutes % 60
    if (days) result += days + ' day(s)'
    if (days && displayHours) result += ', '
    if (displayHours) result += displayHours + ' hours(s)'
    return hours ? result : displayMinutes ? displayMinutes + ' minute(s)' : 'Less than a minute'
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

export async function resolvePromises(promises) {
    try {
        const data = await Promise.allSettled(promises)
        return data.map(({ value }) => value)
    } catch { }
}

export function download(blob, name) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name; // giving default name to download prompt
    a.click();
}