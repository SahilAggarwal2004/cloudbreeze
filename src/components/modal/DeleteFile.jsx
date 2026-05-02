import { getDeleteUrl } from "../../lib/functions";

export default function DeleteFile({ id }) {
  const { closeModal, fetchApi, setUploadFiles, clearHistory } = useFileContext();

  async function deleteFile() {
    closeModal();
    const [fileId, server] = id.split("@");
    const { success, files } = await fetchApi({ url: getDeleteUrl(fileId, server), method: "DELETE" });
    if (!success) return;
    if (server) clearHistory(id, "transfer");
    else setUploadFiles(files);
  }

  return (
    <div>
      <h3 className="font-bold">Delete file?</h3>
      <p className="text-sm text-red-600">This action is irreversible</p>
      <div className="mt-6 space-x-4 text-sm">
        <button className="button-animation rounded-sm border px-3 py-1" onClick={deleteFile}>
          Yes
        </button>
        <button className="button-animation rounded-sm border px-3 py-1" onClick={closeModal}>
          No
        </button>
      </div>
    </div>
  );
}
