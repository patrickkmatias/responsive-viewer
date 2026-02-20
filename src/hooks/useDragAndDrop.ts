import { useCallback, useEffect, useRef, useState } from 'react';
import { readFileAsDataUrl } from '../services/imageUpload';

interface UseDragAndDropOptions {
  onImageDrop: (backgroundImage: string) => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useDragAndDrop({ onImageDrop, onNotify }: UseDragAndDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLElement>(null);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files?.length) return;

      const file = files[0];
      if (!file.type.startsWith('image/')) {
        onNotify('Por favor, arraste apenas arquivos de imagem', 'error');
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        onImageDrop(`url(${dataUrl})`);
        onNotify('Imagem de fundo aplicada!', 'success');
      } catch {
        onNotify('Erro ao carregar imagem', 'error');
      }
    },
    [onImageDrop, onNotify],
  );

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    el.addEventListener('dragenter', handleDragEnter);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('drop', handleDrop);

    return () => {
      el.removeEventListener('dragenter', handleDragEnter);
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

  return { dropRef, isDragging };
}
