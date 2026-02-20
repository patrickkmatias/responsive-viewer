interface PlaceholderProps {
  visible: boolean;
}

export function Placeholder({ visible }: PlaceholderProps) {
  if (!visible) return null;

  return (
    <div className="placeholder">
      <div className="placeholder-content">
        <h2 aria-hidden="true">📱</h2>
        <p>Carregue uma URL para começar</p>
        <small>Insira a URL da aplicação e configure a imagem de fundo</small>
      </div>
    </div>
  );
}
