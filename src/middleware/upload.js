/** Multer audio-upload configuration: Cloudinary (if configured) else local disk. */
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import config from '../config.js';

if (!fs.existsSync(config.uploadDir)) fs.mkdirSync(config.uploadDir, { recursive: true });

export const ALLOWED = new Set([
  'audio/webm',
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/ogg',
  'audio/x-wav',
  'video/webm',
]);

function fileFilter(_req, file, cb) {
  if (ALLOWED.has(file.mimetype) || file.mimetype.startsWith('audio/')) return cb(null, true);
  cb(new Error(`Unsupported audio type: ${file.mimetype}. Use webm/wav/mp3/ogg.`));
}

// Cloudinary when CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME) is set — survives deploys.
// Local disk otherwise (dev / zero-config).
let storage;
let isCloudinary = false;
if (config.cloudinaryUrl || process.env.CLOUDINARY_CLOUD_NAME) {
  // CLOUDINARY_URL env is picked up automatically; explicit keys also supported.
  if (process.env.CLOUDINARY_CLOUD_NAME && !config.cloudinaryUrl) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'voice-feedback',
      resource_type: 'video', // Cloudinary stores audio as `video` resource type
      allowed_formats: ['webm', 'wav', 'mp3', 'ogg', 'mp4'],
      public_id: (_req, _file) => `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    },
  });
  isCloudinary = true;
  console.log('[upload] storage: cloudinary');
} else {
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, config.uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '') || '.webm';
      cb(null, `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
    },
  });
}

export const upload = multer({
  storage,
  limits: { fileSize: config.maxAudioMB * 1024 * 1024 },
  fileFilter,
});

export { isCloudinary };

export async function deleteStoredAudio(fileName, audioUrl) {
  // Cloudinary: fileName holds the public_id.
  if (audioUrl && audioUrl.startsWith('http')) {
    try {
      const publicId = String(fileName || '').replace(/\.[a-z0-9]+$/i, '');
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    } catch (e) {
      console.warn('[upload] cloudinary delete failed:', e.message);
    }
    return;
  }
  if (fileName) fs.unlink(path.join(config.uploadDir, path.basename(fileName)), () => {});
}
