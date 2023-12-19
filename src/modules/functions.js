import { randomNumber, wait } from "random-stuff-js";
import { toast } from "react-toastify";
import { sizes } from "../constants";

const { KB, MB } = sizes
const production = process.env.NODE_ENV === 'production'
const transferServerCount = process.env.NEXT_PUBLIC_TRANSFER_SERVER_COUNT

const round = (number, digits = 2) => +number.toFixed(digits)

export const getUploadUrl = server => (production ? `https://cloudbreeze-upload-${server}.onrender.com` : 'http://localhost:5002') + '/file/upload'

export const getTransferUploadUrl = () => (production ? `https://cloudbreeze-transfer-${randomNumber(0, transferServerCount - 1)}.onrender.com` : '') + '/file/upload'

export const getDownloadUrl = (fileId, server) => ((server && production) ? `https://cloudbreeze-transfer-${server}.onrender.com` : '') + `/file/get/${fileId}`

export const getDeleteUrl = (fileId, server) => ((server && production) ? `https://cloudbreeze-transfer-${server}.onrender.com` : '') + `/file/delete/${fileId}`

export const speed = (bytes, max, startTime = 0) => round(bytesToSize(bytes, max) / (Date.now() - startTime) * 1000) + ` ${bytesToUnit(max)}`

export const bytesToUnit = bytes => bytes >= MB ? 'MB' : bytes >= KB ? 'KB' : 'B'

export const bytesToFraction = (bytes, max) => `${bytesToSize(bytes, max)} / ${bytesToSize(max, max, true)}`

export function bytesToSize(bytes, max, suffix = false) {
    const unit = bytesToUnit(max)
    return round(bytes / sizes[unit], bytes === max ? 2 : 0) + (+suffix && ` ${unit}`)
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
    const length = files.length, names = [], sizes = []
    let totalSize = 0;
    for (let i = 0; i < length; i++) {
        const file = files[i]
        const { name, size } = file
        names.push(name)
        sizes.push(size)
        totalSize += size
    }
    return { length, names, sizes, totalSize }
}

export async function resolvePromises(promises) {
    try {
        const data = await Promise.allSettled(promises)
        return data.map(({ value }) => value)
    } catch { }
}

export async function download(blob, name) {
    await wait(100)
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name; // giving default name to download prompt
    a.click();
}