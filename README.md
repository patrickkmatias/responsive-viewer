# 📱 Mobile Viewer

Uma aplicação web moderna e intuitiva para apresentar aplicações mobile desenvolvidas pelos seus alunos, permitindo visualização em iframe com imagens de fundo personalizáveis.

## 🚀 Funcionalidades

- **Visualização Mobile**: Exibe aplicações web em um frame de dispositivo móvel realista (375x812px por padrão)
- **Imagens de Fundo**: Suporte a upload de arquivos ou URLs de imagens
- **Configurações Flexíveis**: 
  - Modos de exibição da imagem (Cover, Contain, Stretch, Center)
  - Dimensões customizáveis do dispositivo (200-600px x 400-1200px)
  - **Moldura do dispositivo**: Opção para mostrar/ocultar a moldura do telefone
  - **Posicionamento**: Alinhar o dispositivo à esquerda, centro ou direita
  - **Scrollbar**: Ocultar a barra de rolagem do iframe mantendo a funcionalidade
  - Persistência de configurações no navegador
- **🔗 Compartilhamento por Link**: Gere links com configurações pré-definidas para fácil compartilhamento
- **Interface Moderna**: Design responsivo com animações suaves e controles toggle
- **Drag & Drop**: Arraste imagens diretamente para a área de visualização
- **Deploy Fácil**: Configurado para deploy imediato no Vercel

## 🎯 Uso Ideal

Perfeito para professores de web design que querem:
- Apresentar projetos mobile-first dos alunos
- Demonstrar aplicações responsivas em contexto mobile
- Criar apresentações visuais impactantes
- Comparar diferentes aplicações lado a lado

## 🛠️ Como Usar

1. **Insira a URL**: Cole o link da aplicação (ex: Vercel deployment)
2. **Adicione Imagem**: Upload de arquivo local ou URL de imagem de fundo
3. **Configure o Dispositivo**: 
   - Ajuste dimensões (largura/altura)
   - Escolha mostrar ou ocultar a moldura do telefone
   - Defina o posicionamento (esquerda, centro, direita)
4. **Personalize a Visualização**:
   - Configure o modo de exibição da imagem de fundo
   - Oculte a scrollbar se preferir uma visualização mais limpa
5. **🔗 Compartilhe**: Clique em "Gerar Link" para criar uma URL com suas configurações
6. **Apresente**: Sua aplicação estará pronta para apresentação!

## 🔗 Compartilhamento de Configurações

### **Para Professores:**
- Configure a aplicação como desejado
- **Adicione imagem de fundo** (upload local ou URL)
- Clique em **"Gerar Link"** 
- **Imagens locais são automaticamente enviadas para um servidor gratuito**
- Copie o link gerado (sempre curto e eficiente)
- Compartilhe com os alunos

### **Para Alunos:**
- Receba o link do professor
- Abra o link no navegador
- **Todas as configurações e imagem de fundo serão aplicadas automaticamente**
- Sua aplicação será carregada no viewer pré-configurado

### **🖼️ Sistema de Upload Inteligente:**
- **Imagens Locais**: Arquivos enviados via upload são automaticamente hospedados em serviços gratuitos (ImgBB, Cloudinary)
- **URLs Externas**: Imagens via URL são incluídas diretamente no link
- **Otimização Automática**: Imagens são redimensionadas e comprimidas automaticamente
- **Links Sempre Curtos**: Nunca mais URLs gigantes - apenas referências pequenas
- **Confiabilidade**: Sistema de fallback com múltiplos provedores
- **Cache Inteligente**: Evita upload duplicado da mesma imagem (baseado em hash SHA-256)
- **Debug Avançado**: Console logs para monitoramento de uploads
- **Sem Limites**: Sem preocupações com tamanho de URL do navegador

### **Parâmetros Suportados na URL:**
- `url` - URL da aplicação a ser exibida
- `bgUrl` - URL da imagem de fundo (gerada automaticamente para uploads)
- `bgSize` - Modo da imagem (cover, contain, stretch, center)
- `width` - Largura do dispositivo (200-600)
- `height` - Altura do dispositivo (400-1200)
- `frame` - Mostrar moldura (1 = sim, 0 = não)
- `position` - Posição do device (left, center, right)
- `scrollbar` - Esconder scrollbar (1 = esconder, 0 = mostrar)

## 📦 Deploy no Vercel

1. Faça fork/clone deste repositório
2. Conecte ao Vercel
3. Deploy automático!

**🔧 Para configuração avançada de APIs:**
- Veja o arquivo `CONFIG.md` para configurar suas próprias chaves de API
- As chaves incluídas são apenas para demonstração

Ou use a CLI do Vercel:
```bash
npm i -g vercel
vercel
```

## 💻 Desenvolvimento Local

```bash
# Servidor Python (recomendado)
python -m http.server 3000

# Ou qualquer servidor HTTP estático
npx serve .
```

Acesse: `http://localhost:3000`

## 🎨 Características Técnicas

- **HTML5 Semântico**: Estrutura limpa e acessível
- **CSS3 Moderno**: Flexbox, Grid, Animations, Backdrop Filter
- **JavaScript ES6+**: Classes, Modules, Local Storage
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Performance**: Otimizado para carregamento rápido
- **UX/UI**: Interface intuitiva com feedback visual

## 📱 Dimensões Suportadas

- **Largura**: 200px - 600px
- **Altura**: 400px - 1200px
- **Padrão**: 375x812px (iPhone padrão)

## 🔧 Configurações Salvas

A aplicação salva automaticamente:
- URL da última aplicação carregada
- Configurações de imagem de fundo
- Dimensões personalizadas do dispositivo
- Preferência de exibição da moldura
- Posicionamento do dispositivo
- Configuração da scrollbar
- Preferências de visualização

## 📄 Licença

MIT License - Use livremente para fins educacionais e comerciais.

---

**Desenvolvido com ❤️ para educadores e desenvolvedores**
