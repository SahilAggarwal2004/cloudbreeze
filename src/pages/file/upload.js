/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { randomElement } from "utility-kit";
import { useFileContext } from "../../contexts/ContextProvider";
import { fileDetails, getUploadUrl, remove } from "../../modules/functions";
import { cloudLimit, cloudLimitMB, transferLimit, transferLimitGB, unavailable } from "../../constants";
import Loader from "../../components/Loader";
import Info from "../../components/Info";
import BarProgress from "../../components/BarProgress";
import Select from "../../components/Select";

export default function Upload({ router }) {
  const { fetchApp, files, setFiles, setUploadFiles, setTransferFiles, type } = useFileContext();
  const { share } = router.query;
  const filesRef = useRef();
  const fileIdRef = useRef();
  const password = useRef();
  const daysLimit = useRef();
  const downloadLimit = useRef();
  const [mode, setMode] = useState("save");
  const [link, setLink] = useState();
  const [progress, setProgress] = useState(-1);
  const maxDaysLimit = useMemo(() => (type === "premium" ? 365 : type === "normal" ? 30 : 7), [type]);
  const isUploading = progress >= 0;
  const isUploaded = link && link !== "error";
  const length = files.length;

  const verifyFileId = (e) => (e.target.value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""));
  const verifyDownloadLimit = (e) => (e.target.value = Math.abs(e.target.value) || "");
  const verifyDaysLimit = (e) => (e.target.value = Math.min(Math.abs(e.target.value), maxDaysLimit) || "");

  function handleMessage({ data: { files } }) {
    setFiles(files);
    if (fileDetails(files).totalSize > transferLimit) router.replace("/p2p?share=true");
  }

  async function updateFile({ target }) {
    const files = target.files || [target.file];
    const size = fileDetails(files).totalSize;
    if (!size) {
      target.value = "";
      return toast.warning("Empty file(s)");
    }
    if (size > transferLimit) {
      toast("Try Peer-to-peer transfer for large files");
      setFiles(files);
      return router.push("/p2p?share=true");
    }
    if (mode === "save" && size > cloudLimit) {
      toast(`Try transfer mode for large files upto ${transferLimitGB}GB`);
      setMode("transfer");
    }
    setFiles(files);
  }

  function reset() {
    // Don't remove the setTimeout as file reset doesn't work without it (idk why)
    setTimeout(() => {
      setFiles([]);
      setLink();
      setProgress(-1);
    }, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === "save" && fileDetails(files).totalSize > cloudLimit) return toast.warning(`File size must not exceed ${cloudLimitMB}MB`);
    setProgress(0);
    const body = new FormData();
    for (const file of files) body.append("files", file); // (attribute, value), this is the attribute that we will accept in backend as upload.single/array(attribute which contains the files) where upload is a multer function
    body.append("length", length);
    const nameList = Array.from(files).map(({ name }) => name);
    if ((fileId = fileIdRef.current.value)) {
      if (unavailable.includes(fileId)) {
        toast.warning(`File Id cannot be ${fileId}`);
        return setProgress(-1);
      }
      body.append("fileId", fileId);
    }
    if (length > 1) body.append("nameList", nameList);
    if (password.current.value) body.append("password", password.current.value);
    if (daysLimit.current?.value) body.append("daysLimit", daysLimit.current.value);
    if (downloadLimit.current.value) body.append("downloadLimit", downloadLimit.current.value);

    if (mode === "save") {
      var { success: verified, token, server, servers } = await fetchApp({ url: "file/verify", method: "POST", body: { fileId } });
      if (!verified) return setProgress(-1);
    } else {
      servers = Array.from(Array(process.env.NEXT_PUBLIC_TRANSFER_SERVER_COUNT).keys());
      server = randomElement(servers);
    }

    while (!success) {
      if (!servers.length) {
        setLink("error");
        return setProgress(-1);
      }
      var { fileId, name, success } = await fetchApp({
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

    if (mode === "save") setUploadFiles((prev) => prev.concat({ _id: fileId, name, nameList, downloadCount: 0, createdAt: Date.now(), daysLimit: daysLimit.current.value || maxDaysLimit }));
    else setTransferFiles((prev) => prev.concat({ _id: fileId, nameList, createdAt: Date.now(), daysLimit: 1 / 24 }));
  }

  useEffect(() => {
    if (!share) setFiles([]);
    navigator.serviceWorker?.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", handleMessage);
  }, []);

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
          { value: "transfer", label: "Transfer file" },
        ]}
      />
      <div className="flex flex-col items-center justify-center space-y-5 px-4 pb-5 text-sm sm:text-base">
        <form onSubmit={handleSubmit} className="grid grid-cols-[auto_1fr] items-center gap-3">
          <label htmlFor="files">File(s):</label>
          {share && length ? <div>{length > 1 ? `${length} files` : files[0]?.name} selected</div> : <input type="file" id="files" ref={filesRef} onChange={updateFile} disabled={isUploading} required multiple />}

          <label htmlFor="file-id">File Id: </label>
          <input type="text" id="file-id" ref={fileIdRef} onInput={verifyFileId} disabled={isUploading} className="rounded border px-2 py-0.5 placeholder:text-sm" autoComplete="off" placeholder="Auto" maxLength={30} />

          <label htmlFor="password">Password:</label>
          <input type="password" id="password" ref={password} disabled={isUploading} className="rounded border px-2 py-0.5 placeholder:text-sm" autoComplete="new-password" placeholder="No protection" />

          {mode === "save" && (
            <>
              <label htmlFor="days-limit">Days Limit:</label>
              <input type="number" id="days-limit" ref={daysLimit} onInput={verifyDaysLimit} disabled={isUploading} className="rounded border px-2 py-0.5 placeholder:text-sm" autoComplete="off" placeholder={`${maxDaysLimit} (max)`} min={1} max={maxDaysLimit} />
            </>
          )}

          <label htmlFor="download-limit">Download Limit:</label>
          <input type="number" id="download-limit" ref={downloadLimit} onInput={verifyDownloadLimit} disabled={isUploading} className="rounded border px-2 py-0.5 placeholder:text-sm" autoComplete="off" placeholder="No limit" min={1} />

          <button type="submit" disabled={isUploading} className="primary-button">
            Upload
          </button>
          {isUploaded && (
            <button type="reset" className="col-span-2 rounded border border-black bg-gray-100 py-1 font-medium text-gray-800" onClick={reset}>
              Reset
            </button>
          )}
        </form>

        {!link &&
          (progress === 100 ? (
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
