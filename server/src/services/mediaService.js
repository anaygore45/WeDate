import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadMedia = async (fileBuffer, originalName = 'photo.jpg', folder = 'wedate/profiles') => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // Local filesystem fallback
  const ext = path.extname(originalName) || '.jpg';
  const randomName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const filePath = path.join(uploadsDir, randomName);

  await fs.promises.writeFile(filePath, fileBuffer);

  return {
    url: `/uploads/${randomName}`,
    publicId: randomName
  };
};

export const deleteMedia = async (publicId, url = '') => {
  if (!publicId && !url) return;

  if (isCloudinaryConfigured && publicId && !publicId.includes('.')) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn('[Cloudinary] Failed to delete remote image:', err.message);
    }
    return;
  }

  // Local file cleanup
  try {
    const filename = publicId || path.basename(url);
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.warn('[Media] Failed to delete local file:', err.message);
  }
};
