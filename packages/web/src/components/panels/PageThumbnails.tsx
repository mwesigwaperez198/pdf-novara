import { useDocumentStore } from '../../store/useDocumentStore';
import type { PDFDocument } from '../../core/types/document';

interface PageThumbnailsProps {
  document: PDFDocument;
}

export function PageThumbnails({ document }: PageThumbnailsProps) {
  const currentPage = useDocumentStore((s) => s.currentPage);
  const setCurrentPage = useDocumentStore((s) => s.setCurrentPage);

  return (
    <div className="p-2 flex flex-col gap-2">
      <div className="panel-label">Pages ({document.pages.length})</div>
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
            className="bg-white w-full"
            style={{
              aspectRatio: `${page.width} / ${page.height}`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-surface-400 text-xs">
              {index + 1}
            </div>
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
