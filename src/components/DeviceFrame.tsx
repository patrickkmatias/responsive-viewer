import { useCallback, useRef } from 'react';

interface DeviceFrameProps {
  websiteUrl: string;
  deviceWidth: number;
  deviceHeight: number;
  showFrame: boolean;
  hideScrollbar: boolean;
  siteLoaded: boolean;
  isLoading: boolean;
  onLoad: () => void;
}

export function DeviceFrame({
  websiteUrl,
  deviceWidth,
  deviceHeight,
  showFrame,
  hideScrollbar,
  siteLoaded,
  isLoading,
  onLoad,
}: DeviceFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = useCallback(() => {
    onLoad();
  }, [onLoad]);

  if (!siteLoaded) return null;

  const frameClasses = [
    'device-frame',
    'active',
    !showFrame && 'no-frame',
    isLoading && 'loading',
  ]
    .filter(Boolean)
    .join(' ');

  const screenStyle = {
    width: `${deviceWidth}px`,
    height: `${deviceHeight}px`,
  };

  const iframeElement = (
    <iframe
      ref={iframeRef}
      id="mobile-iframe"
      src={websiteUrl}
      title="Visualização da aplicação mobile"
      onLoad={handleLoad}
    />
  );

  return (
    <div className={frameClasses} role="img" aria-label="Frame de dispositivo móvel">
      <div className="device-screen" style={screenStyle}>
        {hideScrollbar ? (
          <div className="iframe-wrapper">{iframeElement}</div>
        ) : (
          iframeElement
        )}
      </div>
      {showFrame && <div className="device-notch" aria-hidden="true" />}
    </div>
  );
}
