export const uploadImagesToCloudinary = async (files: File[]): Promise<string[]> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_NAME || 'dle4mjiyk';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  if (files.length > 20) {
    throw new Error('Maximum 20 images allowed');
  }

  const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg'];
  const imageUrls: string[] = [];

  for (const file of files) {
    if (!allowedFormats.includes(file.type)) {
      throw new Error(`Image ${file.name} has unsupported format. Allowed: JPEG, PNG, JPG`);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`Image ${file.name} exceeds 5MB limit`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`Failed to upload image ${file.name}: ${errorMessage}`);
      }

      const data = await response.json();
      if (data.secure_url) {
        imageUrls.push(data.secure_url);
      } else {
        throw new Error(`No secure_url returned for image ${file.name}`);
      }
    } catch (error) {
      throw new Error(`Failed to upload image ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return imageUrls;
};