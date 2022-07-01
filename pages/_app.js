import Head from 'next/head'
import { ToastContainer } from 'react-toastify';
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  return <>
    <Head>
      <title>CloudBreeze</title>
      <meta name="description" content="Generated by create next app" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Component {...pageProps} />
    <ToastContainer autoClose={2500} pauseOnFocusLoss={false} pauseOnHover={false} />
  </>
}

export default MyApp
