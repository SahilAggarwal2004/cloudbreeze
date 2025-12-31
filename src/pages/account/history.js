
import Head from "next/head";
import Link from "next/link";
import { options } from "../../constants";
import { useFileContext } from "../../contexts/ContextProvider";
import { relativeTime } from "../../lib/functions";

export default function History({ router }) {
  const { uploadFiles, transferFiles, downloadFiles, clearHistory, activateModal } = useFileContext();
  const { filter = "upload" } = router.query;
  const history = filter === "upload" ? uploadFiles : filter === "transfer" ? transferFiles : filter === "download" ? downloadFiles : [];

  return (
    <>
      <Head>
        <title>File history | CloudBreeze</title>
      </Head>
      <ul className="flex overflow-x-scroll border-b border-gray-400 px-1 text-center text-xs font-medium text-gray-500 xs:text-sm">
        {Object.entries(options).map(([option, label]) => (
          <Link key={option} href={`/account/history?filter=${option}`} replace className={`inline-block rounded-t-lg p-3 ${filter === option ? "cursor-default bg-black text-white" : "cursor-pointer text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
            {label}
            <span className="hidden sm:inline-block">&nbsp;Files</span>
          </Link>
        ))}
      </ul>
      {!history.length ? (
        <div className="center text-sm xs:text-base">No files to show</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full pb-2">
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th scope="col" className="p-4 text-left text-sm font-medium text-gray-900">
                    S.No.
                  </th>
                  <th scope="col" className="p-4 text-left text-sm font-medium text-gray-900">
                    Name
                  </th>
                  <th scope="col" className="p-4 text-left text-sm font-medium text-gray-900">
                    Time left
                  </th>
                </tr>
              </thead>
              <tbody className="cursor-pointer">
                {history.map(({ nameList, name, _id: fileId, createdAt, daysLimit, downloadCount }, i) => {
                  if (!nameList[0]) nameList = [name];
                  const minutesLeft = daysLimit * 24 * 60 - Math.ceil((Date.now() - new Date(createdAt)) / (60 * 1000));
                  if (minutesLeft < 0) return clearHistory(fileId, filter);

                  return (
                    <tr key={fileId} className="border-b bg-white transition duration-300 ease-in-out hover:bg-gray-100" onClick={() => activateModal({ type: "showFile", fileId, filter, downloadCount })}>
                      <td className="px-[1.0625rem] py-4 text-sm font-medium text-gray-900">{i + 1}</td>
                      <td className="px-[1.0625rem] py-4 text-sm font-light text-gray-900" style={{ wordBreak: "break-word" }}>
                        <ul className="space-y-1">
                          {nameList.map((name) => (
                            <li key={name}>{name}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-[1.0625rem] py-4 text-sm font-light text-gray-900">{relativeTime(minutesLeft)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
