import { createRouter } from 'next-connect'
import { Storage } from "megajs"
import multer from 'multer';
import { createReadStream } from 'fs';

const router = createRouter();
const upload = multer({ dest: 'uploads' });

router.use(upload.single('files')).post(async (req, res) => {
    const storage = await new Storage({ email: process.env.MEGA_EMAIL, password: process.env.MEGA_PASSWORD }).ready
    res.json({ success: true })
    const { file: { filename, originalname, path, size } } = req
    const file = await storage.upload({ name: filename, size }, createReadStream(path)).complete
    const link = await file.link()
    console.log(link)
})

export const config = {
    router: { bodyParser: false }
}

export default router.handler({
    onError: (err, _, res) => {
        console.error(err.stack);
        res.status(err.statusCode || 500).end(err.message);
    }
});