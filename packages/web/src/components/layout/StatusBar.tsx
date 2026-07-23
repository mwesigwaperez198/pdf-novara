import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';

export function StatusBar() {
  const tabs = useDocumentStore((s) => s.tabs);
  const currentPage = useDocumentStore((s) => s.currentPage);
  const totalPages = useDocumentStore((s) => s.totalPages);
  const zoom = useDocumentStore((s) => s.zoom);
  const setZoom = useDocumentStore((s) => s.setZoom);
  const setCurrentPage = useDocumentStore((s) => s.setCurrentPage);

  if (tabs.length === 0) return null;

  return (
    <div className="h-7 bg-surface-800 border-t border-surface-700/50 flex items-center px-3 shrink-0 select-none">
      {/* Left: page navigation */}
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-700 text-surface-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="text-[10px] text-surface-400 font-mono">
            Page <input
              type="text"
              value={totalPages > 0 ? currentPage + 1 : ''}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  setCurrentPage(val - 1);
                }
              }}
              className="w-7 h-4 bg-surface-700 border border-surface-600 rounded text-center text-[10px] text-white
                         font-mono outline-none focus:border-nova-500 transition-colors"
            /> of {totalPages}
          </span>
          <button
            onClick={() => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-700 text-surface-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div className="w-px h-3 bg-surface-700" />

        <span className="text-[10px] text-surface-500 font-mono">
          {totalPages} {totalPages === 1 ? 'page' : 'pages'}
        </span>
      </div>

      {/* Center: status text */}
      <div className="flex-1 flex justify-center">
        <span className="text-[10px] text-surface-500">NOVA Doc Editor</span>
      </div>

      {/* Right: zoom controls */}
      <div className="flex items-center gap-1 flex-1 justify-end">
        <button
          onClick={() => useDocumentStore.getState().zoomOut()}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
        >
          <ZoomOut size={11} />
        </button>

        <input
          type="range"
          min="25"
          max="400"
          step="5"
          value={Math.round(zoom * 100)}
          onChange={(e) => setZoom(Number(e.target.value) / 100)}
          className="w-20 h-1 accent-nova-500 cursor-pointer"
        />

        <button
          onClick={() => useDocumentStore.getState().zoomIn()}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
        >
          <ZoomIn size={11} />
        </button>

        <button
          onClick={() => {
            const c = document.querySelector('[data-canvas-container]');
            if (c) useDocumentStore.getState().zoomFit(c.clientWidth, c.clientHeight);
          }}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
          title="Fit to page"
        >
          <Maximize size={11} />
        </button>

        <div className="w-px h-3 bg-surface-700" />

        <button
          onClick={() => setZoom(1.0)}
          className="px-1.5 h-4 flex items-center justify-center rounded hover:bg-surface-700
                     text-[10px] font-mono text-surface-300 hover:text-white transition-colors min-w-[36px]"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>
    </div>
  );
}
