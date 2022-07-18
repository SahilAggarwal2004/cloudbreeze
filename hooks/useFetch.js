import axios from "axios";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API

async function fetchApp({ url, method = 'GET', type = 'application/json', data = null, options = {} }) {
    let json;
    try {
        const authtoken = localStorage.getItem('token')
        const response = await axios({
            url, method, data, ...options,
            headers: { authtoken, 'Content-Type': type }
        })
        json = response.data;

        // if (json.success && api===) localStorage.setItem('files', JSON.stringify({ ...json, local: true }))
    } catch (error) {
        // (api === ) ? json = JSON.parse(localStorage.getItem('files'));
        if (!json) json = { success: false, error: error.response?.data?.error || "Some error occured..." }
    }
    return json
}

export default function useFetch() { return fetchApp }