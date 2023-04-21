import { sign } from "mini-jwt"

export default function handler(_, res) {
    try { res.json({ success: true, token: sign(process.env.SECRET, undefined, { expiresIn: 600000 }) }) }
    catch { res.json({ success: false }) }
}