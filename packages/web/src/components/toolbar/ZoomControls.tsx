import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';

export function ZoomControls() {
  const zoom = useDocumentStore((s) => s.zoom);
  const setZoom = useDocumentStore((s) => s.setZoom);
  const zoomIn = useDocumentStore((s) => s.zoomIn);
  const zoomOut = useDocumentStore((s) => s.zoomOut);

  return (
    <div className="flex items-center gap-1">
      <button onClick={zoomOut} className="toolbar-btn" title="Zoom out">
        <ZoomOut size={16} />
      </button>

      <button
        onClick={() => setZoom(1.0)}
        className="px-2 py-1 text-[11px] font-mono text-surface-300 hover:text-white
                   rounded hover:bg-surface-700 transition-colors min-w-[52px] text-center"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button onClick={zoomIn} className="toolbar-btn" title="Zoom in">
        <ZoomIn size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        onClick={() => {
          const container = document.querySelector('[data-canvas-container]');
          if (container) {
            useDocumentStore.getState().zoomFit(
              container.clientWidth,
              container.clientHeight
            );
          }
        }}
        className="toolbar-btn"
        title="Fit to page"
      >
        <Maximize size={16} />
      </button>
    </div>
  );
}
