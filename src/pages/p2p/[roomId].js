/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import BarProgress from "../../components/BarProgress";
import Loader from "../../components/Loader";
import { peerOptions, sizes } from "../../constants";
import { bytesToUnit, round, speed } from "../../modules/functions";
import { getStorage } from "../../modules/storage";
import Text from "../../components/Text";

export default function Id({ router }) {
  const { roomId } = router.query;
  const peerRef = useRef();
  const connection = useRef();
  const writerRef = useRef();
  const [file, setFile] = useState();
  const [size, setSize] = useState(0);
  const [text, setText] = useState();
  const [{ symbol, size: unitSize }, setUnit] = useState({});
  const [bytes, setBytes] = useState(-1);
  const [time, setTime] = useState(0);
  const [error, setError] = useState();
  const downPercent = Math.round((bytes * 100) / size);
  const isDownloading = bytes >= 0;

  const abort = () => writerRef.current?.abort();

  function handleError() {
    abort();
    setError("Connection couldn't be established. Retry again!");
  }

  function connect() {
    let fileSize, bytesReceived, timeout;
    const conn = (connection.current = peerRef.current.connect(roomId, { metadata: getStorage("username"), reliable: true }));
    const { createWriteStream } = require("streamsaver");

    conn.on("open", () => {
      peerRef.current.off("error");
      setBytes(-1);
      setError();
      toast.success("Connection established");
    });
    conn.on("data", async (data) => {
      const { byteLength, name, size, text, totalSize, type } = data;
      if (!type) {
        setBytes((old) => old + byteLength);
        writerRef.current.write(new Uint8Array(data));
        if ((bytesReceived += byteLength) !== fileSize) return;
        conn.send({ type: "next" });
        writerRef.current.ready.then(() => writerRef.current.close());
      } else if (type === "initial") {
        fileSize = size;
        bytesReceived = 0;
        const writer = (writerRef.current = createWriteStream(name, { size }).getWriter());
        writer.closed.then(() => toast.success("File downloaded successfully!")).catch(() => toast.error("Couldn't download file"));
      } else if (type === "details") {
        setFile(name);
        setSize(totalSize);
        setText(text);
        setUnit(() => {
          const symbol = bytesToUnit(totalSize);
          return { symbol, size: sizes[symbol] };
        });
      } else if (type === "text") {
        setText(text);
        toast.success("Text updated");
      }
    });
    conn.on("close", () => {
      peerRef.current.on("error", handleError);
      conn.removeAllListeners();
      toast.error("Peer disconnected");
    });
    conn.on("iceStateChanged", (state) => {
      if (state === "connected") clearTimeout(timeout);
      else if (state === "disconnected") {
        timeout = setTimeout(() => {
          peerRef.current.on("error", handleError);
          retry();
        }, peerOptions.pingInterval * 2);
      }
    });
  }

  function request() {
    connection.current?.send({ type: "request" });
    setBytes(0);
    setTime(Date.now());
  }

  function retry(manual = false) {
    if (manual && !navigator.onLine) return toast.error("Please check your internet connectivity");
    connection.current?.removeAllListeners();
    connection.current?.close();
    connect();
    setFile();
    setText();
    setBytes(-1);
    setError();
  }

  useEffect(() => {
    const peer = (peerRef.current = new Peer(peerOptions));
    peer.on("open", connect);
    peer.on("error", handleError);
    peer.on("disconnected", () => peer.reconnect());
    window.addEventListener("unload", abort);
    window.addEventListener("popstate", abort);
    return () => {
      abort();
      peer.removeAllListeners();
      peer.destroy();
      window.removeEventListener("unload", abort);
      window.removeEventListener("popstate", abort);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Peer-to-peer transfer | CloudBreeze</title>
      </Head>
      {error ? (
        <div className="center space-y-5 text-center">
          <h3 className="text-lg">{error}</h3>
          <button className="mt-1 rounded-md border-[1.5px] border-black bg-black px-2 py-1 text-white transition-all duration-300 hover:bg-white hover:text-black" onClick={() => retry(true)}>
            Retry
          </button>
        </div>
      ) : !file && !text ? (
        <Loader text="Connecting to the peer..." className="center flex flex-col items-center space-y-2 text-lg" />
      ) : (
        <div className="mb-[4.5rem] space-y-8" style={{ wordBreak: "break-word" }}>
          {file && (
            <div className="flex justify-center">
              <div className="grid w-max min-w-[90vw] max-w-full grid-cols-[auto_1fr] gap-2 px-3 sm:min-w-[60vw] md:min-w-[40vw] lg:min-w-[25vw]">
                <span className="col-span-2 text-center text-lg font-medium">Files</span>
                <span>File:</span>
                <span className="text-right">{file}</span>
                <span>Size:</span>
                <span className="text-right">
                  {round(size / unitSize)} {symbol}
                </span>
                <button className="primary-button" disabled={isDownloading} onClick={request}>
                  Download
                </button>
                {isDownloading && (
                  <>
                    <BarProgress percent={downPercent} className="col-span-2 max-w-[100%]" />
                    {bytes !== size && (
                      <div className="col-span-2 w-full text-center">
                        Speed: {speed(bytes, unitSize, time)} {symbol}/s
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          {text && <Text value={text} />}
        </div>
      )}
    </>
  );
}
