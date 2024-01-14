export const fetchHistory = ['/account', '/account/history']
export const hideNavbar = ['/_error', '/account/confirm/[token]']
export const showModal = ['/account', '/account/history', '/file/download', '/p2p']
export const onlyGuest = ['/account/signup', '/account/login', '/account/forgot']
export const options = { upload: 'Uploaded', transfer: 'Transferred', download: 'Downloaded' }
export const unavailable = Object.keys(options).concat('error')
export const types = ['normal', 'premium']
export const sizes = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 } // In bytes
export const cloudLimitMB = 100
export const cloudLimit = cloudLimitMB * sizes.MB
export const transferLimitGB = 2
export const transferLimit = transferLimitGB * sizes.GB
export const regex = /^cloudbreeze_.*\.zip$/

// Mega
export const maxConnections = 12
export const minChunkSize = 128 * sizes.KB

// P2P
const accounts = [
    { username: "23d2d924e3c7a3d878d3ecb1", credential: "PYCjdq025mRAMqu5" },
    { username: "26757539465fdba06ea1880c", credential: "vMyhFZr6d6Wflths" },
    { username: "4634db834cc4cd836dd62801", credential: "+Gp9d9TcMmHl1P0Y" }
]
export const peerOptions = {
    host: 'cloudbreeze-peer.onrender.com', secure: true, pingInterval: 5000,
    config: {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun.relay.metered.ca:80" }
        ].concat(accounts.map(account => ({
            urls: [
                "turn:standard.relay.metered.ca:80",
                "turn:standard.relay.metered.ca:80?transport=tcp",
                "turn:standard.relay.metered.ca:443",
                "turns:standard.relay.metered.ca:443?transport=tcp"
            ],
            ...account
        })))
    }
}
export const chunkSize = 64 * sizes.KB;
export const maxBufferSize = 4 * chunkSize;