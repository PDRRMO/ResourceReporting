// Cloudinary upload functions
// You'll need to install: npm install cloudinary

// For client-side uploads, we'll use the Cloudinary upload widget
// or a server action/API route

// Option 1: Using Cloudinary Upload Widget (client-side)
// Add this to your HTML head:
// <script src="https://upload-widget.cloudinary.com/global/all.js"></script>

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
}

// Client-side upload using fetch to your API route
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'resource-photos')

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Failed to upload image')
  }

  const data = await response.json()
  return data.secure_url
}

// Convert file to base64 for upload
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Upload base64 image to Cloudinary
export async function uploadBase64ToCloudinary(
  base64: string,
  folder: string = 'resource-photos'
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY

  const formData = new FormData()
  formData.append('file', base64)
  formData.append('upload_preset', 'resource-photos')
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Failed to upload image')
  }

  const data = await response.json()
  return data.secure_url
}

// Delete image from Cloudinary
// Note: This requires a server-side API route to keep API secret secure
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  // This would call your API route which uses the admin API
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  })

  if (!response.ok) {
    throw new Error('Failed to delete image')
  }
}

// Get optimized image URL
export function getOptimizedImageUrl(
  url: string,
  width: number = 800,
  height: number = 600
): string {
  // Insert transformation parameters into Cloudinary URL
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_limit,f_auto,q_auto/`)
}
