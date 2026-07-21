import {
  RotateCw,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { pdfEditor } from '../../core/engine/PdfEditor';

export function PageTools() {
  const doc = useDocumentStore((s) => s.getActiveDocument());
  const currentPage = useDocumentStore((s) => s.currentPage);
  const setCurrentPage = useDocumentStore((s) => s.setCurrentPage);
  const totalPages = useDocumentStore((s) => s.totalPages);
  const showToast = useUIStore((s) => s.showToast);

  const handleRotate = () => {
    if (!doc) return;
    try {
      pdfEditor.rotatePage(currentPage, 90);
      showToast('Page rotated 90', 'info');
    } catch {
      showToast('Failed to rotate page', 'error');
    }
  };

  const handleDeletePage = () => {
    if (!doc || totalPages <= 1) {
      showToast('Cannot delete the only page', 'warning');
      return;
    }
    try {
      pdfEditor.deletePage(currentPage);
      if (currentPage >= totalPages - 1) {
        setCurrentPage(Math.max(0, totalPages - 2));
      }
      showToast('Page deleted', 'info');
    } catch {
      showToast('Failed to delete page', 'error');
    }
  };

  return (
    <>
      <button
        onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
        disabled={currentPage === 0}
        className="toolbar-btn"
        title="Previous page"
      >
        <ArrowUp size={16} />
      </button>

      <span className="text-[11px] text-surface-400 px-1 min-w-[60px] text-center font-mono">
        {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : '---'}
      </span>

      <button
        onClick={() => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="toolbar-btn"
        title="Next page"
      >
        <ArrowDown size={16} />
      </button>

      <div className="toolbar-divider" />

      <button onClick={handleRotate} className="toolbar-btn" title="Rotate page 90">
        <RotateCw size={16} />
      </button>

      <button onClick={handleDeletePage} className="toolbar-btn" title="Delete page">
        <Trash2 size={16} />
      </button>
    </>
  );
}
