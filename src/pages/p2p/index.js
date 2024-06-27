/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Peer from "peerjs";
import Head from "next/head";
import Textarea from "react-textarea-autosize";
import { FaQrcode } from "react-icons/fa";
import { toast } from "react-toastify";
import Info from "../../components/Info";
import PeerCard from "../../components/PeerCard";
import { peerOptions } from "../../constants";
import { useFileContext } from "../../contexts/ContextProvider";
import { fileDetails, generateId } from "../../modules/functions";

function reducer(state, { conn, name, peer, type = "add" }) {
  switch (type) {
    case "add":
      toast.success(`${name} connected`);
      return { ...state, [peer]: { conn, name } };
    case "remove":
      const newState = {};
      Object.entries(state)
        .filter((conn) => conn[0] !== peer)
        .forEach((conn) => (newState[conn[0]] = conn[1]));
      toast.error(`${name} disconnected`);
      return newState;
    case "reset":
      return [];
    default:
      return state;
  }
}

export default function P2p({ router }) {
  const { setModal, progress, setProgress, files, setFiles } = useFileContext();
  const { share } = router.query;
  const shareRoom = useRef();
  const receiveRoom = useRef();
  const peerRef = useRef();
  const [oldText, setOldText] = useState("");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [connections, dispatchConnections] = useReducer(reducer, {});
  const connArr = Object.entries(connections);
  const disable = progress > 0 || link;
  const { length, names, sizes, totalSize } = useMemo(() => fileDetails(files), [files]);

  const verifyRoomId = (e) => (e.target.value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""));

  function close(conn, name) {
    dispatchConnections({ name, peer: conn.peer, type: "remove" });
    conn.removeAllListeners();
  }

  function connect(conn) {
    const peer = conn.peer;
    const name = conn.metadata || "Anonymous User";
    const timeouts = {};
    conn.on("open", () => {
      if (connections[peer]) return;
      conn.send({ name: length <= 1 ? names[0] : `${length} files`, text, totalSize, type: "details" });
      dispatchConnections({ conn, name, peer });
    });
    conn.on("close", () => close(conn, name));
    conn.on("iceStateChanged", (state) => {
      if (state === "connected") clearTimeout(timeouts[peer]);
      else if (state === "disconnected") timeouts[peer] = setTimeout(() => close(conn, name), peerOptions.pingInterval * 2);
    });
  }

  function edit() {
    if (!length && !text) return toast.error("Please provide files or text to share!");
    setOldText(text);
    peerRef.current.off("connection");
    peerRef.current.on("connection", connect);
    connArr.forEach(([_, { conn }]) => conn.send({ text, type: "text" }));
    toast.success("Text edited successfully!");
  }

  function reset() {
    dispatchConnections({ type: "reset" });
    peerRef.current?.removeAllListeners();
    peerRef.current?.destroy();
    setTimeout(() => {
      setText("");
      setLink("");
    }, 0);
  }

  function enterRoom(event) {
    event?.preventDefault();
    router.push(`/p2p/${generateId(receiveRoom.current.value, "p2p")}`);
  }

  async function submit(e) {
    e.preventDefault();
    if (!length && !text) return toast.error("Please provide files or text to share!");
    setProgress(100 / 8);
    const peerId = shareRoom.current.value || Date.now();
    setProgress(100 / 3);
    const peer = (peerRef.current = new Peer(peerId, peerOptions));
    peer.on("open", (id) => {
      setOldText(text);
      setLink(id);
      setProgress(100);
    });
    peer.on("connection", connect);
    peer.on("error", ({ type }) => {
      toast.error(type === "network" ? "Reconnecting..." : type === "unavailable-id" && "Room busy. Try another!");
      setProgress(100);
    });
    peer.on("disconnected", () => setTimeout(() => !peer.destroyed && peer.reconnect(), 1000));
  }

  useEffect(() => {
    if (!share) setFiles([]);
    return reset;
  }, []);

  return (
    <>
      <Head>
        <title>Peer-to-peer transfer | CloudBreeze</title>
      </Head>
      <div className="space-y-12">
        <div className="my-10 grid grid-cols-1 items-center gap-x-4 gap-y-8 px-4 pb-5 text-sm sm:text-base md:grid-cols-[50fr_0fr_50fr]">
          <form onSubmit={submit} className="mx-auto grid grid-cols-[auto_1fr] items-center gap-3">
            <label htmlFor="files">File(s):</label>
            {share && length ? <div>{length > 1 ? `${length} files` : files[0]?.name} selected</div> : <input type="file" id="files" onChange={(e) => setFiles(e.target.files)} disabled={disable} multiple />}
            <label htmlFor="text" className="self-start pt-1 sm:pt-0.5">
              Text:{" "}
            </label>
            <Textarea id="text" minRows={3} maxRows={20} className="rounded border px-2 py-0.5 placeholder:py-0.5 placeholder:text-sm" placeholder="Text / Description (Optional)" onChange={(e) => setText(e.target.value)} />
            <label htmlFor="room-id">Room Id: </label>
            <input type="text" id="room-id" ref={shareRoom} onInput={verifyRoomId} disabled={disable} className="rounded border px-2 py-0.5 placeholder:text-sm" autoComplete="off" placeholder="Auto" maxLength={30} />
            {link ? (
              <button type="button" className="primary-button" disabled={text === oldText} onClick={edit}>
                Edit Text
              </button>
            ) : (
              <button type="submit" disabled={disable} className="primary-button">
                Share
              </button>
            )}
            {link && (
              <button type="reset" className="col-span-2 rounded border border-black bg-gray-100 py-1 font-medium text-gray-800" onClick={reset}>
                Reset
              </button>
            )}
          </form>
          <div className="col-span-1 m-0 border-[0.5px] border-black p-0 md:h-[calc(100%+2.5rem)]" />
          {link ? (
            <Info roomId={link} />
          ) : (
            <div className="flex flex-col items-center space-y-5">
              <form onSubmit={enterRoom} className="grid grid-cols-[auto_1fr] items-center gap-3">
                <label htmlFor="fileId">Room Id or Link:</label>
                <input type="text" id="fileId" ref={receiveRoom} onInput={verifyRoomId} className="rounded border px-2 py-0.5" required autoComplete="off" />
                <button type="submit" className="primary-button">
                  Receive
                </button>
              </form>
              <div className="text-center">
                <div className="mb-3 font-bold">OR</div>
                <div className="flex cursor-pointer select-none items-center justify-center space-x-1 font-medium text-gray-800" onClick={() => setModal({ active: true, type: "qrScanner" })}>
                  <FaQrcode />
                  <span>Scan a QR Code</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {Boolean(length && connArr.length) && (
          <div className="space-y-8">
            <h2 className="text-center text-lg font-medium md:text-xl">Active Users</h2>
            <div className="mx-5 flex flex-wrap items-center justify-center gap-5 pb-10">
              {connArr.map((conn) => (
                <PeerCard key={conn[0]} data={conn[1]} names={names} sizes={sizes} totalSize={totalSize} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
