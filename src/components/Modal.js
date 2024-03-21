import { useFileContext } from "../contexts/ContextProvider";
import { getDeleteUrl } from "../modules/functions";
import Info from "./Info";
import Scanner from "./Scanner";

export default function Modal() {
  const {
    modal: { active, type, ...props },
    setModal,
    setProgress,
    fetchApp,
    logout,
    setUploadFiles,
    clearHistory,
  } = useFileContext();
  const { fileId, filter, downloadCount } = props;
  const handleCancel = () => setModal({ active: false });

  async function deleteFile(id) {
    const [fileId, server] = id.split("@");
    setModal({ active: false });
    const { success, files } = await fetchApp({ url: getDeleteUrl(fileId, server), method: "DELETE" });
    if (!success) return;
    if (server) clearHistory(id, "transfer");
    else setUploadFiles(files);
  }

  async function deleteUser() {
    setModal({ active: false });
    setProgress(100 / 3);
    const { success, error } = await fetchApp({ url: "auth/delete", method: "DELETE" });
    setProgress(100);
    if (success || error === "User not found!") logout("redirect");
  }

  return (
    <>
      <div className={`${active ? "bg-opacity-50" : "invisible bg-opacity-0"} fixed inset-0 z-40 bg-black transition-all duration-700`} onClick={handleCancel} />
      <div className={`center z-50 max-h-[98vh] w-max max-w-[90vw] overflow-y-auto rounded-md bg-white py-4 text-center ${type === "showFile" ? "px-1" : type === "qrScanner" ? "px-0" : "px-3"} ${active ? "opacity-100" : "hidden"}`}>
        {type === "deleteUser" ? (
          <div>
            <h3 className="font-bold">Delete account?</h3>
            <p className="text-sm text-red-600">This action is irreversible</p>
            <div className="mt-6 space-x-4 text-sm">
              <button className="button-animation rounded border px-3 py-1" onClick={deleteUser}>
                Yes
              </button>
              <button className="button-animation rounded border px-3 py-1" onClick={handleCancel}>
                No
              </button>
            </div>
          </div>
        ) : type === "deleteFile" ? (
          <div>
            <h3 className="font-bold">Delete file?</h3>
            <p className="text-sm text-red-600">This action is irreversible</p>
            <div className="mt-6 space-x-4 text-sm">
              <button className="button-animation rounded border px-3 py-1" onClick={() => deleteFile(fileId)}>
                Yes
              </button>
              <button className="button-animation rounded border px-3 py-1" onClick={handleCancel}>
                No
              </button>
            </div>
          </div>
        ) : type === "showFile" ? (
          <Info fileId={fileId} filter={filter} downloadCount={downloadCount} modal />
        ) : (
          type === "qrScanner" && <Scanner />
        )}
      </div>
    </>
  );
}
