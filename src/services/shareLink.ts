import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { extractBgUrl, needsUpload, uploadImage } from './imageUpload';

/**
 * Generates a shareable URL encoding the current settings.
 * If the background is a local image, it uploads it first.
 */
export async function generateShareLink(settings: AppSettings): Promise<string> {
  const params = new URLSearchParams();

  if (settings.websiteUrl) {
    params.set('url', settings.websiteUrl);
  }

  // Handle background image
  if (settings.backgroundImage) {
    if (needsUpload(settings.backgroundImage)) {
      const dataUrl = extractBgUrl(settings.backgroundImage);
      if (dataUrl) {
        const uploadedUrl = await uploadImage(dataUrl);
        params.set('bgUrl', uploadedUrl);
      }
    } else {
      const url = extractBgUrl(settings.backgroundImage);
      if (url) params.set('bgUrl', url);
    }
  }

  // Only include non-default values to keep URLs short
  if (settings.backgroundSize !== DEFAULT_SETTINGS.backgroundSize) {
    params.set('bgSize', settings.backgroundSize);
  }
  if (settings.deviceWidth !== DEFAULT_SETTINGS.deviceWidth) {
    params.set('width', String(settings.deviceWidth));
  }
  if (settings.deviceHeight !== DEFAULT_SETTINGS.deviceHeight) {
    params.set('height', String(settings.deviceHeight));
  }
  if (settings.showFrame !== DEFAULT_SETTINGS.showFrame) {
    params.set('frame', settings.showFrame ? '1' : '0');
  }
  if (settings.devicePosition !== DEFAULT_SETTINGS.devicePosition) {
    params.set('position', settings.devicePosition);
  }
  if (settings.hideScrollbar !== DEFAULT_SETTINGS.hideScrollbar) {
    params.set('scrollbar', settings.hideScrollbar ? '1' : '0');
  }

  const base = window.location.origin + window.location.pathname;
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
