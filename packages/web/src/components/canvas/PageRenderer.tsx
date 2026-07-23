import { useRef, useEffect, useState } from 'react';
import { documentManager } from '../../core/engine/DocumentManager';

interface PageRendererProps {
  pageIndex: number;
  width: number;
  height: number;
}

export function PageRenderer({ pageIndex, width, height }: PageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    const render = async () => {
      try {
        const renderer = documentManager.getRenderer();
        if (!renderer.getDocument()) return;
        await renderer.renderPageToCanvas(pageIndex, canvasRef.current!, 2.0);
        if (!cancelled) setIsRendered(true);
      } catch (err) {
        if (!cancelled) console.error(`Failed to render page ${pageIndex}:`, err);
      }
    };

    render();
    return () => { cancelled = true; };
  }, [pageIndex]);

  return (
    <canvas
      ref={canvasRef}
      width={width * 2}
      height={height * 2}
      style={{ width, height }}
      className={`transition-opacity duration-300 ${isRendered ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
