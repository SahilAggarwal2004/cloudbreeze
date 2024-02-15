/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import FileDownload from "../../components/FileDownload";

export default function FileId({ router }) {
  return (
    <>
      <Head>
        <title>Download files | CloudBreeze</title>
      </Head>
      <FileDownload fileIdFromUrl={router.query.fileId} />
    </>
  );
}
