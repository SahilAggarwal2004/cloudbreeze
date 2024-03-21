/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/router";
import { useLayoutEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import { useFileContext } from "../contexts/ContextProvider";
import { verifyUrl } from "../modules/functions";

export default function Scanner() {
  const router = useRouter();
  const { setModal } = useFileContext();
  const [message, setMessage] = useState("");
  const video = useRef();

  useLayoutEffect(() => {
    const qrScanner = new QrScanner(
      video.current,
      ({ data }) => {
        const { verified, pathname } = verifyUrl(data);
        if (!verified) return setMessage("Please scan a valid QR Code");
        setModal({ active: false });
        toast.success("Successfuly scanned the QR Code");
        router.push(pathname);
      },
      { maxScansPerSecond: 5, calculateScanRegion: ({ width, height }) => ({ x: 0, y: 0, width, height }) },
    );
    qrScanner
      .start()
      .then(() => {
        setMessage("Scan QR Code using camera");
      })
      .catch(() => {
        setModal({ active: false });
        toast.error("Camera not accessible");
      });
    return () => qrScanner.stop();
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 px-3 text-center ${!message && "hidden"}`}>
      <span className="text-xs xs:text-sm md:text-base">{message}</span>
      <video ref={video} className="max-h-[50vh] w-[80vw] max-w-96" />
    </div>
  );
}
