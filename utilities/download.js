import { toast } from "react-toastify";

export default function download(data, name, source, totalLength) {
    try {
        if (source==='mega') {
            let result = new Uint8Array(totalLength);
            let length = 0;
            for (let array of data) {
                result.set(array, length);
                length += array.length;
            }
            var blob = new Blob([result])
        }
        const url = window.URL.createObjectURL(blob || data);
        toast.success('File downloaded successfully!')
        const a = document.createElement('a');
        a.href = url;
        a.download = name; // giving default name to download prompt
        a.click();
    } catch (error) { console.log(error); return toast.error("Couldn't download file") }
}