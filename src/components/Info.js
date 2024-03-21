import QRCode from "react-qr-code";
import { useFileContext } from "../contexts/ContextProvider";
import { toast } from "react-toastify";
import { FaShareSquare } from "react-icons/fa";
import Link from "next/link";

export default function Info({ fileId, roomId, filter, downloadCount, modal = false }) {
  const link = fileId ? `${window.location.origin}/file/${fileId}` : `${window.location.origin}/p2p/${roomId}`;
  const { setModal, clearHistory } = useFileContext();

  function share(type = "URL") {
    const id = fileId || roomId;
    const data = type === "URL" ? { url: link } : { text: id };
    if (navigator.canShare?.(data) && navigator.userAgentData?.mobile)
      navigator.share(data); // navigator.userAgentData?.mobile checks if the device is a mobile device or not
    else {
      navigator.clipboard.writeText(type === "URL" ? link : id);
      toast.success(`${type} copied to clipboard!`);
    }
  }

  return (
    <div className="max-w-[95vw] space-y-2 bg-white text-center text-sm text-black sm:text-base">
      {modal && <h2 className="mb-2 text-lg font-bold">File Details</h2>}
      {fileId ? (
        <div className="mx-auto mb-4 w-fit cursor-pointer break-all px-1" onClick={() => share("File Id")}>
          File Id: <span className="font-medium">{fileId}</span>
        </div>
      ) : (
        <div className="mx-auto mb-4 w-fit cursor-pointer break-all px-1" onClick={() => share("Room Id")}>
          Room Id: <span className="font-medium">{roomId}</span>
        </div>
      )}
      <div className="mx-auto flex w-fit cursor-pointer select-none items-center space-x-1 font-medium text-gray-800" onClick={() => share()}>
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
          {filter === "upload" || filter === "transfer" ? (
            <>
              <Link href={link} className="button-animation col-span-2 rounded border px-3 py-1" onClick={() => setModal({ active: false })}>
                Download
              </Link>
              <button className="button-animation rounded border px-3 py-1" onClick={() => setModal({ active: true, type: "deleteFile", fileId })}>
                Delete
              </button>
            </>
          ) : (
            filter === "download" && (
              <button
                className="button-animation rounded border px-3 py-1"
                onClick={() => {
                  setModal({ active: false });
                  clearHistory(fileId, "download");
                }}
              >
                Clear History
              </button>
            )
          )}
          <button className="button-animation rounded border px-3 py-1" onClick={() => setModal({ active: false })}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
