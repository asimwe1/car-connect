// Simple Cloudinary unsigned upload helpers

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
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(endpoint, { method: 'POST', body: form });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload failed (${res.status}): ${txt}`);
  }
  const data = await res.json();
  return data.secure_url as string;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const uploads = files.map((f) => uploadFile(f, CLOUDINARY_IMAGE_URL));
  return Promise.all(uploads);
}

export async function uploadVideo(file: File): Promise<string> {
  return uploadFile(file, CLOUDINARY_VIDEO_URL);
}


