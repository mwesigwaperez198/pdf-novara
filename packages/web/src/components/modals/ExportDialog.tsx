import { useState } from 'react';
import { X, FileDown, FileText, Image, File } from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { PdfExporter } from '../../core/engine/exporters/PdfExporter';
import { DocxExporter } from '../../core/engine/exporters/DocxExporter';
import { ImageExporter } from '../../core/engine/exporters/ImageExporter';
import { pdfEditor } from '../../core/engine/PdfEditor';

type ExportFormat = 'pdf' | 'docx' | 'png' | 'jpeg';

export function ExportDialog() {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [quality, setQuality] = useState(95);
  const [isExporting, setIsExporting] = useState(false);
  const dialogOpen = useUIStore((s) => s.dialogOpen);
  const closeDialog = useUIStore((s) => s.closeDialog);
  const showToast = useUIStore((s) => s.showToast);
  const doc = useDocumentStore((s) => s.getActiveDocument());

  if (dialogOpen !== 'export' || !doc) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'pdf': {
          const bytes = await pdfEditor.applyEdits();
          await PdfExporter.exportDocument(doc, bytes.buffer as ArrayBuffer);
          break;
        }
        case 'docx': {
          const textHtml = doc.pages
            .flatMap((p) => p.textContent)
            .map((t) => `<p style="font-size:${t.fontSize}px;font-weight:${t.fontWeight}">${t.str}</p>`)
            .join('\n');
          await DocxExporter.exportDocument(doc, textHtml);
          break;
        }
        case 'png':
        case 'jpeg': {
          const canvas = document.querySelector('[data-page-index] canvas') as HTMLCanvasElement;
          if (canvas) {
            await ImageExporter.canvasToImage(canvas, format, quality / 100);
          }
          break;
        }
      }
      showToast(`Exported as ${format.toUpperCase()}`, 'success');
      closeDialog();
    } catch (err) {
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: typeof File; desc: string }[] = [
    { id: 'pdf', label: 'PDF Document', icon: FileText, desc: 'Best for sharing and printing' },
    { id: 'docx', label: 'Word Document', icon: File, desc: 'Editable in Microsoft Word' },
    { id: 'png', label: 'PNG Image', icon: Image, desc: 'High quality, transparent' },
    { id: 'jpeg', label: 'JPEG Image', icon: Image, desc: 'Smaller file size' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-800 rounded-xl border border-surface-600 shadow-2xl w-[440px] animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          <h2 className="text-base font-semibold text-white">Export Document</h2>
          <button onClick={closeDialog} className="toolbar-btn">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFormat(opt.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  format === opt.id
                    ? 'border-nova-400 bg-nova-600/10'
                    : 'border-surface-600 hover:border-surface-500 bg-surface-700/50'
                }`}
              >
                <opt.icon size={20} className={format === opt.id ? 'text-nova-400' : 'text-surface-400'} />
                <div className="text-sm font-medium text-white mt-1.5">{opt.label}</div>
                <div className="text-[11px] text-surface-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>

          {(format === 'png' || format === 'jpeg') && (
            <div>
              <label className="text-[11px] text-surface-400 mb-1 block">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-nova-500"
              />
            </div>
          )}

          <div className="bg-surface-700/50 rounded-lg px-4 py-3 text-xs text-surface-300">
            <div className="flex justify-between mb-1">
              <span>File name</span>
              <span className="font-mono">{doc.name.split('.')[0]}.{format === 'docx' ? 'docx' : format}</span>
            </div>
            <div className="flex justify-between">
              <span>Pages</span>
              <span className="font-mono">{doc.pages.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-surface-700">
          <button
            onClick={closeDialog}
            className="px-4 py-2 text-xs font-medium rounded-md border border-surface-600
                       text-surface-300 hover:bg-surface-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-xs font-medium rounded-md bg-nova-600 hover:bg-nova-500
                       text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FileDown size={14} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
