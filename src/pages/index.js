/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useFileContext } from "../contexts/ContextProvider";

export default function Home({ router }) {
  const { setProgress } = useFileContext();
  const [hover, setHover] = useState();
  const redirect = (url) => {
    setProgress(100 / 3);
    setTimeout(() => {
      router.push(url);
      setProgress(100);
    }, 300);
  };

  return (
    <>
      <div className="mx-[5vw] mb-10 flex flex-col items-center gap-7 text-center sm:min-h-[calc(100vh-11rem)] sm:flex-row sm:flex-wrap sm:justify-center">
        <div className="image-container" onClick={() => redirect("/account")} onContextMenu={(e) => e.preventDefault()}>
          <img src="/images/account.webp" alt="" className="aspect-square min-h-full scale-90" />
          <div className="x-center bottom-4">Your account</div>
        </div>
        <div className="image-container" onMouseEnter={() => setHover("upload")} onMouseLeave={() => setHover()} onClick={() => redirect("/file/upload")} onContextMenu={(e) => e.preventDefault()}>
          <div className="relative">
            <img src="/images/upload.webp" alt="" className="aspect-square h-full" />
            <img src="/images/arrow.png" alt="" className={`x-center bottom-0 h-[24%] transition-all duration-300 ${hover === "upload" ? "bottom-[45%]" : "opacity-0"}`} />
          </div>
          <div className="x-center bottom-4">Upload files</div>
        </div>
        <div className="image-container" onMouseEnter={() => setHover("download")} onMouseLeave={() => setHover()} onClick={() => redirect("/file/download")} onContextMenu={(e) => e.preventDefault()}>
          <div className="relative">
            <img src="/images/download.webp" alt="" className="aspect-square h-full opacity-95" />
            <img src="/images/arrow.png" alt="" className={`x-center top-0 h-[18%] rotate-180 transition-all duration-300 ${hover === "download" ? "top-[20%]" : "opacity-0"}`} />
          </div>
          <div className="x-center bottom-4">Download files</div>
        </div>
        <div className="image-container" onClick={() => redirect("/p2p")} onContextMenu={(e) => e.preventDefault()}>
          <img src="/images/p2p.webp" alt="" className="aspect-square min-h-full scale-90" />
          <div className="x-center bottom-4">Peer-to-peer transfer</div>
        </div>
      </div>
    </>
  );
}
