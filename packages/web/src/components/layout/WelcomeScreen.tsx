import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { createFileInput } from '../../utils/file';

export function WelcomeScreen() {
  const openFile = useDocumentStore((s) => s.openFile);
  const showToast = useUIStore((s) => s.showToast);

  const handleOpen = async () => {
    try {
      const file = await createFileInput('.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.rtf');
      if (file) {
        console.log('[NOVA] Opening file:', file.name, file.size, 'bytes');
        await openFile(file);
        showToast(`Opened: ${file.name}`, 'success');
      }
    } catch (err) {
      console.error('[NOVA] Failed to open:', err);
      showToast(`Failed to open: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      try {
        await openFile(files[0]);
        showToast(`Opened: ${files[0].name}`, 'success');
      } catch (err) {
        showToast(`Failed to open: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
      }
    }
  };

  return (
    <div
      className="h-full flex items-center justify-center bg-surface-900"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-nova-600 to-nova-800
                        flex items-center justify-center shadow-lg shadow-nova-900/50">
          <span className="text-2xl font-black text-white tracking-tight">N</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          NOVA Doc Editor
        </h1>
        <p className="text-sm text-surface-400 mb-8">
          Open a PDF or document to get started
        </p>

        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                     bg-nova-600 hover:bg-nova-500 text-white font-semibold text-sm
                     shadow-lg shadow-nova-900/50 transition-all duration-200
                     hover:shadow-xl hover:shadow-nova-900/60 active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
          Open Document
        </button>

        <p className="text-[11px] text-surface-500 mt-6">
          or drag and drop a file anywhere
        </p>

        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-surface-600">
          <span>PDF</span><span>·</span>
          <span>DOCX</span><span>·</span>
          <span>TXT</span><span>·</span>
          <span>MD</span><span>·</span>
          <span>PNG</span><span>·</span>
          <span>JPEG</span>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] text-surface-600">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700 font-mono text-surface-400">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700 font-mono text-surface-400">O</kbd>
            <span className="ml-1">Open</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700 font-mono text-surface-400">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700 font-mono text-surface-400">E</kbd>
            <span className="ml-1">Export</span>
          </span>
        </div>
      </div>
    </div>
  );
}
