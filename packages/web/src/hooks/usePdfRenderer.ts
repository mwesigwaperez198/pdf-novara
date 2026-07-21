import { useCallback, useRef, useEffect } from 'react';
import { PdfRenderer } from '../core/engine/PdfRenderer';

interface UsePdfRendererOptions {
  scale?: number;
  pageIndex: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function usePdfRenderer({ scale = 1.5, pageIndex, containerRef }: UsePdfRendererOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PdfRenderer | null>(null);
  const renderTaskRef = useRef<unknown>(null);

  const render = useCallback(async () => {
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
  }, [pageIndex, scale]);

  useEffect(() => {
    render();
  }, [render]);

  const setRenderer = useCallback((renderer: PdfRenderer) => {
    rendererRef.current = renderer;
  }, []);

  return {
    canvasRef,
    setRenderer,
    render,
  };
}
