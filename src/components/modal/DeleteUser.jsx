import { useFileContext } from "../../contexts/ContextProvider";

export default function DeleteUser() {
  const { closeModal, setProgress, fetchApi, logout } = useFileContext();

  async function deleteUser() {
    closeModal();
    setProgress(100 / 3);
    const { success, error } = await fetchApi({ url: "auth/delete", method: "DELETE" });
    setProgress(100);
    if (success || error === "User not found!") logout("redirect");
  }

  return (
    <div>
      <h3 className="font-bold">Delete account?</h3>
      <p className="text-sm text-red-600">This action is irreversible</p>
      <div className="mt-6 space-x-4 text-sm">
        <button className="button-animation rounded-sm border px-3 py-1" onClick={deleteUser}>
          Yes
        </button>
        <button className="button-animation rounded-sm border px-3 py-1" onClick={closeModal}>
          No
        </button>
      </div>
    </div>
  );
}
