export const fetchHistory = ['/account', '/account/history']
export const hideNavbar = ['/_error', '/account/confirm/[token]']
export const showModal = ['/account', '/account/history', '/file/download']
export const options = ['upload', 'download']
export const types = ['normal', 'premium']

export const servers = {
    iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun.services.mozilla.com', 'turn:turn02.hubl.in?transport=tcp'] }],
    iceCandidatePoolSize: 10
}