import { sign } from "mini-jwt"
import { tokenExpiry } from "../../constants"

export default function handler(_, res) {
    try { res.json({ success: true, token: sign(process.env.SECRET, undefined, { expiresIn: tokenExpiry }) }) }
    catch { res.json({ success: false }) }
}