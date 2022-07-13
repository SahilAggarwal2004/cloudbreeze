import { toast } from "react-toastify";

export default function download(data, name, type = 'file') {
    try {
        const blob = type === 'file' ? new Blob([data]) : data
        const url = window.URL.createObjectURL(blob);
        toast.success('File downloaded successfully!')
        const a = document.createElement('a');
        a.href = url;
        a.download = name; // giving default name to download prompt
        a.click();
    } catch { return toast.error("Couldn't download file") }
}