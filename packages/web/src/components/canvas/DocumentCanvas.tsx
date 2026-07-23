import { useRef, useCallback, useEffect } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useEditorStore } from '../../store/useEditorStore';
import { PageRenderer } from './PageRenderer';
import { AnnotationLayer } from './AnnotationLayer';

export function DocumentCanvas() {
  const doc = useDocumentStore((s) => s.getActiveDocument());
  const currentPage = useDocumentStore((s) => s.currentPage);
  const zoom = useDocumentStore((s) => s.zoom);
  const setCurrentPage = useDocumentStore((s) => s.setCurrentPage);
  const activeTool = useEditorStore((s) => s.activeTool);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        useDocumentStore.getState().setZoom(zoom + delta);
      }
    },
    [zoom]
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !doc) return;

    const pageElements = containerRef.current.querySelectorAll('[data-page-index]');
    let visiblePage = 0;
    pageElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();
      if (rect.top < containerRect.top + containerRect.height / 2) {
        visiblePage = parseInt(el.getAttribute('data-page-index') ?? '0');
      }
    });
    if (visiblePage !== currentPage) {
      setCurrentPage(visiblePage);
    }
  }, [doc, currentPage, setCurrentPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const cursorStyle: Record<string, string> = {
    select: 'default',
    hand: 'grab',
    text: 'text',
    draw: 'crosshair',
    image: 'crosshair',
    shape: 'crosshair',
    eraser: 'crosshair',
    highlight: 'crosshair',
    stamp: 'crosshair',
    signature: 'crosshair',
  };

  if (!doc) return null;

  return (
    <div
      ref={containerRef}
      data-canvas-container
      className="h-full overflow-auto bg-surface-900"
      style={{ cursor: cursorStyle[activeTool] ?? 'default' }}
      onWheel={handleWheel}
    >
      <div className="flex flex-col items-center py-8 gap-6 min-h-full">
        {doc.pages.map((page, index) => (
          <div
            key={page.index}
            data-page-index={index}
            className="relative shrink-0"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
          >
            <div
              className="bg-white overflow-hidden"
              style={{
                width: page.width,
                height: page.height,
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
            >
              <PageRenderer
                pageIndex={index}
                width={page.width}
                height={page.height}
              />
              <AnnotationLayer
                pageIndex={index}
                width={page.width}
                height={page.height}
                objects={page.objects}
                textContent={page.textContent}
              />
            </div>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-surface-500 font-mono">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
