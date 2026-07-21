import { useCallback, useState } from 'react';
import { useUIStore } from '../store/useUIStore';

interface ClipboardData {
  text: string | null;
  html: string | null;
  image: Blob | null;
}

export function useClipboard() {
  const [clipboardData, setClipboardData] = useState<ClipboardData>({
    text: null,
    html: null,
    image: null,
  });
  const showToast = useUIStore((s) => s.showToast);

  const copy = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardData({ text, html: null, image: null });
    } catch {
      showToast('Copy not available — check browser permissions', 'warning');
    }
  }, [showToast]);

  const paste = useCallback(async (): Promise<ClipboardData> => {
    try {
      const text = await navigator.clipboard.readText();
      const data: ClipboardData = { text, html: null, image: null };
      setClipboardData(data);
      return data;
    } catch {
      showToast('Paste not available — check browser permissions', 'warning');
      return clipboardData;
    }
  }, [clipboardData, showToast]);

  const cut = useCallback(async () => {
    await copy();
  }, [copy]);

  const copyImage = useCallback(async (canvas: HTMLCanvasElement) => {
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob) {
        setClipboardData({ text: null, html: null, image: blob });
        showToast('Image copied', 'success');
      }
    } catch {
      showToast('Failed to copy image', 'error');
    }
  }, [showToast]);

  const clearClipboard = useCallback(() => {
    setClipboardData({ text: null, html: null, image: null });
  }, []);

  return {
    clipboardData,
    copy,
    paste,
    cut,
    copyImage,
    clearClipboard,
    hasContent: clipboardData.text !== null || clipboardData.image !== null,
  };
}
