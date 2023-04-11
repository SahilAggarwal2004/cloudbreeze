export const cookieTest = (iFrameUri, callBack) => {
    let messageHandler = (event) => {
        // check for trusted origins here  
        try { var data = JSON.parse(event.data) }
        catch { data = { result: true } }
        callBack(data['result'])
        window.removeEventListener('message', messageHandler);
        document.body.removeChild(frame)

    }
    window.addEventListener('message', messageHandler);
    const frame = document.createElement('iframe')
    frame.src = iFrameUri
    frame.sandbox = "allow-scripts allow-same-origin"
    frame.style = `display:none`
    frame.onload = () => frame.contentWindow.postMessage(JSON.stringify({ 'test': 'cookie' }), '*')
    document.body.appendChild(frame)
}