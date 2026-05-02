/* eslint-disable @next/next/no-img-element */
import { useFileContext } from "../contexts/ContextProvider";

export default function Home({ router }) {
  const { setProgress } = useFileContext();
  const redirect = (url) => {
    setProgress(100 / 3);
    setTimeout(() => {
      router.push(url);
      setProgress(100);
    }, 300);
  };

  return (
    <div className="mx-[5vw] mb-10 flex flex-col items-center gap-7 text-center sm:min-h-[calc(100vh-11rem)] sm:flex-row sm:flex-wrap sm:justify-center">
      <div className="image-container" onClick={() => redirect("/account")} onContextMenu={(e) => e.preventDefault()}>
        <img src="/images/account.webp" alt="" className="aspect-square min-h-full scale-90" />
        <div className="x-center bottom-4">Your account</div>
      </div>

      <div className="image-container group" onClick={() => redirect("/file/upload")} onContextMenu={(e) => e.preventDefault()}>
        <div className="relative">
          <div
            className="aspect-square h-full"
            style={{
              backgroundImage: "url(/images/upload.webp)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          <img src="/images/arrow.png" alt="" className="x-center bottom-0 h-[24%] opacity-0 transition-all duration-300 group-hover:bottom-[45%] group-hover:opacity-100" />
        </div>
        <div className="x-center bottom-4">Upload files</div>
      </div>

      <div className="image-container group" onClick={() => redirect("/file/download")} onContextMenu={(e) => e.preventDefault()}>
        <div className="relative">
          <div
            className="aspect-square h-full opacity-95"
            style={{
              backgroundImage: "url(/images/download.webp)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          <img src="/images/arrow.png" alt="" className="x-center top-0 h-[18%] rotate-180 opacity-0 transition-all duration-300 group-hover:top-[20%] group-hover:opacity-100" />
        </div>
        <div className="x-center bottom-4">Download files</div>
      </div>

      <div className="image-container" onClick={() => redirect("/p2p")} onContextMenu={(e) => e.preventDefault()}>
        <img src="/images/p2p.webp" alt="" className="aspect-square min-h-full scale-90" />
        <div className="x-center bottom-4">Peer-to-peer transfer</div>
      </div>
    </div>
  );
}
