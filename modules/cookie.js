import { cookieTestUri } from "../constants"

export const cookieTest = async () => new Promise(resolve => {
    setTimeout(() => resolve(true), 1000);
    let messageHandler = (event) => {
        // check for trusted origins here  
        try { var data = JSON.parse(event.data) }
        catch { data = { result: true } }
        resolve(data['result'])
        window.removeEventListener('message', messageHandler);
        document.body.removeChild(frame)
    }
    window.addEventListener('message', messageHandler);
    const frame = document.createElement('iframe')
    frame.src = cookieTestUri
    frame.sandbox = "allow-scripts allow-same-origin"
    frame.style = `display:none`
    frame.onload = () => frame.contentWindow.postMessage(JSON.stringify({ 'test': 'cookie' }), '*')
    document.body.appendChild(frame)
})