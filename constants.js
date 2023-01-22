export const pagesToCache = ['/', '/account', '/file/upload', '/file/download', '/p2p', '/account/history?filter=upload', '/account/history?filter=download', '/account/signup', '/account/login', '/account/forgot']
export const fetchHistory = ['/account', '/account/history']
export const hideNavbar = ['/_error', '/account/confirm/[token]']
export const showModal = ['/account', '/account/history', '/file/download', '/p2p']
export const options = ['upload', 'download']
export const types = ['normal', 'premium']
export const limit = 100 // In MB
export const peerOptions = { host: 'cloudbreeze-peer.onrender.com', secure: true }
export const chunkSize = 1048576 // In bytes (1 MB)
export const minBuffer = chunkSize / 16