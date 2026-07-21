import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { createFileInput } from '../../utils/file';
import {
  FileUp,
  FolderOpen,
} from 'lucide-react';

export function WelcomeScreen() {
  const openFile = useDocumentStore((s) => s.openFile);
  const showToast = useUIStore((s) => s.showToast);

  const handleOpen = async () => {
    const file = await createFileInput('.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.rtf');
    if (file) {
      await openFile(file);
      showToast(`Opened: ${file.name}`, 'success');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await openFile(files[0]);
      showToast(`Opened: ${files[0].name}`, 'success');
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-surface-950">
      <div
        className="w-[480px] p-12 rounded-2xl border-2 border-dashed border-surface-600
                   hover:border-nova-500 transition-colors cursor-pointer text-center group"
        onClick={handleOpen}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-800 flex items-center justify-center
                        group-hover:bg-nova-600/20 transition-colors">
          <FolderOpen size={36} className="text-surface-400 group-hover:text-nova-400 transition-colors" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          Open a Document
        </h2>
        <p className="text-sm text-surface-400 mb-6">
          Drag and drop a file here, or click to browse
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-surface-500">
          <FileUp size={14} />
          <span>PDF, DOCX, TXT, MD, PNG, JPEG, RTF</span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-[11px] text-surface-600">
          <span>Ctrl+O to open</span>
          <span className="text-surface-700">•</span>
          <span>100MB max</span>
        </div>
      </div>
    </div>
  );
}
