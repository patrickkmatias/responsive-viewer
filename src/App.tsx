import { useCallback } from 'react';
import { useAppState } from './hooks/useAppState';
import { useNotifications } from './hooks/useNotifications';
import { ControlsPanel } from './components/ControlsPanel';
import { DeviceViewer } from './components/DeviceViewer';
import { Toast } from './components/Toast';
import { generateShareLink } from './services/shareLink';
import './styles/index.css';

export default function App() {
  const {
    state,
    updateSettings,
    setWebsiteUrl,
    onIframeLoad,
    setPanelMinimized,
    setShareLink,
    resetSettings,
  } = useAppState();

  const { notifications, notify, dismiss } = useNotifications();

  const handleGenerateLink = useCallback(async () => {
    try {
      notify('Gerando link...', 'info');
      const { panelMinimized, siteLoaded, isLoading, shareLink: _, ...settings } = state;
      const link = await generateShareLink(settings);
      setShareLink(link);
      notify('Link gerado com sucesso!', 'success');
    } catch (err) {
      console.error('Share link generation failed:', err);
      notify('Erro ao gerar link. Tente novamente.', 'error');
    }
  }, [state, setShareLink, notify]);

  const containerClasses = [
    'container',
    state.panelMinimized && 'fullscreen',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={containerClasses} role="application" aria-label="Mobile Viewer">
        <ControlsPanel
          settings={state}
          minimized={state.panelMinimized}
          shareLink={state.shareLink}
          onUpdate={updateSettings}
          onLoadSite={setWebsiteUrl}
          onReset={resetSettings}
          onMinimize={() => setPanelMinimized(true)}
          onGenerateLink={handleGenerateLink}
          onNotify={notify}
        />

        <DeviceViewer
          websiteUrl={state.websiteUrl}
          backgroundImage={state.backgroundImage}
          backgroundSize={state.backgroundSize}
          deviceWidth={state.deviceWidth}
          deviceHeight={state.deviceHeight}
          showFrame={state.showFrame}
          hideScrollbar={state.hideScrollbar}
          devicePosition={state.devicePosition}
          siteLoaded={state.siteLoaded}
          isLoading={state.isLoading}
          panelMinimized={state.panelMinimized}
          onIframeLoad={onIframeLoad}
          onMaximize={() => setPanelMinimized(false)}
          onBackgroundDrop={(bg) => updateSettings({ backgroundImage: bg })}
          onNotify={notify}
        />
      </div>

      <Toast notifications={notifications} onDismiss={dismiss} />
    </>
  );
}
