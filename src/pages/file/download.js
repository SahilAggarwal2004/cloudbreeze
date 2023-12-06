import Head from 'next/head'
import FileDownload from '../../components/FileDownload'

export default function Download() {
    return <>
        <Head><title>Download a file | CloudBreeze</title></Head>
        <FileDownload />
    </>
}