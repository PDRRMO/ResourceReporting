
export interface CloudinaryUploadResult {
  url: string
  publicId: string
}

// Upload a base64 image via the server-side API route
// This keeps CLOUDINARY_API_SECRET off the client entirely
export async function uploadBase64ToCloudinary(
  base64: string,
  folder: string = 'pdrrmo_resource'
): Promise<CloudinaryUploadResult> {
  const response = await fetch('/api/cloudinary/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, folder }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(error.error || 'Image upload failed')
  }

  const data = await response.json()
  return { url: data.url, publicId: data.publicId }
}

// Delete an image from Cloudinary via the server-side API route
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Delete failed' }))
    throw new Error(error.error || 'Image deletion failed')
  }
}

// Get an optimized image URL by injecting Cloudinary transformation params
export function getOptimizedImageUrl(
  url: string,
  width: number = 800,
  height: number = 600
): string {
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_limit,f_auto,q_auto/`)
}

// Convert a File to base64 string (for preview before upload)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}