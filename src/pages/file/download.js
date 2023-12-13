import Head from 'next/head'
import FileDownload from '../../components/FileDownload'

export default function Download() {
    return <>
        <Head><title>Download files | CloudBreeze</title></Head>
        <FileDownload />
    </>
}