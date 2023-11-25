/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import Head from 'next/head'
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ContextProvider from '../contexts/ContextProvider';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { hideNavbar } from '../constants';
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';

const api = process.env.NEXT_PUBLIC_API

export default function MyApp({ Component, pageProps }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    pageProps.router = router;

    useEffect(() => { setLoading(false) }, []);

    return <>
        <Head>
            <meta charSet="utf-8" />
            <title>CloudBreeze - Breeze your files on the cloud!</title>
            <link rel="icon" href="./favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#ffffff" />
            <meta name="keywords"
                content="cloud, breeze, cloudbreeze, platform, encryption, security, save, share, vercel, reactjs, nextjs, online, online platform, free, access, anywhere, anytime, fast, independent, web app, world, files, password, protected, webrtc, p2p, peer, transfer, file, speed, privacy, friends" />
            <meta name="description" content="CloudBreeze is an online platform to where you can share files via cloud or p2p between your friends for free. We respect your privacy and that's why we make sure your files are totally encrypted and password protected." />
            <link rel='manifest' href='/manifest.json' />

            <link rel='preconnect' href={api} />

            <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src *" />

            <meta name="google-site-verification" content="5_rdfkDpTLo7tXDzIkEfmQb1wH_0AmpbcQOAPhLNBLQ" />

            <link rel="apple-touch-icon" href="icons/apple-icon-180.png" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2048-2732.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2732-2048.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1668-2388.jpg" media="(device-width: 834px) and (device-height: 
1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2388-1668.jpg" media="(device-width: 834px) and (device-height: 
1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1536-2048.jpg" media="(device-width: 768px) and (device-height: 
1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2048-1536.jpg" media="(device-width: 768px) and (device-height: 
1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1668-2224.jpg" media="(device-width: 834px) and (device-height: 
1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2224-1668.jpg" media="(device-width: 834px) and (device-height: 
1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1620-2160.jpg" media="(device-width: 810px) and (device-height: 
1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2160-1620.jpg" media="(device-width: 810px) and (device-height: 
1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1284-2778.jpg" media="(device-width: 428px) and (device-height: 
926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2778-1284.jpg" media="(device-width: 428px) and (device-height: 
926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1170-2532.jpg" media="(device-width: 390px) and (device-height: 
844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2532-1170.jpg" media="(device-width: 390px) and (device-height: 
844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1125-2436.jpg" media="(device-width: 375px) and (device-height: 
812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2436-1125.jpg" media="(device-width: 375px) and (device-height: 
812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1242-2688.jpg" media="(device-width: 414px) and (device-height: 
896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2688-1242.jpg" media="(device-width: 414px) and (device-height: 
896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-828-1792.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1792-828.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1242-2208.jpg" media="(device-width: 414px) and (device-height: 
736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-2208-1242.jpg" media="(device-width: 414px) and (device-height: 
736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"/>
            <link rel="apple-touch-startup-image" href="icons/apple-splash-750-1334.jpg" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1334-750.jpg" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
            <link rel="apple-touch-startup-image" href="icons/apple-splash-640-1136.jpg" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
            <link rel="apple-touch-startup-image" href="icons/apple-splash-1136-640.jpg" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        </Head>

        {/* Google tag (gtag.js) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-VDY08PZTBH" strategy='worker' />
        <Script id='google-analytics' strategy='worker'>
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-VDY08PZTBH');`}
        </Script>

        {<ContextProvider router={router}>
            {!hideNavbar.includes(router.pathname) && <Navbar />}
            {loading || !router.isReady ? <Loader className='center flex flex-col items-center space-y-2' text='Loading...' /> : <Component {...pageProps} />}
            <Modal pathname={router.pathname} redirect={router.push} />
            <ToastContainer autoClose={2500} pauseOnFocusLoss={false} pauseOnHover={false} position='bottom-right' closeButton={false} />
        </ContextProvider>}
    </>
}