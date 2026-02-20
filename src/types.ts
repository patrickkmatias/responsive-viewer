export type BackgroundSize = 'cover' | 'contain' | 'stretch' | 'center';
export type DevicePosition = 'center' | 'left' | 'right';

export interface AppSettings {
  websiteUrl: string;
  backgroundImage: string | null; // CSS background-image value (url(...) or data URL)
  backgroundSize: BackgroundSize;
  deviceWidth: number;
  deviceHeight: number;
  showFrame: boolean;
  devicePosition: DevicePosition;
  hideScrollbar: boolean;
}

export interface AppState extends AppSettings {
  panelMinimized: boolean;
  siteLoaded: boolean;
  isLoading: boolean;
  shareLink: string | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  websiteUrl: '',
  backgroundImage: null,
  backgroundSize: 'cover',
  deviceWidth: 375,
  deviceHeight: 812,
  showFrame: true,
  devicePosition: 'center',
  hideScrollbar: true,
};

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const DEVICE_LIMITS = {
  minWidth: 200,
  maxWidth: 600,
  minHeight: 400,
  maxHeight: 1200,
} as const;

export const IMAGE_UPLOAD_CONFIG = {
  imgbb: {
    url: 'https://api.imgbb.com/1/upload',
    apiKey: '1390da074ff3f2f2c043c2336bb2e24d',
  },
  optimization: {
    maxWidth: 1024,
    maxHeight: 768,
    quality: 0.7,
    format: 'image/jpeg' as const,
  },
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;
