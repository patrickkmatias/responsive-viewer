import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppSettings, AppState, BackgroundSize, DevicePosition } from '../types';
import { DEFAULT_SETTINGS, DEVICE_LIMITS } from '../types';

const STORAGE_KEY = 'mobileViewerSettings';

function loadFromStorage(): Partial<AppSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveToStorage(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or unavailable
  }
}

function parseUrlParams(): Partial<AppSettings> | null {
  const params = new URLSearchParams(window.location.search);
  if (params.toString() === '') return null;

  const result: Partial<AppSettings> = {};

  const url = params.get('url');
  if (url) result.websiteUrl = url;

  const bgUrl = params.get('bgUrl');
  if (bgUrl) result.backgroundImage = `url(${bgUrl})`;

  const bgSize = params.get('bgSize');
  if (bgSize && ['cover', 'contain', 'stretch', 'center'].includes(bgSize)) {
    result.backgroundSize = bgSize as BackgroundSize;
  }

  const width = params.get('width');
  if (width) {
    const w = parseInt(width, 10);
    if (w >= DEVICE_LIMITS.minWidth && w <= DEVICE_LIMITS.maxWidth) result.deviceWidth = w;
  }

  const height = params.get('height');
  if (height) {
    const h = parseInt(height, 10);
    if (h >= DEVICE_LIMITS.minHeight && h <= DEVICE_LIMITS.maxHeight) result.deviceHeight = h;
  }

  const frame = params.get('frame');
  if (frame !== null) result.showFrame = frame === '1';

  const position = params.get('position');
  if (position && ['center', 'left', 'right'].includes(position)) {
    result.devicePosition = position as DevicePosition;
  }

  const scrollbar = params.get('scrollbar');
  if (scrollbar !== null) result.hideScrollbar = scrollbar === '1';

  return Object.keys(result).length > 0 ? result : null;
}

function clampDimensions<T extends AppSettings>(settings: T): T {
  return {
    ...settings,
    deviceWidth: Math.min(DEVICE_LIMITS.maxWidth, Math.max(DEVICE_LIMITS.minWidth, settings.deviceWidth)),
    deviceHeight: Math.min(DEVICE_LIMITS.maxHeight, Math.max(DEVICE_LIMITS.minHeight, settings.deviceHeight)),
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const urlParams = parseUrlParams();
    const stored = loadFromStorage();

    // URL params take priority over localStorage
    const merged = { ...DEFAULT_SETTINGS, ...stored, ...(urlParams ?? {}) };

    // Clean URL params after consuming them
    if (urlParams) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    return {
      ...clampDimensions(merged),
      panelMinimized: false,
      siteLoaded: !!merged.websiteUrl,
      isLoading: false,
      shareLink: null,
    };
  });

  // Persist settings to localStorage on change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const { panelMinimized, siteLoaded, isLoading, shareLink, ...settings } = state;
    saveToStorage(settings);
  }, [state]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState(prev => clampDimensions({ ...prev, ...patch }));
  }, []);

  const setWebsiteUrl = useCallback((url: string) => {
    setState(prev => ({ ...prev, websiteUrl: url, siteLoaded: !!url, isLoading: !!url }));
  }, []);

  const onIframeLoad = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const setPanelMinimized = useCallback((minimized: boolean) => {
    setState(prev => ({ ...prev, panelMinimized: minimized }));
  }, []);

  const setShareLink = useCallback((link: string | null) => {
    setState(prev => ({ ...prev, shareLink: link }));
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      ...DEFAULT_SETTINGS,
      panelMinimized: false,
      siteLoaded: false,
      isLoading: false,
      shareLink: null,
    });
  }, []);

  return {
    state,
    updateSettings,
    setWebsiteUrl,
    onIframeLoad,
    setPanelMinimized,
    setShareLink,
    resetSettings,
  };
}
