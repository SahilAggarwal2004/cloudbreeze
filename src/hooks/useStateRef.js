import { useRef, useState } from "react";

export default function useStateRef(init) {
  const [state, setState] = useState(init);
  const ref = useRef(init);

  function setStateRef(value) {
    ref.current = value;
    setState(value);
  }

  return [state, ref, setStateRef];
}
