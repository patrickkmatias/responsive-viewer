import { useCallback, useRef, useState } from 'react';
import type { AppSettings, BackgroundSize, DevicePosition } from '../types';
import { Toggle } from './Toggle';
import { ShareSection } from './ShareSection';
import { readFileAsDataUrl } from '../services/imageUpload';

interface ControlsPanelProps {
  settings: AppSettings;
  minimized: boolean;
  shareLink: string | null;
  onUpdate: (patch: Partial<AppSettings>) => void;
  onLoadSite: (url: string) => void;
  onReset: () => void;
  onMinimize: () => void;
  onGenerateLink: () => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ControlsPanel({
  settings,
  minimized,
  shareLink,
  onUpdate,
  onLoadSite,
  onReset,
  onMinimize,
  onGenerateLink,
  onNotify,
}: ControlsPanelProps) {
  const [urlInput, setUrlInput] = useState(settings.websiteUrl);
  const [bgUrlInput, setBgUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadSite = useCallback(() => {
    const url = urlInput.trim();
    if (!url) {
      onNotify('Por favor, insira uma URL válida', 'error');
      return;
    }
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    setUrlInput(finalUrl);
    onLoadSite(finalUrl);
  }, [urlInput, onLoadSite, onNotify]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleLoadSite();
    },
    [handleLoadSite],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onUpdate({ backgroundImage: `url(${dataUrl})` });
        onNotify('Imagem de fundo aplicada!', 'success');
      } catch {
        onNotify('Erro ao carregar imagem', 'error');
      }
    },
    [onUpdate, onNotify],
  );

  const handleBgUrl = useCallback(() => {
    const url = bgUrlInput.trim();
    if (!url) return;
    onUpdate({ backgroundImage: `url(${url})` });
    onNotify('Imagem de fundo aplicada!', 'success');
  }, [bgUrlInput, onUpdate, onNotify]);

  const handleBgUrlKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleBgUrl();
    },
    [handleBgUrl],
  );

  const panelClasses = ['controls-panel', minimized && 'minimized'].filter(Boolean).join(' ');

  return (
    <aside className={panelClasses} aria-label="Painel de configurações">
      <button
        className="minimize-btn"
        title="Minimizar painel"
        aria-label="Minimizar painel de controles"
        onClick={onMinimize}
      >
        ⌂
      </button>

      <header className="controls-header">
        <h1>📱 Mobile Viewer</h1>
        <p>Apresente suas aplicações mobile com estilo</p>
      </header>

      {/* URL Input */}
      <div className="control-group">
        <label htmlFor="website-url">URL da Aplicação:</label>
        <input
          type="url"
          id="website-url"
          placeholder="https://sua-aplicacao.vercel.app"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleLoadSite}>Carregar Site</button>
      </div>

      {/* Background Image */}
      <div className="control-group">
        <label htmlFor="background-image">Imagem de Fundo:</label>
        <input
          type="file"
          id="background-image"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <input
          type="url"
          id="background-url"
          placeholder="ou URL da imagem"
          value={bgUrlInput}
          onChange={e => setBgUrlInput(e.target.value)}
          onKeyDown={handleBgUrlKeyPress}
          onBlur={handleBgUrl}
        />
      </div>

      {/* Background Size */}
      <div className="control-group">
        <label htmlFor="background-size">Modo da Imagem:</label>
        <select
          id="background-size"
          value={settings.backgroundSize}
          onChange={e => onUpdate({ backgroundSize: e.target.value as BackgroundSize })}
        >
          <option value="cover">Cobrir (Cover)</option>
          <option value="contain">Conter (Contain)</option>
          <option value="stretch">Esticar (Stretch)</option>
          <option value="center">Centralizar</option>
        </select>
      </div>

      {/* Device Width */}
      <div className="control-group">
        <label htmlFor="device-width">Largura do Device:</label>
        <input
          type="number"
          id="device-width"
          value={settings.deviceWidth}
          onChange={e => onUpdate({ deviceWidth: parseInt(e.target.value, 10) || 375 })}
        />
        <span className="unit">px</span>
      </div>

      {/* Device Height */}
      <div className="control-group">
        <label htmlFor="device-height">Altura do Device:</label>
        <input
          type="number"
          id="device-height"
          value={settings.deviceHeight}
          onChange={e => onUpdate({ deviceHeight: parseInt(e.target.value, 10) || 812 })}
        />
        <span className="unit">px</span>
      </div>

      {/* Frame Toggle */}
      <div className="control-group">
        <label htmlFor="show-frame">Moldura do Device:</label>
        <Toggle
          id="show-frame"
          label="Mostrar moldura"
          checked={settings.showFrame}
          onChange={checked => onUpdate({ showFrame: checked })}
        />
      </div>

      {/* Device Position */}
      <div className="control-group">
        <label htmlFor="device-position">Posição do Device:</label>
        <select
          id="device-position"
          value={settings.devicePosition}
          onChange={e => onUpdate({ devicePosition: e.target.value as DevicePosition })}
        >
          <option value="center">Centro</option>
          <option value="left">Esquerda</option>
          <option value="right">Direita</option>
        </select>
      </div>

      {/* Scrollbar Toggle */}
      <div className="control-group">
        <label htmlFor="hide-scrollbar">Scrollbar do Iframe:</label>
        <Toggle
          id="hide-scrollbar"
          label="Esconder scrollbar"
          checked={settings.hideScrollbar}
          onChange={checked => onUpdate({ hideScrollbar: checked })}
        />
      </div>

      {/* Reset */}
      <div className="control-group">
        <button id="reset-settings" onClick={onReset}>
          Resetar Configurações
        </button>
      </div>

      {/* Share */}
      <ShareSection
        shareLink={shareLink}
        onGenerateLink={onGenerateLink}
        onNotify={onNotify}
      />
    </aside>
  );
}
