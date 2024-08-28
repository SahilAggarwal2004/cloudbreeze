import { useState } from "react";

export default function useModal() {
  const [modal, setModal] = useState({ active: false });
  const activateModal = (data) => setModal({ active: true, ...data });
  const closeModal = () => setModal({ active: false });

  return { modal, activateModal, closeModal };
}
