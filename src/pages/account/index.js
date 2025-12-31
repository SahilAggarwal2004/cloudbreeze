/* eslint-disable react-hooks/exhaustive-deps */
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { BsPatchCheckFill } from "react-icons/bs";
import Head from "next/head";
import { useFileContext } from "../../contexts/ContextProvider";
import { getStorage, setStorage } from "../../lib/storage";
import { types } from "../../constants";

export default function Account() {
  const { uploadFiles, transferFiles, downloadFiles, logout, activateModal, type } = useFileContext();
  const guest = !types.includes(type);

  useEffect(() => {
    if (guest && getStorage("tip", true, false)) {
      setStorage("tip", false, false);
      const toastId = toast(
        <span className="text-sm text-gray-700 sm:text-base">
          Create a permanent account to keep your files <strong>synced</strong> across all your devices and increase time limit of cloud uploads to upto <strong>30 days (4x)</strong>!
        </span>,
        { autoClose: 5000, pauseOnFocusLoss: true },
      );
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>Your account | CloudBreeze</title>
      </Head>
      <div className="mb-10 space-y-12 border-y border-black bg-gray-100 py-8 text-center">
        <div className="mx-2 flex items-center justify-center text-lg sm:text-xl">
          <div>
            Hello,&nbsp;<strong>{`${getStorage("username") || "User"}${guest ? " (Guest)" : ""}`}</strong>&nbsp;
          </div>
          {type === "premium" && <BsPatchCheckFill className="inline scale-90" title="Premium User" />}
        </div>
        <div className="flex flex-col items-center space-y-5 text-sm sm:flex-row sm:justify-center sm:space-x-10 sm:space-y-0">
          <Link href="/account/history?filter=upload">
            <div className="text-lg font-semibold sm:text-xl">{uploadFiles.length}</div>
            Files Uploaded
          </Link>
          <Link href="/account/history?filter=transfer">
            <div className="text-lg font-semibold sm:text-xl">{transferFiles.length}</div>
            Files Transferred
          </Link>
          <Link href="/account/history?filter=download">
            <div className="text-lg font-semibold sm:text-xl">{downloadFiles.length}</div>
            Files Downloaded
          </Link>
        </div>
        <div className="flex flex-col items-center space-y-1.5 text-sm font-medium text-gray-600">
          {guest ? (
            <>
              <Link href="/account/signup" className="hover:text-black">
                Create a new account
              </Link>
              <Link href="/account/login" className="hover:text-black">
                Login to an existing account
              </Link>
            </>
          ) : (
            <>
              <div className="cursor-pointer hover:text-black" onClick={() => logout("manual")}>
                Logout
              </div>
              <div className="cursor-pointer hover:text-black" onClick={() => activateModal({ type: "deleteUser" })}>
                Delete Account
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
