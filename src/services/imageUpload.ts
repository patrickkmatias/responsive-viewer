import { IMAGE_UPLOAD_CONFIG } from '../types';

const imageCache = new Map<string, string>();

async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function optimizeImage(dataUrl: string): Promise<Blob> {
  const { maxWidth, maxHeight, quality, format } = IMAGE_UPLOAD_CONFIG.optimization;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Blob conversion failed'))),
        format,
        quality,
      );
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = dataUrl;
  });
}

async function uploadToImgBB(blob: Blob): Promise<string> {
  const { url, apiKey } = IMAGE_UPLOAD_CONFIG.imgbb;
  const formData = new FormData();
  formData.append('image', blob);

  const response = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error('ImgBB upload rejected');
  }

  return data.data.url;
}

/**
 * Uploads a data URL image to ImgBB, with caching and optimization.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(dataUrl: string): Promise<string> {
  const hash = await generateHash(dataUrl);

  const cached = imageCache.get(hash);
  if (cached) return cached;

  const optimized = await optimizeImage(dataUrl);
  const url = await uploadToImgBB(optimized);

  imageCache.set(hash, url);
  return url;
}

/**
 * Extracts the URL from a CSS background-image value.
 * e.g. 'url(https://example.com/img.png)' → 'https://example.com/img.png'
 */
export function extractBgUrl(cssValue: string): string | null {
  const match = cssValue.match(/url\(["']?(.+?)["']?\)/);
  return match?.[1] ?? null;
}

/**
 * Returns true if the background image is a data URL or blob URL
 * (i.e. needs uploading before sharing).
 */
export function needsUpload(backgroundImage: string | null): boolean {
  if (!backgroundImage) return false;
  const url = extractBgUrl(backgroundImage);
  if (!url) return false;
  return url.startsWith('data:') || url.startsWith('blob:');
}

/**
 * Reads a File as a data URL.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}
