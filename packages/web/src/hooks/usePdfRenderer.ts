import { useEffect, useRef } from 'react';
import { PdfRenderer } from '../core/engine/PdfRenderer';

interface UsePdfRendererOptions {
  scale?: number;
  pageIndex: number;
}

export function usePdfRenderer({ scale = 1.5, pageIndex }: UsePdfRendererOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PdfRenderer | null>(null);
  const renderTaskRef = useRef<unknown>(null);

  const render = async () => {
    if (!canvasRef.current || !rendererRef.current) return;

    if (renderTaskRef.current) {
      (renderTaskRef.current as { cancel: () => void }).cancel();
    }

    try {
      await rendererRef.current.renderPageToCanvas(pageIndex, canvasRef.current, scale);
    } catch (err) {
      if (err instanceof Error && err.message.includes('cancelled')) return;
      console.error('Render error:', err);
    }
  };

  useEffect(() => {
    render();
  }, [render]);

  const setRenderer = (renderer: PdfRenderer) => {
    rendererRef.current = renderer;
  };

  return {
    canvasRef,
    setRenderer,
    render,
  };
}
