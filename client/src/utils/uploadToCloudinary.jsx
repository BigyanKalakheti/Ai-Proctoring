import { getUserIdFromToken } from './getUserIdFromToken';

export async function uploadToCloudinary(blob) {
  const userId = getUserIdFromToken();
  const timestamp = new Date().toISOString();

  if (!userId) {
    throw new Error('User ID not found in token');
  }

  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', 'exam_face_upload');
  formData.append('folder', `exam-evidence/${userId}`);
  formData.append('public_id', timestamp); // e.g., "2025-07-12T13:45:00.000Z"

  const cloudName = 'dwrgbu15o'; // Your Cloudinary cloud name

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}
