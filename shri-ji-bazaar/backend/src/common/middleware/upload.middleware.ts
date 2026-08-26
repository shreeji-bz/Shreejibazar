import multer from 'multer';
import path from 'path';
import { config } from '../../config/app.config';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

export const upload = multer({ storage });
