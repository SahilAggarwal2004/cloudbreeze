import Link from "next/link";
import { FaShareSquare } from "react-icons/fa";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";

import { useFileContext } from "../contexts/ContextProvider";
import { isMobile } from "../lib/functions";

export default function Info({ fileId, roomId, filter, downloadCount, modal = false }) {
  const link = window.location.origin + (fileId ? `/file/${fileId}` : `/p2p/${roomId}`);
  const { activateModal, closeModal, clearHistory } = useFileContext();

  function share(type = "URL") {
    const id = fileId || roomId;
    const data = type === "URL" ? { url: link } : { text: id };
    if (isMobile() && navigator.canShare?.(data)) navigator.share(data);
    else {
      navigator.clipboard.writeText(type === "URL" ? link : id);
      toast.success(`${type} copied to clipboard!`);
    }
  }

  return (
    <div className="max-w-[95vw] space-y-2 bg-white text-center text-sm text-black sm:text-base">
      {modal && <h2 className="mb-2 text-lg font-bold">File Details</h2>}
      {fileId ? (
        <div className="mx-auto mb-4 w-fit cursor-pointer px-1 break-all" onClick={() => share("File Id")}>
          File Id: <span className="font-medium">{fileId}</span>
        </div>
      ) : (
        <div className="mx-auto mb-4 w-fit cursor-pointer px-1 break-all" onClick={() => share("Room Id")}>
          Room Id: <span className="font-medium">{roomId}</span>
        </div>
      )}
      <div className="mx-auto flex w-fit cursor-pointer items-center space-x-1 font-medium text-gray-800 select-none" onClick={() => share()}>
        <FaShareSquare />
        <span>Click here to share the url</span>
      </div>
      <div className="font-bold">OR</div>
      <div>Scan the QR Code given below</div>
      <div className="flex scale-[0.8] justify-center">
        <QRCode value={link} bgColor="#FFFFFF" fgColor="#000000" />
      </div>
      {modal && filter === "upload" && <div className="pb-2 text-sm">Download Count: {downloadCount}</div>}
      {modal && (
        <div className="mx-4 mt-2 grid grid-cols-2 gap-2 text-sm">
          {filter === "download" ? (
            <button
              className="button-animation col-span-2 rounded-sm border px-3 py-1"
              onClick={() => {
                closeModal();
                clearHistory(fileId, "download");
              }}
            >
              Clear History
            </button>
          ) : (
            (filter === "upload" || filter === "transfer") && (
              <>
                <Link href={link} className="button-animation col-span-2 rounded-sm border px-3 py-1" onClick={closeModal}>
                  Download
                </Link>
                {filter === "upload" && (
                  <Link href={`/file/upload?fileId=${fileId}`} className="button-animation rounded-sm border px-3 py-1" onClick={closeModal}>
                    Edit
                  </Link>
                )}
                <button className={`button-animation rounded-sm border px-3 py-1 ${filter === "transfer" ? "col-span-2" : ""}`} onClick={() => activateModal({ type: "deleteFile", fileId })}>
                  Delete
                </button>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
