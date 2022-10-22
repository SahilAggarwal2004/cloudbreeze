import { initializeApp } from 'firebase/app'
import { getFirestore } from "firebase/firestore";
import { createContext } from 'react';
import { servers } from '../constants';

const Context = createContext();
export const useFireContext = () => useContext(Context)

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID

initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId });
const db = getFirestore();

export default function FirebaseProvider({ children }) {
    const pc = new RTCPeerConnection(servers)


    return <Context.Provider value={{}}>
        {children}
    </Context.Provider>
}