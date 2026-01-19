import Link from "next/link";
import { FaUpload, FaDownload, FaUserAlt, FaHistory } from "react-icons/fa";
import { GrSend } from "react-icons/gr";
import LoadingBar from "react-top-loading-bar";
import { useFileContext } from "../contexts/ContextProvider";

export default function Navbar() {
  const { progress, setProgress } = useFileContext();

  return (
    <>
      <LoadingBar color="#ffffff" progress={progress} waitingTime={300} onLoaderFinished={() => setProgress(0)} />
      <nav className="xs:px-4 sticky inset-0 z-30 flex items-center justify-between bg-black p-2 text-white shadow-lg sm:px-5">
        {/* title attribute displays text on element hover */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link href="/account">
            <FaUserAlt className="xs:scale-110" title="Your Account" />
          </Link>
          <Link href="/">
            <h1 className="xs:text-xl cursor-pointer text-lg font-medium select-none" title="Home">
              CloudBreeze
            </h1>
          </Link>
        </div>
        <div className="xs:space-x-5 flex space-x-4 sm:space-x-6">
          <Link href="/account/history?filter=upload">
            <FaHistory className="hidden scale-110 sm:block sm:scale-125" title="History" />
          </Link>
          <Link href="/file/upload">
            <FaUpload className="scale-110 sm:scale-125" title="Upload files" />
          </Link>
          <Link href="/file/download">
            <FaDownload className="scale-110 sm:scale-125" title="Download files" />
          </Link>
          <Link href="/p2p">
            <GrSend className="scale-110 sm:scale-125" title="Peer-to-peer transfer" />
          </Link>
        </div>
      </nav>
      <div className="h-10" />
    </>
  );
}
