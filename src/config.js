import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongoUri: process.env.MONGO_URI || '',
  storageMode: process.env.STORAGE_MODE || (process.env.CLOUDINARY_URL ? 'cloudinary' : 'local'), // local | cloudinary
  cloudinaryUrl: process.env.CLOUDINARY_URL || '',
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'),
  maxAudioMB: parseInt(process.env.MAX_AUDIO_MB || '10', 10),
  maxDurationSec: parseInt(process.env.MAX_DURATION_SEC || '300', 10), // 5 min
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export default config;
