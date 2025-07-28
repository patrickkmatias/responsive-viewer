# 🔧 Configuração Avançada - APIs de Upload

Este arquivo documenta como configurar suas próprias chaves de API para os serviços de upload de imagem.

## 📋 Serviços Suportados

### 1. ImgBB (Recomendado)
- **Site**: https://imgbb.com/
- **Gratuito**: Sim
- **Limite**: 32MB por imagem
- **Armazenamento**: Ilimitado
- **API Rate Limit**: Generoso

**Como obter sua chave:**
1. Acesse https://imgbb.com/
2. Crie uma conta gratuita
3. Vá em "About" → "API" 
4. Copie sua API key
5. Substitua em `config.js`: `apiKey: 'SUA_CHAVE_AQUI'`

### 2. Cloudinary (Fallback)
- **Site**: https://cloudinary.com/
- **Gratuito**: Sim (com limites)
- **Limite**: 10MB por imagem
- **Armazenamento**: 25GB grátis

**Como configurar:**
1. Acesse https://cloudinary.com/
2. Crie uma conta gratuita
3. No Dashboard, anote seu "Cloud Name"
4. Crie um "Upload Preset" público
5. Atualize em `config.js`

## 🔧 Personalização da Configuração

### Arquivo: `config.js`

```javascript
const IMAGE_UPLOAD_CONFIG = {
    imgbb: {
        url: 'https://api.imgbb.com/1/upload',
        apiKey: 'SUA_CHAVE_IMGBB_AQUI', // Substitua pela sua chave
        maxSize: 32 * 1024 * 1024 // 32MB
    },
    
    cloudinary: {
        url: 'https://api.cloudinary.com/v1_1/SEU_CLOUD_NAME/image/upload',
        uploadPreset: 'SEU_PRESET_PUBLICO', // Substitua pelo seu preset
        maxSize: 10 * 1024 * 1024 // 10MB
    }
};
```

## 🚀 Deploy no Vercel

### Variáveis de Ambiente (Recomendado)

Para segurança em produção, use variáveis de ambiente:

1. No painel do Vercel, vá em "Settings" → "Environment Variables"
2. Adicione as variáveis:
   - `IMGBB_API_KEY`: Sua chave do ImgBB
   - `CLOUDINARY_CLOUD_NAME`: Seu cloud name do Cloudinary
   - `CLOUDINARY_UPLOAD_PRESET`: Seu upload preset

3. Atualize o `config.js` para usar as variáveis:

```javascript
const IMAGE_UPLOAD_CONFIG = {
    imgbb: {
        url: 'https://api.imgbb.com/1/upload',
        apiKey: process.env.IMGBB_API_KEY || '2d5b3c1e8f9a7b6c4d3e2f1a9b8c7d6e',
        maxSize: 32 * 1024 * 1024
    },
    // ... resto da configuração
};
```

## 🛡️ Segurança

### ⚠️ Importante:
- **Nunca commite chaves de API privadas** no código
- Use chaves públicas/presets públicos sempre que possível
- Para produção séria, considere implementar um backend próprio
- As chaves de demo incluídas são apenas para teste

### 🔒 Alternativas Seguras:
1. **Backend próprio**: Crie uma API própria para gerenciar uploads
2. **Serverless Functions**: Use Vercel Functions para proxy dos uploads
3. **Upload direto do cliente**: Use presets/chaves públicas configuradas corretamente

## 📊 Monitoramento

### Logs de Upload:
O sistema faz log dos uploads no console do navegador. Para monitorar:

1. Abra DevTools (F12)
2. Vá na aba "Console"
3. Procure por mensagens como:
   - "Upload realizado com sucesso no ImgBB"
   - "ImgBB falhou, tentando alternativa..."

### Métricas Recomendadas:
- Taxa de sucesso de uploads
- Tempo médio de upload
- Tamanho médio das imagens
- Uso da quota dos serviços

## 🔄 Adicionando Novos Serviços

Para adicionar um novo serviço de upload:

1. Adicione a configuração em `config.js`
2. Implemente a lógica em `uploadImageToService()` no `script.js`
3. Adicione tratamento de erro apropriado
4. Teste o fallback entre serviços

## ❓ Troubleshooting

### Problema: Upload falha sempre
- Verifique se as chaves de API estão corretas
- Confirme se os presets estão configurados como públicos
- Verifique se não há bloqueio de CORS

### Problema: Imagens muito grandes
- Aumente o limite em `config.js`
- Ou melhore a compressão em `optimizeImageForUpload()`

### Problema: Rate limiting
- Implemente retry com backoff exponencial
- Use múltiplos serviços para distribuir carga
- Considere cache local/sessionStorage
