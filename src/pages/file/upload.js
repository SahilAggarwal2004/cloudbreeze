/* eslint-disable react-hooks/exhaustive-deps */
import { downloadZip } from "client-zip";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { generateID, randomElement } from "utility-kit";

import { useFileContext } from "../../contexts/ContextProvider";
import { fileDetails, getUploadUrl, isMobile, remove } from "../../lib/functions";
import { cloudLimit, cloudLimitMB, mobileZipLimit, transferLimit, unavailable } from "../../constants";
import Loader from "../../components/Loader";
import Info from "../../components/Info";
import BarProgress from "../../components/BarProgress";
import Select from "../../components/Select";

export default function Upload({ router }) {
  const { fetchApp, files, setFiles, uploadFiles, setUploadFiles, setTransferFiles, type } = useFileContext();
  const { fileId: fileIdFromUrl, share } = router.query;
  const filesRef = useRef();
  const fileIdRef = useRef();
  const password = useRef();
  const daysLimitRef = useRef();
  const downloadLimitRef = useRef();
  const [mode, setMode] = useState("save");
  const [link, setLink] = useState();
  const [progress, setProgress] = useState(-1);
  const maxDaysLimit = type === "premium" ? 365 : type === "normal" ? 30 : 7;
  const isProcessing = progress === 0 || progress === 100;
  const isUploading = progress >= 0;
  const isUploaded = link && link !== "error";
  const edit = Boolean(fileIdFromUrl);
  const file = uploadFiles.find(({ fileId }) => fileId === fileIdFromUrl);
  const size = useMemo(() => fileDetails(files).totalSize, [files]);

  const verifyFileId = (e) => (e.target.value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""));
  const verifyDownloadLimit = (e) => (e.target.value = Math.abs(e.target.value) || "");
  const verifyDaysLimit = (e) => (e.target.value = Math.min(Math.abs(e.target.value), maxDaysLimit) || "");

  async function updateFile({ target }) {
    const files = target.files || [target.file];
    setFiles(files);
  }

  function reset() {
    setFiles([]);
    setLink();
    setProgress(-1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!size) return toast.warning("Empty file(s)");
    if (mode === "save" && size > cloudLimit) return toast.warning(`File size must not exceed ${cloudLimitMB}MB`);
    setProgress(0);
    const body = new FormData();
    const fileId = fileIdFromUrl || fileIdRef.current.value || generateID();
    if (unavailable.includes(fileId)) {
      toast.warning(`File Id cannot be ${fileId}`);
      return setProgress(-1);
    }
    body.append("fileId", fileId);

    if (mode === "save") {
      var { success: verified, token, server, servers } = await fetchApp({ url: "file/verify", method: "POST", body: { fileId, edit } });
      if (!verified) return setProgress(-1);
    } else {
      servers = Array.from(Array(process.env.NEXT_PUBLIC_TRANSFER_SERVER_COUNT).keys());
      server = randomElement(servers);
    }

    const filesArray = Array.from(files);
    if (files.length === 1 || (isMobile() && size > mobileZipLimit)) var filesToUpload = files;
    else {
      const zipResponse = downloadZip(filesArray.map((file) => ({ name: file.name, input: file })));
      const zippedBlob = await zipResponse.blob();
      filesToUpload = [new File([zippedBlob], `cloudbreeze_${fileId}.zip`)];
    }
    for (const file of filesToUpload) body.append("files", file); // (attribute, value), this is the attribute that we will accept in backend as upload.single/array(attribute which contains the files) where upload is a multer function

    const nameList = files.length ? filesArray.map(({ name }) => name) : undefined;
    const daysLimit = daysLimitRef.current?.value;
    const downloadLimit = downloadLimitRef.current?.value;
    if (nameList) body.append("nameList", nameList);
    if (password.current?.value) body.append("password", password.current.value);
    if (daysLimit) body.append("daysLimit", daysLimit);
    if (downloadLimit) body.append("downloadLimit", downloadLimit);

    while (!success) {
      if (!servers.length) {
        setLink("error");
        return setProgress(-1);
      }
      var { success, name } = await fetchApp({
        url: getUploadUrl(mode, server),
        method: "POST",
        body,
        type: "multipart/form-data",
        token,
        showToast: servers.length === 1 || "success",
        options: { onUploadProgress: ({ loaded, total }) => setProgress(Math.round((loaded * 100) / total)) },
      });
      remove(servers, server);
      server = randomElement(servers);
    }
    setLink(fileId);

    if (mode === "transfer") setTransferFiles((prev) => prev.concat({ fileId, nameList, createdAt: Date.now(), daysLimit: 1 / 24 }));
    else
      setUploadFiles((prev) => {
        if (edit)
          return prev.map((file) => {
            if (file.fileId === fileId) {
              if (name) file.name = name;
              if (nameList) file.nameList = nameList;
              if (daysLimit) file.daysLimit = daysLimit;
              if (downloadLimit) file.downloadLimit = downloadLimit;
            }
            return file;
          });
        return prev.concat({ fileId, name, nameList, downloadCount: 0, createdAt: Date.now(), daysLimit: daysLimit || maxDaysLimit, downloadLimit });
      });
  }

  useEffect(() => {
    if (!share) {
      setFiles([]);
      return;
    }

    const handleMessage = ({ data: { title, text, url, files } }) => {
      if (files.length) return setFiles(files);
      const params = new URLSearchParams({ share: true });
      if (title) params.set("title", title);
      if (text) params.set("text", text);
      if (url) params.set("url", url);
      router.push(`/p2p?${params.toString()}`);
    };
    const sendReady = () => navigator.serviceWorker.controller?.postMessage("ready");

    navigator.serviceWorker.addEventListener("message", handleMessage);
    if (navigator.serviceWorker.controller) sendReady();
    else {
      const onControllerChange = () => {
        sendReady();
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      };
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    }
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (size > transferLimit) {
      toast("Switched to Peer-to-peer transfer for large files");
      router.push("/p2p?share=true");
    } else if (mode === "save" && size > cloudLimit) {
      toast(`Switched to transfer mode for large files`);
      setMode("transfer");
    }
  }, [size]);

  useEffect(() => {
    if (isUploaded) window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [link]);

  return (
    <>
      <Head>
        <title>Upload files | CloudBreeze</title>
      </Head>
      <Select
        active={mode}
        setActive={setMode}
        values={[
          { value: "save", label: "Save to Cloud" },
          { value: "transfer", label: "Transfer file", disabled: edit },
        ]}
      />
      <div className="flex flex-col items-center justify-center space-y-5 px-4 pb-5 text-sm sm:text-base">
        <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] items-center gap-3">
          <label htmlFor="files">File(s):</label>
          {share && files.length ? <div>{files.length > 1 ? `${files.length} files` : files[0]?.name} selected</div> : <input type="file" id="files" ref={filesRef} onChange={updateFile} disabled={isUploading} required={!edit} multiple />}

          <label htmlFor="fileId">File Id: </label>
          {edit ? <div>{fileIdFromUrl}</div> : <input type="text" id="fileId" ref={fileIdRef} onInput={verifyFileId} disabled={isUploading} className="rounded-sm border px-2 py-0.5 placeholder:text-sm" autoComplete="off" placeholder="Auto" maxLength={30} />}

          {!edit && (
            <>
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" ref={password} disabled={isUploading} className="rounded-sm border px-2 py-0.5 placeholder:text-sm" autoComplete="new-password" placeholder="No protection" />
            </>
          )}

          {mode === "save" && (
            <>
              <label htmlFor="days-limit">Days Limit:</label>
              <input type="number" id="days-limit" ref={daysLimitRef} defaultValue={file?.daysLimit} onInput={verifyDaysLimit} disabled={isUploading} className="rounded-sm border px-2 py-0.5 placeholder:text-sm" autoComplete="off" placeholder={`${maxDaysLimit} (max)`} min={file ? Math.ceil((Date.now() - new Date(file.createdAt)) / (1000 * 60 * 60 * 24)) : 1} max={maxDaysLimit} />
            </>
          )}

          <label htmlFor="download-limit">Download Limit:</label>
          <input type="number" id="download-limit" ref={downloadLimitRef} defaultValue={file?.downloadLimit} onInput={verifyDownloadLimit} disabled={isUploading} className="rounded-sm border px-2 py-0.5 placeholder:text-sm" autoComplete="off" placeholder="No limit" min={(file?.downloadCount || 0) + 1} />

          <button type="submit" disabled={isUploading} className="primary-button">
            {edit ? "Edit" : "Upload"}
          </button>
          <button type="reset" className={`col-span-2 rounded-sm border border-black bg-gray-100 py-1 font-medium text-gray-800 ${isUploaded ? "" : "hidden"}`} onClick={reset}>
            Reset
          </button>
        </form>

        {!link &&
          (isProcessing ? (
            <Loader className="flex items-center space-x-3">
              <div>
                <div>Please wait, processing the file(s)...</div>
                {mode === "transfer" && <div>This may take a few minutes</div>}
              </div>
            </Loader>
          ) : (
            <BarProgress percent={progress} />
          ))}

        {isUploaded && (
          <div className="pb-16">
            <Info fileId={link} />
          </div>
        )}
      </div>
    </>
  );
}
