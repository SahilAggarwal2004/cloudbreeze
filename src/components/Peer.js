/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaXmark } from "react-icons/fa6";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { wait } from "utility-kit";
import { chunkSize, maxBufferSize, sizes as unitSizes } from "../constants";
import { bytesToFraction, bytesToUnit, speed } from "../modules/functions";
import "react-circular-progressbar/dist/styles.css";
import { useFileContext } from "../contexts/ContextProvider";

export default function Peer({ data: { name, conn }, names, sizes, totalSize }) {
  const { files } = useFileContext();
  const [count, setCount] = useState(0);
  const [bytes, setBytes] = useState(0);
  const [time, setTime] = useState(0);
  const file = useMemo(() => files[count], [count]);
  const size = useMemo(() => sizes[count], [count]);
  const { symbol, size: unitSize } = useMemo(() => {
    const symbol = bytesToUnit(totalSize);
    return { symbol, size: unitSizes[symbol] };
  }, []);
  const prevBytes = useMemo(() => sizes.slice(0, count).reduce((size, cur) => size + cur, 0), [count]);
  const totalBytes = prevBytes + bytes;

  function sendFile() {
    conn.send({ name: names[count], size, type: "initial" });
    let bytesSent = 0;
    const channel = conn.dataChannel;
    const reader = new FileReader();
    const readChunk = () => reader.readAsArrayBuffer(file.slice(bytesSent, bytesSent + chunkSize));
    reader.onload = async ({ target: { result, error } }) => {
      if (error || !conn.open) return readChunk();
      while (channel.bufferedAmount > maxBufferSize) await wait(0);
      setBytes(bytesSent);
      if ((bytesSent += chunkSize) < size) readChunk();
      conn.send(result);
    };
    readChunk();
  }

  function acceptData({ type }) {
    setTime(Date.now());
    if (type === "request") {
      toast.success(`Transferring file(s) to ${name}`);
      sendFile();
    } else if (type === "next") {
      setCount(count + 1);
    }
  }

  useEffect(() => {
    return () => {
      conn.removeAllListeners();
      conn.close();
    };
  }, []);

  useEffect(() => {
    conn.on("data", acceptData);
    if (count && count < names.length) sendFile();
    return () => {
      conn.off("data");
      setBytes(0);
    };
  }, [count]);

  return (
    <div className="relative flex min-w-[270px] flex-col justify-center rounded border bg-gray-50 p-4 pb-0 text-center transition-all duration-300 hover:bg-transparent hover:shadow-lg">
      <FaXmark className="absolute right-2 top-2 scale-110" onClick={() => conn.close()} />
      <h4 className="font-medium">{name}</h4>
      <CircularProgressbarWithChildren value={bytes} maxValue={size} strokeWidth={2.5} className="scale-75" styles={{ path: { stroke: "#48BB6A" } }}>
        <div className="w-1/2 space-y-1 break-words text-center text-sm md:text-base">
          <div>
            {bytesToFraction(totalBytes, totalSize, unitSize)} {symbol}
          </div>
          <div>
            {count} / {names.length} files transferred
          </div>
          <div>
            Speed: {speed(bytes, unitSize, time)} {symbol}/s
          </div>
        </div>
      </CircularProgressbarWithChildren>
    </div>
  );
}
