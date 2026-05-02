import { useState } from "react";

export default function useModal() {
  const [modal, setModal] = useState({ active: false });
  const openModal = ({ Component, props, containerProps }) => setModal({ active: true, Component, props, containerProps });
  const closeModal = () => setModal({ active: false });

  return { modal, openModal, closeModal };
}
