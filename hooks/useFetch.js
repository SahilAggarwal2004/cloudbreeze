import axios from "axios";
import { toast } from 'react-toastify'

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API

async function fetchApp({ url, authtoken = '', method = 'GET', type = 'application/json', data = null, options = {}, showError = true }) {
    let json;
    try {
        const response = await axios({
            url, method, data, ...options,
            headers: { authtoken, 'Content-Type': type }
        })
        json = response.data;

        // if (json.success && api===) localStorage.setItem('files', JSON.stringify({ ...json, local: true }))
    } catch (err) {
        // (api === ) ? json = JSON.parse(localStorage.getItem('files'));
        if (!json) {
            const error = err.response?.data?.error || "Some error occured..."
            json = { success: false, error }
            if (showError) toast.error(error)
        }
    }
    return json
}

export default function useFetch() { return fetchApp }