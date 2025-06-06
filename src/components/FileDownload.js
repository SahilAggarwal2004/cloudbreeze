/* eslint-disable react-hooks/exhaustive-deps */
import FileViewer from "@afzalimdad9/react-file-preview";
import axios from "axios";
import { File } from "megajs";
import { useEffect, useRef, useState } from "react";
import { FaQrcode } from "react-icons/fa";
import { toast } from "react-toastify";
import { unzip } from "unzipit";

import Loader from "./Loader";
import { useFileContext } from "../contexts/ContextProvider";
import { download, generateId, getDownloadUrl, resolvePromises } from "../modules/functions";
import BarProgress from "./BarProgress";
import useStorage from "../hooks/useStorage";
import { regex } from "../constants";

export default function FileDownload({ fileIdFromUrl = false }) {
  const { setDownloadFiles, fetchApp, activateModal } = useFileContext();
  const fileRef = useRef();
  const password = useRef();
  const [unzipFile, setUnzip] = useStorage("unzip", false);
  const [fileData, setFileData] = useState({ url: null });
  const [progress, setProgress] = useState(-1);
  const isDownloaded = progress === 100;
  const isDownloading = progress >= 0 && !isDownloaded;

  async function submit(event) {
    event.preventDefault?.();
    const id = fileIdFromUrl || generateId(fileRef.current.value, "file");
    if (!id) return;
    setProgress(0);
    const mode = event.type === "preview" ? "preview" : "download";
    const [fileId, server] = id.split("@");

    async function fetchDownload() {
      const options = server ? { url: getDownloadUrl(fileId, mode, server), method: "POST", data: { pass: password.current.value } } : { url: link, method: "GET" };
      try {
        return await axios({
          ...options,
          responseType: "blob",
          onDownloadProgress: ({ loaded, total }) => setProgress(Math.round((loaded * 100) / total)),
        });
      } catch {
        setProgress(-1);
        return {};
      }
    }

    async function downloadFile(blob, name) {
      try {
        if (mode === "preview") return setFileData({ url: URL.createObjectURL(blob), name, createdAt, daysLimit });
        if (!blob) throw new Error();
        try {
          if (!unzipFile || !regex.test(name)) throw new Error();
          const { entries } = await unzip(blob);
          var nameList = Object.keys(entries);
          const blobs = await resolvePromises(Object.values(entries).map((e) => e.blob()));
          for (let i = 0; i < nameList.length; i++) await download(blobs[i], nameList[i]);
        } catch {
          nameList = [name];
          await download(blob, name);
        }
        setProgress(100);
        toast.success("File(s) downloaded successfully!");
        if (!server) setDownloadFiles((prev) => prev.filter(({ _id }) => _id !== fileId).concat({ nameList, _id: fileId, createdAt: fileData.createdAt || createdAt, daysLimit: fileData.daysLimit || daysLimit }));
      } catch {
        setProgress(-1);
        if (mode === "download") toast.error("Couldn't download file(s)");
      }
    }

    if (fileData.url) return downloadFile(fileData.url, fileData.name);

    if (server) {
      const { data, headers } = await fetchDownload();
      return downloadFile(data, headers?.filename);
    }

    var { createdAt, daysLimit, error, link, name, size } = await fetchApp({ url: getDownloadUrl(fileId, mode), method: "POST", body: { pass: password.current.value }, showToast: mode === "download" });
    if (error) return setProgress(-1);
    try {
      const file = File.fromURL(link);
      const stream = file.download({ initialChunkSize: Math.ceil(size / 3), chunkSizeIncrement: 0 });
      let blob = new Blob();
      stream.on("data", (data) => (blob = new Blob([blob, data])));
      stream.on("progress", ({ bytesLoaded, bytesTotal }) => setProgress(Math.round((bytesLoaded * 100) / bytesTotal)));
      stream.on("end", () => {
        stream.removeAllListeners();
        downloadFile(blob, name);
      });
    } catch {
      const { data } = await fetchDownload();
      downloadFile(data, name);
    }
  }

  useEffect(() => {
    if (fileIdFromUrl) submit({ type: "preview" });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-5 px-4 pb-5 text-sm sm:text-base">
      <form onSubmit={submit} className="grid grid-cols-[auto_1fr] items-center gap-3">
        {!fileIdFromUrl && (
          <>
            <label htmlFor="fileId">File Id or Link:</label>
            <input type="text" id="fileId" ref={fileRef} className="rounded-sm border px-2 py-0.5" required autoComplete="off" />
          </>
        )}
        <label htmlFor="password">Password (if any):</label>
        <input type="password" id="password" ref={password} className="rounded-sm border px-2 py-0.5" autoComplete="new-password" />
        <div className="col-span-2 text-center text-xs sm:text-sm">
          <span className="font-semibold text-gray-800">Tip:</span> No need of password if you are the author of the file!
        </div>
        <label className="relative col-span-2 inline-flex cursor-pointer items-center place-self-center">
          <input type="checkbox" checked={unzipFile} className="peer sr-only" onChange={() => setUnzip((prev) => !prev)} />
          <div className="peer relative flex aspect-[1.8] w-9 items-center rounded-full bg-gray-200 peer-checked:bg-black peer-focus:ring-2 peer-focus:ring-gray-300 after:absolute after:left-[8%] after:aspect-square after:w-[42%] after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
          <span className="ml-3 text-sm">Extract files</span>
        </label>
        <button type="submit" disabled={isDownloading} className="primary-button">
          {fileData.url || !isDownloaded ? "Download" : "Download Again"}
        </button>
      </form>
      {fileData.url ? (
        <div className="preview-container mt-2 flex flex-col items-center justify-center space-y-2">
          <div className="font-medium">File Preview:</div>
          <FileViewer src={fileData.url} fileName={fileData.name} loader={<Loader />} />
        </div>
      ) : progress > 0 ? (
        <BarProgress percent={progress} />
      ) : progress === 0 ? (
        <Loader className="flex items-center space-x-3" text="Please wait, accessing the file(s)..." />
      ) : (
        !fileIdFromUrl && (
          <div className="text-center">
            <div className="mb-3 font-bold">OR</div>
            <div className="flex cursor-pointer items-center justify-center space-x-1 font-medium text-gray-800 select-none" onClick={() => activateModal({ type: "qrScanner" })}>
              <FaQrcode />
              <span>Scan a QR Code</span>
            </div>
          </div>
        )
      )}
    </div>
  );
}
