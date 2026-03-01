/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { randomName } from "utility-kit";
import { createContext, use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiUrl, fetchHistory, onlyGuest, types } from "../constants";
import useStorage from "../hooks/useStorage";
import { getStorage, removeStorage, setStorage } from "../lib/storage";
import useModal from "../hooks/useModal";

axios.defaults.baseURL = apiUrl;

const dimensions = typeof screen !== "undefined" && screen.width + screen.height;

const Context = createContext();
export const useFileContext = () => use(Context);

export default function ContextProvider({ children, router }) {
  const [uploadFiles, setUploadFiles] = useStorage("upload-files", []);
  const [downloadFiles, setDownloadFiles] = useStorage("download-files", []);
  const [transferFiles, setTransferFiles] = useStorage("transfer-files", []);
  const [type, setType] = useStorage("type", "");
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const { modal, activateModal, closeModal } = useModal();

  async function logout(type) {
    if (type === "manual") toast.success("Logged out successfully");
    else if (type === "redirect") router.push("/account");
    setStorage("username", randomName());
    removeStorage("token");
    setStorage("guest", crypto.randomUUID?.() || Date.now());
    setType("guest");
    setUploadFiles([]);
    setTransferFiles([]);
    setDownloadFiles([]);
  }

  async function fetchApi({ url, token, method = "GET", type = "application/json", body, options = {}, showToast = true, showProgress = true, onSuccess, onError }) {
    if (showProgress) setProgress(100 / 3);

    let data;

    try {
      const response = await axios({
        url,
        method,
        data: body,
        headers: {
          "Content-Type": type,
          dimensions,
          token: token || getStorage("token"),
          guest: getStorage("guest"),
        },
        ...options,
      });
      data = response.data;
      await onSuccess?.(data);
      if (showToast && data.message) toast.success(data.message);
    } catch (error) {
      if (error?.response?.data) data = error.response.data;
      else if (error?.code === "ECONNABORTED") data = { success: false, error: { type: "timeout", message: "Request timed out. Please try again." } };
      else data = { success: false, error: { type: "network", message: "Please check your internet connectivity." } };
      await onError?.(data.error);
      const authenticationError = data.error?.type === "authentication";
      if (authenticationError) logout("redirect");
      if (showToast === true || authenticationError) toast.error(data.error?.message);
    } finally {
      if (showProgress) setProgress(100);
    }

    return data;
  }

  function clearHistory(fileId, filter) {
    if (filter === "upload") setUploadFiles((prev) => prev.filter((file) => file.fileId !== fileId));
    else if (filter === "transfer") setTransferFiles((prev) => prev.filter((file) => file.fileId !== fileId));
    else if (filter === "download") setDownloadFiles((prev) => prev.filter((file) => file.fileId !== fileId));
  }

  useEffect(() => {
    getStorage("username", randomName());
  }, []);

  useEffect(() => {
    if (!type) logout();
    else if (types.includes(type) && onlyGuest.includes(router.pathname)) router.replace("/account");
    else if (fetchHistory.includes(router.pathname)) fetchApi({ url: "file/history", method: "POST", showToast: false }).then(({ success, files }) => success && setUploadFiles(files));
  }, [router.pathname]);

  return <Context value={{ uploadFiles, setUploadFiles, transferFiles, setTransferFiles, downloadFiles, setDownloadFiles, fetchApi, progress, setProgress, logout, clearHistory, modal, activateModal, closeModal, files, setFiles, type, setType }}>{children}</Context>;
}
