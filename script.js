class MobileViewer {
    constructor() {
        this.iframeWrapper = null; // Para controle da scrollbar
        this.imageCache = new Map(); // Cache para evitar uploads duplicados
        this.initializeElements();
        this.bindEvents();
        this.loadFromUrl(); // Carrega da URL primeiro
        this.loadSettings(); // Depois carrega do localStorage (se não houver URL)
    }

    initializeElements() {
        this.websiteUrlInput = document.getElementById('website-url');
        this.backgroundImageInput = document.getElementById('background-image');
        this.backgroundUrlInput = document.getElementById('background-url');
        this.backgroundSizeSelect = document.getElementById('background-size');
        this.deviceWidthInput = document.getElementById('device-width');
        this.deviceHeightInput = document.getElementById('device-height');
        this.showFrameInput = document.getElementById('show-frame');
        this.devicePositionSelect = document.getElementById('device-position');
        this.hideScrollbarInput = document.getElementById('hide-scrollbar');
        this.loadSiteButton = document.getElementById('load-site');
        this.resetButton = document.getElementById('reset-settings');
        this.minimizeBtn = document.getElementById('minimize-btn');
        this.maximizeBtn = document.getElementById('maximize-btn');
        this.generateLinkBtn = document.getElementById('generate-link');
        this.copyLinkBtn = document.getElementById('copy-link');
        this.shareLinkInput = document.getElementById('share-link');
        this.shareLinkContainer = document.getElementById('share-link-container');
        this.controlsPanel = document.getElementById('controls-panel');
        this.container = document.querySelector('.container');
        
        this.viewerArea = document.getElementById('viewer-area');
        this.deviceFrame = document.getElementById('device-frame');
        this.deviceScreen = document.querySelector('.device-screen');
        this.mobileIframe = document.getElementById('mobile-iframe');
        this.placeholder = document.getElementById('placeholder');
    }

    bindEvents() {
        this.loadSiteButton.addEventListener('click', () => this.loadWebsite());
        this.resetButton.addEventListener('click', () => this.resetSettings());
        this.minimizeBtn.addEventListener('click', () => this.minimizePanel());
        this.maximizeBtn.addEventListener('click', () => this.maximizePanel());
        this.generateLinkBtn.addEventListener('click', () => this.generateShareLink());
        this.copyLinkBtn.addEventListener('click', () => this.copyShareLink());
        
        this.backgroundImageInput.addEventListener('change', (e) => this.handleBackgroundImage(e));
        this.backgroundUrlInput.addEventListener('input', () => this.handleBackgroundUrl());
        this.backgroundSizeSelect.addEventListener('change', () => this.updateBackgroundSize());
        
        this.deviceWidthInput.addEventListener('input', () => this.updateDeviceDimensions());
        this.deviceHeightInput.addEventListener('input', () => this.updateDeviceDimensions());
        
        this.showFrameInput.addEventListener('change', () => this.updateFrameVisibility());
        this.devicePositionSelect.addEventListener('change', () => this.updateDevicePosition());
        this.hideScrollbarInput.addEventListener('change', () => this.updateScrollbarVisibility());
        
        this.websiteUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadWebsite();
            }
        });

        // Show maximize button on click over viewer area background (not iframe)
        this.viewerArea.addEventListener('click', (e) => {
            if (this.controlsPanel.classList.contains('minimized') && 
                !this.isClickingOnDevice(e) && 
                !this.maximizeBtn.contains(e.target)) {
                this.toggleMaximizeButton();
            }
        });

        // Hide maximize button when clicking iframe or device
        this.deviceFrame.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Auto-save settings
        [this.backgroundSizeSelect, this.deviceWidthInput, this.deviceHeightInput, 
         this.showFrameInput, this.devicePositionSelect, this.hideScrollbarInput].forEach(element => {
            element.addEventListener('change', () => this.saveSettings());
        });
    }

    loadWebsite() {
        const url = this.websiteUrlInput.value.trim();
        
        if (!url) {
            this.showNotification('Por favor, insira uma URL válida', 'error');
            return;
        }

        // Adicionar protocolo se não estiver presente
        const finalUrl = url.startsWith('http') ? url : `https://${url}`;
        
        try {
            new URL(finalUrl); // Validar URL
        } catch {
            this.showNotification('URL inválida. Verifique o endereço e tente novamente.', 'error');
            return;
        }

        this.showLoading();
        
        this.mobileIframe.src = finalUrl;
        this.websiteUrlInput.value = finalUrl;
        
        this.mobileIframe.onload = () => {
            this.hideLoading();
            this.showDevice();
            this.saveSettings();
            this.showNotification('Site carregado com sucesso!', 'success');
        };

        this.mobileIframe.onerror = () => {
            this.hideLoading();
            this.showNotification('Erro ao carregar o site. Verifique a URL e tente novamente.', 'error');
        };
    }

    handleBackgroundImage(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                this.showNotification('Imagem muito grande. Use uma imagem menor que 5MB.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.setBackgroundImage(e.target.result);
                this.backgroundUrlInput.value = ''; // Clear URL input
                this.saveSettings();
            };
            reader.readAsDataURL(file);
        }
    }

    handleBackgroundUrl() {
        const url = this.backgroundUrlInput.value.trim();
        if (url) {
            this.setBackgroundImage(url);
            this.backgroundImageInput.value = ''; // Clear file input
            this.saveSettings();
        }
    }

    setBackgroundImage(imageSrc) {
        this.viewerArea.style.backgroundImage = `url(${imageSrc})`;
        this.updateBackgroundSize();
    }

    updateBackgroundSize() {
        const size = this.backgroundSizeSelect.value;
        
        switch (size) {
            case 'cover':
                this.viewerArea.style.backgroundSize = 'cover';
                break;
            case 'contain':
                this.viewerArea.style.backgroundSize = 'contain';
                break;
            case 'stretch':
                this.viewerArea.style.backgroundSize = '100% 100%';
                break;
            case 'center':
                this.viewerArea.style.backgroundSize = 'auto';
                break;
        }
        
        this.saveSettings();
    }

    updateDeviceDimensions() {
        const width = parseInt(this.deviceWidthInput.value) || 375;
        const height = parseInt(this.deviceHeightInput.value) || 812;
        
        // Validar dimensões
        const minWidth = 200, maxWidth = 600;
        const minHeight = 400, maxHeight = 1200;
        
        const finalWidth = Math.max(minWidth, Math.min(maxWidth, width));
        const finalHeight = Math.max(minHeight, Math.min(maxHeight, height));
        
        this.deviceScreen.style.width = `${finalWidth}px`;
        this.deviceScreen.style.height = `${finalHeight}px`;
        
        // Atualizar inputs se os valores foram ajustados
        if (finalWidth !== width) this.deviceWidthInput.value = finalWidth;
        if (finalHeight !== height) this.deviceHeightInput.value = finalHeight;
        
        this.saveSettings();
    }

    updateFrameVisibility() {
        const showFrame = this.showFrameInput.checked;
        
        if (showFrame) {
            this.deviceFrame.classList.remove('no-frame');
        } else {
            this.deviceFrame.classList.add('no-frame');
        }
        
        // Reaplica configurações de scrollbar para ajustar border-radius
        this.updateScrollbarVisibility();
        
        this.saveSettings();
    }

    updateDevicePosition() {
        const position = this.devicePositionSelect.value;
        
        // Remove classes anteriores
        this.viewerArea.classList.remove('position-center', 'position-left', 'position-right');
        
        // Adiciona nova classe
        this.viewerArea.classList.add(`position-${position}`);
        
        this.saveSettings();
    }

    updateScrollbarVisibility() {
        const hideScrollbar = this.hideScrollbarInput.checked;
        
        if (hideScrollbar) {
            // Método mais eficaz: criar um wrapper com overflow hidden
            this.hideIframeScrollbar();
        } else {
            this.showIframeScrollbar();
        }
        
        this.saveSettings();
    }

    hideIframeScrollbar() {
        // Remove classes/estilos anteriores
        this.mobileIframe.classList.remove('hide-scrollbar');
        
        // Cria um wrapper div se não existir
        if (!this.iframeWrapper) {
            this.iframeWrapper = document.createElement('div');
            this.iframeWrapper.className = 'iframe-wrapper';
            
            // Insere o wrapper antes do iframe
            this.mobileIframe.parentNode.insertBefore(this.iframeWrapper, this.mobileIframe);
            
            // Move o iframe para dentro do wrapper
            this.iframeWrapper.appendChild(this.mobileIframe);
        }
        
        // Aplica estilos para esconder scrollbar
        this.iframeWrapper.style.cssText = `
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: relative;
        `;
        
        this.mobileIframe.style.cssText = `
            width: calc(100% + 17px);
            height: calc(100% + 17px);
            border: none;
            border-radius: 25px;
            margin-right: -17px;
            margin-bottom: -17px;
            overflow: auto;
        `;
        
        // Ajusta border-radius para frame sem moldura
        if (this.deviceFrame.classList.contains('no-frame')) {
            this.mobileIframe.style.borderRadius = '8px';
        }
    }

    showIframeScrollbar() {
        // Remove wrapper se existir
        if (this.iframeWrapper) {
            this.iframeWrapper.parentNode.insertBefore(this.mobileIframe, this.iframeWrapper);
            this.iframeWrapper.remove();
            this.iframeWrapper = null;
        }
        
        // Restaura estilos originais do iframe
        this.mobileIframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 25px;
            overflow: auto;
        `;
        
        // Ajusta border-radius para frame sem moldura
        if (this.deviceFrame.classList.contains('no-frame')) {
            this.mobileIframe.style.borderRadius = '8px';
        }
    }

    minimizePanel() {
        this.controlsPanel.classList.add('minimized');
        this.container.classList.add('fullscreen');
        this.saveSettings();
        
        this.showNotification('Painel minimizado. Passe o mouse sobre a área para mostrar controles.', 'info');
    }

    maximizePanel() {
        this.controlsPanel.classList.remove('minimized');
        this.container.classList.remove('fullscreen');
        this.maximizeBtn.classList.remove('show');
        this.saveSettings();
    }

    isClickingOnDevice(event) {
        const deviceRect = this.deviceFrame.getBoundingClientRect();
        return (
            event.clientX >= deviceRect.left &&
            event.clientX <= deviceRect.right &&
            event.clientY >= deviceRect.top &&
            event.clientY <= deviceRect.bottom
        );
    }

    toggleMaximizeButton() {
        this.maximizeBtn.classList.toggle('show');
        
        // Auto-hide after 3 seconds
        if (this.maximizeBtn.classList.contains('show')) {
            setTimeout(() => {
                this.maximizeBtn.classList.remove('show');
            }, 3000);
        }
    }

    showDevice() {
        this.placeholder.classList.add('hidden');
        this.deviceFrame.classList.add('active');
        
        // Aplicar configurações atuais
        this.updateFrameVisibility();
        this.updateDevicePosition();
        this.updateScrollbarVisibility();
    }

    hideDevice() {
        this.placeholder.classList.remove('hidden');
        this.deviceFrame.classList.remove('active');
    }

    showLoading() {
        this.loadSiteButton.textContent = 'Carregando...';
        this.loadSiteButton.disabled = true;
        this.loadSiteButton.classList.add('loading');
    }

    hideLoading() {
        this.loadSiteButton.textContent = 'Carregar Site';
        this.loadSiteButton.disabled = false;
        this.loadSiteButton.classList.remove('loading');
    }

    showNotification(message, type = 'info') {
        // Remove notificação existente
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Estilos da notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            maxWidth: '300px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#10b981' : 
                           type === 'error' ? '#ef4444' : '#3b82f6'
        });

        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto-remover após 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    saveSettings() {
        const settings = {
            websiteUrl: this.websiteUrlInput.value,
            backgroundUrl: this.backgroundUrlInput.value,
            backgroundSize: this.backgroundSizeSelect.value,
            deviceWidth: this.deviceWidthInput.value,
            deviceHeight: this.deviceHeightInput.value,
            showFrame: this.showFrameInput.checked,
            devicePosition: this.devicePositionSelect.value,
            hideScrollbar: this.hideScrollbarInput.checked,
            panelMinimized: this.controlsPanel.classList.contains('minimized'),
            backgroundImage: this.viewerArea.style.backgroundImage
        };
        
        localStorage.setItem('mobileViewerSettings', JSON.stringify(settings));
    }

    loadSettings() {
        // Se há parâmetros na URL, não carrega do localStorage
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.size > 0) return;
        
        try {
            const settings = JSON.parse(localStorage.getItem('mobileViewerSettings'));
            if (settings) {
                this.websiteUrlInput.value = settings.websiteUrl || '';
                this.backgroundUrlInput.value = settings.backgroundUrl || '';
                this.backgroundSizeSelect.value = settings.backgroundSize || 'cover';
                this.deviceWidthInput.value = settings.deviceWidth || 375;
                this.deviceHeightInput.value = settings.deviceHeight || 812;
                this.showFrameInput.checked = settings.showFrame !== undefined ? settings.showFrame : true;
                this.devicePositionSelect.value = settings.devicePosition || 'center';
                this.hideScrollbarInput.checked = settings.hideScrollbar !== undefined ? settings.hideScrollbar : true;
                
                if (settings.backgroundImage) {
                    this.viewerArea.style.backgroundImage = settings.backgroundImage;
                }
                
                // Restaurar estado do painel
                if (settings.panelMinimized) {
                    this.controlsPanel.classList.add('minimized');
                    this.container.classList.add('fullscreen');
                }
                
                this.updateDeviceDimensions();
                this.updateBackgroundSize();
                this.updateFrameVisibility();
                this.updateDevicePosition();
                this.updateScrollbarVisibility();
                
                // Carregar site se URL estiver presente
                if (settings.websiteUrl) {
                    setTimeout(() => this.loadWebsite(), 500);
                }
            }
        } catch (error) {
            console.log('Erro ao carregar configurações:', error);
        }
    }

    resetSettings() {
        // Limpar inputs
        this.websiteUrlInput.value = '';
        this.backgroundUrlInput.value = '';
        this.backgroundImageInput.value = '';
        this.backgroundSizeSelect.value = 'cover';
        this.deviceWidthInput.value = 375;
        this.deviceHeightInput.value = 812;
        this.showFrameInput.checked = true;
        this.devicePositionSelect.value = 'center';
        this.hideScrollbarInput.checked = true;
        
        // Resetar iframe
        this.mobileIframe.src = 'about:blank';
        
        // Resetar background
        this.viewerArea.style.backgroundImage = '';
        
        // Resetar painel
        this.maximizePanel();
        
        // Limpar wrapper do iframe se existir
        if (this.iframeWrapper) {
            this.iframeWrapper.parentNode.insertBefore(this.mobileIframe, this.iframeWrapper);
            this.iframeWrapper.remove();
            this.iframeWrapper = null;
        }
        
        // Resetar todas as configurações visuais
        this.updateDeviceDimensions();
        this.updateFrameVisibility();
        this.updateDevicePosition();
        this.updateScrollbarVisibility();
        
        // Esconder device
        this.hideDevice();
        
        // Limpar localStorage
        localStorage.removeItem('mobileViewerSettings');
        
        this.showNotification('Configurações resetadas!', 'success');
    }

    generateShareLink() {
        const settings = {
            url: this.websiteUrlInput.value,
            bgUrl: this.backgroundUrlInput.value,
            bgSize: this.backgroundSizeSelect.value,
            width: this.deviceWidthInput.value,
            height: this.deviceHeightInput.value,
            frame: this.showFrameInput.checked ? '1' : '0',
            position: this.devicePositionSelect.value,
            scrollbar: this.hideScrollbarInput.checked ? '1' : '0'
        };

        // Verifica se há uma imagem de fundo carregada
        const currentBgImage = this.viewerArea.style.backgroundImage;
        if (currentBgImage && currentBgImage !== 'none' && !settings.bgUrl) {
            // Se há uma imagem de fundo mas não é uma URL, é um arquivo local
            this.uploadImageAndGenerateLink(settings);
        } else {
            this.finalizeShareLink(settings);
        }
    }

    // Gera hash simples de uma imagem para cache
    async generateImageHash(blob) {
        const buffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    }

    // Verifica se a imagem já foi carregada
    async checkImageCache(blob) {
        const hash = await this.generateImageHash(blob);
        return this.imageCache.get(hash);
    }

    // Adiciona imagem ao cache
    async addToImageCache(blob, uploadedUrl) {
        const hash = await this.generateImageHash(blob);
        this.imageCache.set(hash, uploadedUrl);
        return hash;
    }

    async uploadImageAndGenerateLink(settings) {
        // Obtém a imagem atual do background
        const currentBgImage = this.viewerArea.style.backgroundImage;
        
        if (!currentBgImage || currentBgImage === 'none') {
            this.finalizeShareLink(settings);
            return;
        }

        // Extrai a URL da imagem do CSS
        const imageUrl = currentBgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        
        // Se já é uma URL http/https, não precisa fazer upload
        if (imageUrl.startsWith('http')) {
            settings.bgUrl = imageUrl;
            this.finalizeShareLink(settings);
            return;
        }

        // Se é base64 ou blob, precisa fazer upload
        if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
            this.showNotification('🚀 Fazendo upload da imagem...', 'info');
            
            // Desabilita o botão temporariamente
            this.generateLinkBtn.disabled = true;
            this.generateLinkBtn.textContent = '⏳ Enviando...';
            
            try {
                // Converte para blob se necessário
                let blob;
                if (imageUrl.startsWith('data:')) {
                    blob = await this.dataUrlToBlob(imageUrl);
                } else {
                    blob = await fetch(imageUrl).then(r => r.blob());
                }

                // Verifica se a imagem já está no cache
                const cachedUrl = await this.checkImageCache(blob);
                if (cachedUrl) {
                    console.log('🎯 URL encontrada no cache:', cachedUrl);
                    settings.bgUrl = cachedUrl;
                    console.log('✅ settings.bgUrl definida via cache:', settings.bgUrl);
                    this.showNotification('✅ Imagem já carregada. Link gerado a partir do cache.', 'success');
                } else {
                    // Faz upload da imagem
                    console.log('📤 Iniciando upload de nova imagem...');
                    const uploadedUrl = await this.uploadImageToService(blob);
                    console.log('📥 URL recebida do upload:', uploadedUrl);
                    
                    if (uploadedUrl) {
                        settings.bgUrl = uploadedUrl;
                        console.log('✅ settings.bgUrl definida via upload:', settings.bgUrl);
                        // Adiciona imagem ao cache
                        await this.addToImageCache(blob, uploadedUrl);
                        this.showNotification('✅ Imagem carregada com sucesso! Link gerado.', 'success');
                    } else {
                        console.log('❌ Upload falhou, nenhuma URL recebida');
                        this.showNotification('⚠️ Erro ao carregar imagem. Link gerado sem imagem de fundo.', 'error');
                    }
                }
                
                // Reabilita o botão
                this.generateLinkBtn.disabled = false;
                this.generateLinkBtn.textContent = '🔗 Gerar Link';
                
                // Gera o link APÓS o upload
                this.finalizeShareLink(settings);
                
            } catch (error) {
                console.error('Erro ao fazer upload da imagem:', error);
                this.showNotification(`❌ ${error.message || 'Erro ao processar imagem'}. Link gerado sem imagem.`, 'error');
                
                // Reabilita o botão
                this.generateLinkBtn.disabled = false;
                this.generateLinkBtn.textContent = '🔗 Gerar Link';
                
                // Gera o link mesmo com erro
                this.finalizeShareLink(settings);
            }
        } else {
            // Se não há imagem para upload, gera o link diretamente
            this.finalizeShareLink(settings);
        }
    }

    // Converte data URL para Blob
    dataUrlToBlob(dataUrl) {
        return new Promise((resolve) => {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            resolve(new Blob([u8arr], { type: mime }));
        });
    }

    // Faz upload da imagem para um serviço gratuito
    async uploadImageToService(blob) {
        const config = window.IMAGE_UPLOAD_CONFIG || {};
        
        // Validação básica do blob
        if (!blob || blob.size === 0) {
            throw new Error('Blob de imagem inválido');
        }
        
        // Valida o tipo de arquivo
        if (config.general && config.general.allowedTypes) {
            if (!config.general.allowedTypes.includes(blob.type)) {
                throw new Error(`Tipo de arquivo não suportado: ${blob.type}`);
            }
        }

        // Valida o tamanho do arquivo (máximo 10MB para compatibilidade)
        if (blob.size > 10 * 1024 * 1024) {
            throw new Error(`Arquivo muito grande: ${(blob.size / 1024 / 1024).toFixed(2)}MB (máx. 10MB)`);
        }

        console.log('📊 Informações do blob:');
        console.log('- Tipo:', blob.type);
        console.log('- Tamanho:', (blob.size / 1024).toFixed(2), 'KB');

        // Otimiza a imagem antes do upload
        const optimizedBlob = await this.optimizeImageForUpload(blob);
        console.log('✅ Imagem otimizada:');
        console.log('- Novo tipo:', optimizedBlob.type);
        console.log('- Novo tamanho:', (optimizedBlob.size / 1024).toFixed(2), 'KB');

        // Tenta upload no ImgBB (simplificado e com logs detalhados)
        try {
            console.log('🚀 === INICIANDO UPLOAD NO IMGBB ===');
            
            // Usa a chave da configuração
            const config = window.IMAGE_UPLOAD_CONFIG || {};
            const apiKey = config.imgbb?.apiKey || '1390da074ff3f2f2c043c2336bb2e24d';
            
            console.log('🔑 API Key:', apiKey);
            console.log('📦 Blob info:');
            console.log('   - Tipo:', optimizedBlob.type);
            console.log('   - Tamanho:', optimizedBlob.size, 'bytes');
            console.log('   - Tamanho em KB:', (optimizedBlob.size / 1024).toFixed(2));
            
            const formData = new FormData();
            formData.append('image', optimizedBlob);
            formData.append('key', apiKey);

            console.log('📡 Fazendo requisição para ImgBB...');
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });

            console.log('📊 Resposta HTTP:');
            console.log('   - Status:', response.status);
            console.log('   - Status Text:', response.statusText);
            console.log('   - Headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ Corpo da resposta de erro:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const responseData = await response.json();
            console.log('✅ JSON de resposta:', JSON.stringify(responseData, null, 2));

            if (responseData.success && responseData.data && responseData.data.url) {
                const imageUrl = responseData.data.url;
                console.log('🎉 === UPLOAD CONCLUÍDO COM SUCESSO ===');
                console.log('🔗 URL da imagem:', imageUrl);
                return imageUrl;
            } else {
                const errorMsg = responseData.error?.message || 'Resposta inesperada';
                console.log('❌ === UPLOAD FALHOU ===');
                console.log('💀 Erro:', errorMsg);
                throw new Error(`ImgBB: ${errorMsg}`);
            }
        } catch (error) {
            console.log('💥 === EXCEÇÃO NO UPLOAD ===');
            console.log('❌ Erro completo:', error);
            throw error;
        }

    }

    // Otimiza a imagem antes do upload
    async optimizeImageForUpload(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Define dimensões máximas para reduzir tamanho do arquivo
                    const maxWidth = 1024;  // Reduzido para melhor compatibilidade
                    const maxHeight = 768;  // Reduzido para melhor compatibilidade
                    
                    let { width, height } = img;
                    
                    // Calcula novas dimensões mantendo a proporção
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.floor(width * ratio);
                        height = Math.floor(height * ratio);
                        console.log(`📐 Redimensionando de ${img.width}x${img.height} para ${width}x${height}`);
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Desenha a imagem otimizada
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Converte para blob otimizado com qualidade reduzida para melhor compatibilidade
                    canvas.toBlob((optimizedBlob) => {
                        if (optimizedBlob) {
                            resolve(optimizedBlob);
                        } else {
                            reject(new Error('Falha ao otimizar imagem'));
                        }
                    }, 'image/jpeg', 0.7); // Qualidade reduzida para menor tamanho
                    
                } catch (error) {
                    console.error('Erro na otimização:', error);
                    // Em caso de erro, retorna o blob original
                    resolve(blob);
                }
            };
            
            img.onerror = () => {
                console.error('Erro ao carregar imagem para otimização');
                // Em caso de erro, retorna o blob original
                resolve(blob);
            };
            
            img.src = URL.createObjectURL(blob);
        });
    }

    finalizeShareLink(settings) {
        // Debug: mostra configurações no console ANTES do processamento
        console.log('🔍 Settings recebidas para link:', settings);
        
        // Remove apenas parâmetros vazios e valores padrão específicos
        const params = new URLSearchParams();
        Object.entries(settings).forEach(([key, value]) => {
            console.log(`📝 Processando: ${key} = "${value}" (tipo: ${typeof value})`);
            
            if (value && value !== '') {
                // Só remove valores padrão para campos específicos
                if (key === 'position' && value === 'center') {
                    console.log(`⏭️ Ignorando valor padrão: ${key} = ${value}`);
                    return;
                }
                if (key === 'bgSize' && value === 'cover') {
                    console.log(`⏭️ Ignorando valor padrão: ${key} = ${value}`);
                    return;
                }
                if (key === 'width' && value === '375') {
                    console.log(`⏭️ Ignorando valor padrão: ${key} = ${value}`);
                    return;
                }
                if (key === 'height' && value === '812') {
                    console.log(`⏭️ Ignorando valor padrão: ${key} = ${value}`);
                    return;
                }
                if (key === 'frame' && value === '0') {
                    console.log(`⏭️ Ignorando valor padrão: ${key} = ${value}`);
                    return;
                }
                if (key === 'scrollbar' && value === '0') {
                    console.log(`⏭️ Ignorando valor padrão: ${key} = ${value}`);
                    return;
                }
                
                // Para URLs de imagem, sempre incluir
                console.log(`✅ Incluindo no link: ${key} = ${value}`);
                params.append(key, value);
            } else {
                console.log(`❌ Valor vazio ou nulo: ${key} = "${value}"`);
            }
        });

        // Debug: mostra parâmetros finais
        console.log('🎯 Parâmetros finais da URL:', Object.fromEntries(params));

        // Gera o link
        const baseUrl = window.location.href.split('?')[0];
        const shareUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
        
        console.log('🔗 Link final gerado:', shareUrl);
        
        this.shareLinkInput.value = shareUrl;
        this.shareLinkContainer.style.display = 'flex';
        
        this.showNotification('Link de compartilhamento gerado!', 'success');
        
        // Seleciona o texto para facilitar a cópia
        this.shareLinkInput.select();
    }

    copyShareLink() {
        if (!this.shareLinkInput.value) {
            this.showNotification('Gere um link primeiro!', 'error');
            return;
        }

        // Copia para a área de transferência
        this.shareLinkInput.select();
        this.shareLinkInput.setSelectionRange(0, 99999); // Para dispositivos móveis
        
        navigator.clipboard.writeText(this.shareLinkInput.value).then(() => {
            this.copyLinkBtn.classList.add('copied');
            this.copyLinkBtn.textContent = '✅';
            this.showNotification('Link copiado para a área de transferência!', 'success');
            
            // Restaura o botão após 2 segundos
            setTimeout(() => {
                this.copyLinkBtn.classList.remove('copied');
                this.copyLinkBtn.textContent = '📋';
            }, 2000);
        }).catch(() => {
            // Fallback para navegadores mais antigos
            try {
                document.execCommand('copy');
                this.showNotification('Link copiado!', 'success');
            } catch (err) {
                this.showNotification('Não foi possível copiar. Selecione o texto manualmente.', 'error');
            }
        });
    }

    loadFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.size === 0) return; // Não há parâmetros na URL
        
        // Carrega configurações da URL
        const urlSettings = {
            url: urlParams.get('url') || '',
            bgUrl: urlParams.get('bgUrl') || '',
            bgSize: urlParams.get('bgSize') || 'cover',
            width: urlParams.get('width') || '375',
            height: urlParams.get('height') || '812',
            frame: urlParams.get('frame') === '1',
            position: urlParams.get('position') || 'center',
            scrollbar: urlParams.get('scrollbar') !== '0' // Default true
        };

        // Aplica as configurações
        this.websiteUrlInput.value = urlSettings.url;
        this.backgroundUrlInput.value = urlSettings.bgUrl;
        this.backgroundSizeSelect.value = urlSettings.bgSize;
        this.deviceWidthInput.value = urlSettings.width;
        this.deviceHeightInput.value = urlSettings.height;
        this.showFrameInput.checked = urlSettings.frame;
        this.devicePositionSelect.value = urlSettings.position;
        this.hideScrollbarInput.checked = urlSettings.scrollbar;

        // Aplica imagem de fundo
        if (urlSettings.bgUrl) {
            this.setBackgroundImage(urlSettings.bgUrl);
        }

        // Atualiza as configurações visuais
        this.updateDeviceDimensions();
        this.updateBackgroundSize();
        this.updateFrameVisibility();
        this.updateDevicePosition();
        this.updateScrollbarVisibility();

        // Carrega o site se URL fornecida
        if (urlSettings.url) {
            setTimeout(() => {
                this.loadWebsite();
                this.showNotification('Configurações e site carregados do link compartilhado!', 'success');
            }, 500);
        } else {
            this.showNotification('Configurações aplicadas do link compartilhado!', 'success');
        }

        // Limpa a URL para não ficar muito longa
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new MobileViewer();
});

// Adicionar suporte para drag and drop de imagens
document.addEventListener('DOMContentLoaded', () => {
    const viewerArea = document.getElementById('viewer-area');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        viewerArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        viewerArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        viewerArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        viewerArea.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
    }

    function unhighlight(e) {
        viewerArea.style.backgroundColor = '';
    }

    viewerArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const backgroundImageInput = document.getElementById('background-image');
                backgroundImageInput.files = files;
                backgroundImageInput.dispatchEvent(new Event('change'));
            }
        }
    }
});
