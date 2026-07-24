import { useRef, useEffect, useState } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { documentManager } from '../../core/engine/DocumentManager';
import type { PDFDocument } from '../../core/types/document';

interface PageThumbnailsProps {
  document: PDFDocument;
}

function ThumbnailCanvas({ pageIndex }: { pageIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let destroyed = false;

    const render = async () => {
      try {
        const renderer = documentManager.getRenderer();
        const doc = renderer.getDocument();
        if (!doc || destroyed) return;

        const page = await doc.getPage(pageIndex + 1);
        if (destroyed) return;

        const viewport = page.getViewport({ scale: 0.2 });
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({
          canvasContext: ctx as unknown as CanvasRenderingContext2D,
          viewport,
        }).promise;

        if (!destroyed) setReady(true);
      } catch {
        if (!destroyed) setReady(false);
      }
    };

    render();
    return () => { destroyed = true; };
  }, [pageIndex]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full object-contain transition-opacity ${ready ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

export function PageThumbnails({ document }: PageThumbnailsProps) {
  const currentPage = useDocumentStore((s) => s.currentPage);
  const setCurrentPage = useDocumentStore((s) => s.setCurrentPage);

  return (
    <div className="p-2 flex flex-col gap-2">
      <div className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold px-1">
        Pages ({document.pages.length})
      </div>
      {document.pages.map((page, index) => (
        <button
          key={page.index}
          onClick={() => setCurrentPage(index)}
          className={`relative w-full rounded-md overflow-hidden border-2 transition-all ${
            index === currentPage
              ? 'border-nova-400 ring-2 ring-nova-400/20'
              : 'border-surface-700 hover:border-surface-500'
          }`}
        >
          <div
            className="bg-white w-full flex items-center justify-center"
            style={{
              aspectRatio: `${page.width} / ${page.height}`,
            }}
          >
            <ThumbnailCanvas pageIndex={index} />
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-surface-900/80 backdrop-blur-sm
                          text-[10px] text-center py-0.5 font-mono text-surface-300">
            {index + 1}
          </div>
        </button>
      ))}
    </div>
  );
}
