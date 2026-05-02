import { FaXmark } from "react-icons/fa6";

import { useFileContext } from "../../contexts/ContextProvider";

export default function Modal() {
  const {
    modal: { active, Component, props, containerProps },
    closeModal,
  } = useFileContext();

  return (
    <>
      <div className={`${active ? "bg-black/50" : "invisible bg-black/0"} fixed inset-0 z-40 transition-all duration-700`} onClick={closeModal} />
      <div className={`center z-50 max-h-[98vh] w-max max-w-[90vw] overflow-y-auto rounded-md bg-white px-4 pt-5 pb-4 text-center ${active ? "opacity-100" : "hidden"}`} {...containerProps}>
        <FaXmark className="absolute top-2 right-1.5 scale-110" onClick={closeModal} />
        {active && <Component {...props} />}
      </div>
    </>
  );
}
