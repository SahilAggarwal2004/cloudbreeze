import Head from 'next/head'
import { ToastContainer } from 'react-toastify';
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  return <>
    <Head>
      <title>CloudBreeze - Breeze your files on the cloud!</title>
      <meta name="description" content="CloudBreeze is an online platform to where you can share files via cloud between your friends. We respect your privacy and that's why we make sure your files are totally encrypted and password protected." />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Component {...pageProps} />
    <ToastContainer autoClose={2500} pauseOnFocusLoss={false} pauseOnHover={false} />
  </>
}

export default MyApp
