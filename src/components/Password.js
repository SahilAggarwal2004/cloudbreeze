import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Password({ password }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative m-0 p-0">
      <input ref={password} type={show ? "text" : "password"} autoComplete="new-password" minLength={8} required className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-black focus:outline-hidden focus:ring-black sm:text-sm" placeholder="Password" />
      <div onClick={() => setShow((old) => !old)}>{!show ? <FaEye className="password-icon" /> : <FaEyeSlash className="password-icon" />}</div>
    </div>
  );
}
