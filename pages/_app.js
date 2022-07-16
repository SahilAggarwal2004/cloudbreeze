import Head from 'next/head'
import { ToastContainer } from 'react-toastify';
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import ContextProvider from '../context/ContextProvider';

export default function MyApp({ Component, pageProps }) {
      return <ContextProvider>
            <Head>
                  <meta charSet="utf-8" />
                  <title>CloudBreeze - Breeze your files on the cloud!</title>
                  <link rel="icon" href="./favicon.ico" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <meta name="theme-color" content="#ffffff" />
                  <meta name="keywords"
                        content="cloud, breeze, cloudbreeze, platform, encryption, security, save, share, netlify, reactjs, nextjs, online, online platform, free, access, anywhere, anytime, fast, independent, web app, world, files, password, protected" />
                  <meta name="description" content="CloudBreeze is an online platform to where you can share files via cloud between your friends. We respect your privacy and that's why we make sure your files are totally encrypted and password protected." />
                  <link rel='manifest' href='/manifest.json' />

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
            <Component {...pageProps} />
            <ToastContainer autoClose={2500} pauseOnFocusLoss={false} pauseOnHover={false} position='bottom-right' />
      </ContextProvider>
}