// Simple Cloudinary unsigned upload helpers
import { compressImage } from '@/utils/compressImage';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

const CLOUDINARY_IMAGE_URL = CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  : '';
const CLOUDINARY_VIDEO_URL = CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
  : '';

async function uploadFile(file: File, endpoint: string): Promise<string> {
  if (!endpoint) {
    throw new Error('Image upload not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
  }

  // For demo purposes, use a placeholder URL if Cloudinary is not configured
  if (CLOUD_NAME === 'demo') {
    return Promise.resolve('https://placeholder.com/image.jpg');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Upload failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function uploadImages(files: File[]): Promise<string[]> {
  try {
    // Compress images before uploading
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          return await compressImage(file);
        } catch (error) {
          console.warn(`Compression failed for ${file.name}, using original:`, error);
          return file;
        }
      })
    );

    // Upload compressed files in sequence to avoid overwhelming the server
    const urls = [];
    for (const file of compressedFiles) {
      const url = await uploadFile(file, CLOUDINARY_IMAGE_URL);
      urls.push(url);
    }
    return urls;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

export async function uploadVideo(file: File): Promise<string> {
  try {
    return await uploadFile(file, CLOUDINARY_VIDEO_URL);
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
}
