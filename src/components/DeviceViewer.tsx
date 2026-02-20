import type { CSSProperties } from 'react';
import type { BackgroundSize, DevicePosition } from '../types';
import { DeviceFrame } from './DeviceFrame';
import { Placeholder } from './Placeholder';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

interface DeviceViewerProps {
  websiteUrl: string;
  backgroundImage: string | null;
  backgroundSize: BackgroundSize;
  deviceWidth: number;
  deviceHeight: number;
  showFrame: boolean;
  hideScrollbar: boolean;
  devicePosition: DevicePosition;
  siteLoaded: boolean;
  isLoading: boolean;
  panelMinimized: boolean;
  onIframeLoad: () => void;
  onMaximize: () => void;
  onBackgroundDrop: (backgroundImage: string) => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

function getBackgroundStyle(
  backgroundImage: string | null,
  backgroundSize: BackgroundSize,
): CSSProperties {
  if (!backgroundImage) return {};

  const base: CSSProperties = {
    backgroundImage,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };

  if (backgroundSize === 'stretch') {
    base.backgroundSize = '100% 100%';
  } else {
    base.backgroundSize = backgroundSize;
  }

  return base;
}

export function DeviceViewer({
  websiteUrl,
  backgroundImage,
  backgroundSize,
  deviceWidth,
  deviceHeight,
  showFrame,
  hideScrollbar,
  devicePosition,
  siteLoaded,
  isLoading,
  panelMinimized,
  onIframeLoad,
  onMaximize,
  onBackgroundDrop,
  onNotify,
}: DeviceViewerProps) {
  const { dropRef, isDragging } = useDragAndDrop({
    onImageDrop: onBackgroundDrop,
    onNotify,
  });

  const viewerClasses = [
    'viewer-area',
    `position-${devicePosition}`,
    isDragging && 'drag-over',
  ].filter(Boolean).join(' ');

  const bgStyle = getBackgroundStyle(backgroundImage, backgroundSize);

  return (
    <main
      ref={dropRef as React.RefObject<HTMLElement>}
      className={viewerClasses}
      aria-label="Área de visualização do dispositivo"
      style={bgStyle}
    >
      {panelMinimized && (
        <button
          className="maximize-btn show"
          title="Mostrar painel"
          aria-label="Mostrar painel de controles"
          onClick={onMaximize}
        >
          ⚙️
        </button>
      )}

      <DeviceFrame
        websiteUrl={websiteUrl}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
        showFrame={showFrame}
        hideScrollbar={hideScrollbar}
        siteLoaded={siteLoaded}
        isLoading={isLoading}
        onLoad={onIframeLoad}
      />

      <Placeholder visible={!siteLoaded} />
    </main>
  );
}
