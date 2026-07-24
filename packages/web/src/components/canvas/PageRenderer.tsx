import { useRef, useEffect, useState } from 'react';
import { documentManager } from '../../core/engine/DocumentManager';

interface PageRendererProps {
  pageIndex: number;
  width: number;
  height: number;
}

export function PageRenderer({ pageIndex, width, height }: PageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let destroyed = false;

    const render = async () => {
      if (destroyed) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      try {
        const renderer = documentManager.getRenderer();
        const doc = renderer.getDocument();
        if (!doc) {
          if (!destroyed) setRenderError('No document loaded');
          return;
        }

        const page = await doc.getPage(pageIndex + 1);
        if (destroyed) return;

        const viewport = page.getViewport({ scale: 1.0 });
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: ctx as unknown as CanvasRenderingContext2D,
          viewport,
        });

        renderTaskRef.current = { cancel: () => renderTask.cancel() };

        await renderTask.promise;
        renderTaskRef.current = null;

        if (!destroyed) setIsRendered(true);
      } catch (err: unknown) {
        if (destroyed) return;
        if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'RenderingCancelledException') {
          return;
        }
        console.error(`[NOVA] Failed to render page ${pageIndex}:`, err);
        setRenderError(err instanceof Error ? err.message : 'Render failed');
      }
    };

    render();

    return () => {
      destroyed = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pageIndex]);

  if (renderError) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 text-red-600 text-xs"
        style={{ width, height }}
      >
        {renderError}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`block transition-opacity duration-300 ${isRendered ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
