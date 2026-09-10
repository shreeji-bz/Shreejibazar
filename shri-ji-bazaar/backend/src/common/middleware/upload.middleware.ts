import multer from 'multer';
import path from 'path';
import { config } from '../../config/app.config';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

export const upload = multer({ storage });
export const singleAvatar = upload.single('avatar');

export function handleUploadError(err: any, _req: any, res: any, next: any) {
  if (err) {
    res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    return;
  }
  next();
}
