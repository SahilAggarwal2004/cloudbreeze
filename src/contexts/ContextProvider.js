/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { randomName } from "utility-kit";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchHistory, onlyGuest, types } from "../constants";
import useStorage from "../hooks/useStorage";
import { getStorage, removeStorage, setStorage } from "../modules/storage";
import useModal from "../hooks/useModal";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API;

const dimensions = typeof screen !== "undefined" && screen.width + screen.height;

const Context = createContext();
export const useFileContext = () => useContext(Context);

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

  async function fetchApp({ url, token, method = "GET", type = "application/json", body = {}, options = {}, showToast = true, showProgress = true }) {
    try {
      if (showProgress) setProgress(100 / 3);
      var { data } = await axios({
        url,
        method,
        data: body,
        ...options,
        headers: {
          "Content-Type": type,
          dimensions,
          token: token || getStorage("token"),
          guest: getStorage("guest"),
        },
      });
      if (showToast) toast.success(data.msg);
    } catch (error) {
      if (!data) {
        data = error.response?.data;
        if (!data) data = { success: false, error: "Please check your internet connectivity" };
        else if (typeof data === "string") data = { success: false, error: data };
        const authenticationError = data.error.toLowerCase().includes("session expired");
        if (authenticationError) logout("redirect");
        if (showToast === true || authenticationError) toast.error(data.error);
      }
    }
    if (showProgress) setProgress(100);
    return data;
  }

  function clearHistory(fileId, filter) {
    if (filter === "upload") setUploadFiles((prev) => prev.filter(({ _id }) => _id !== fileId));
    else if (filter === "transfer") setTransferFiles((prev) => prev.filter(({ _id }) => _id !== fileId));
    else if (filter === "download") setDownloadFiles((prev) => prev.filter(({ _id }) => _id !== fileId));
  }

  useEffect(() => {
    getStorage("username", randomName());
  }, []);

  useEffect(() => {
    if (!type) logout();
    else if (types.includes(type) && onlyGuest.includes(router.pathname)) router.replace("/account");
    else if (fetchHistory.includes(router.pathname)) fetchApp({ url: "file/history", method: "POST", showToast: false }).then(({ success, files }) => success && setUploadFiles(files));
  }, [router.pathname]);

  return <Context.Provider value={{ uploadFiles, setUploadFiles, transferFiles, setTransferFiles, downloadFiles, setDownloadFiles, fetchApp, progress, setProgress, logout, clearHistory, modal, activateModal, closeModal, files, setFiles, type, setType }}>{children}</Context.Provider>;
}
