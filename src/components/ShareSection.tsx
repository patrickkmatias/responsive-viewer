import { useCallback, useState } from 'react';

interface ShareSectionProps {
  shareLink: string | null;
  onGenerateLink: () => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ShareSection({ shareLink, onGenerateLink, onNotify }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      onNotify('Link copiado!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.getElementById('share-link') as HTMLInputElement;
      input?.select();
      document.execCommand('copy');
      setCopied(true);
      onNotify('Link copiado!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareLink, onNotify]);

  return (
    <section className="control-group share-section" aria-label="Compartilhamento">
      <label>🔗 Compartilhar Configuração:</label>
      <button className="share-btn" onClick={onGenerateLink}>
        Gerar Link
      </button>

      {shareLink && (
        <div className="share-link-container">
          <input
            type="text"
            id="share-link"
            readOnly
            value={shareLink}
            aria-label="Link de compartilhamento"
          />
          <button
            className={`copy-btn ${copied ? 'copied' : ''}`}
            title="Copiar link"
            aria-label="Copiar link para área de transferência"
            onClick={handleCopy}
          >
            {copied ? '✅' : '📋'}
          </button>
        </div>
      )}

      <small className="share-info">
        Compartilhe este link para que outros possam carregar suas configurações automaticamente
      </small>
    </section>
  );
}
