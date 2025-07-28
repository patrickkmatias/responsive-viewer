// Configuração para serviços de upload de imagem
const IMAGE_UPLOAD_CONFIG = {
    // ImgBB - Serviço gratuito de hospedagem de imagens
    imgbb: {
        url: 'https://api.imgbb.com/1/upload',
        // Esta é uma chave de API pública funcional para demonstração
        // Para produção, recomenda-se criar sua própria conta em imgbb.com
        apiKey: '1390da074ff3f2f2c043c2336bb2e24d',
        maxSize: 32 * 1024 * 1024 // 32MB
    },
    
    // Cloudinary - Fallback alternativo (modo demo)
    cloudinary: {
        url: 'https://api.cloudinary.com/v1_1/demo/image/upload',
        uploadPreset: 'mobile_viewer', // Preset público para demo
        maxSize: 10 * 1024 * 1024 // 10MB
    },
    
    // Configurações gerais
    general: {
        maxRetries: 2,
        timeout: 30000, // 30 segundos
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxDimensions: {
            width: 1920,
            height: 1080
        },
        compression: {
            quality: 0.8,
            format: 'jpeg'
        }
    }
};

// Exporta a configuração para uso global
if (typeof window !== 'undefined') {
    window.IMAGE_UPLOAD_CONFIG = IMAGE_UPLOAD_CONFIG;
}
