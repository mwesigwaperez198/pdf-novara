import { FolderOpen, Download, RotateCcw, RotateCw } from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { createFileInput } from '../../utils/file';

export function FileTools() {
  const openFile = useDocumentStore((s) => s.openFile);
  const undo = useDocumentStore((s) => s.undo);
  const redo = useDocumentStore((s) => s.redo);
  const tabs = useDocumentStore((s) => s.tabs);
  const activeTab = useDocumentStore((s) => s.getActiveTab());
  const openDialog = useUIStore((s) => s.openDialog);
  const showToast = useUIStore((s) => s.showToast);

  const handleOpen = async () => {
    const file = await createFileInput('.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.rtf');
    if (file) {
      await openFile(file);
      showToast(`Opened: ${file.name}`, 'success');
    }
  };

  return (
    <>
      <button onClick={handleOpen} className="toolbar-btn" title="Open file (Ctrl+O)">
        <FolderOpen size={16} />
      </button>

      <button
        onClick={() => openDialog('export')}
        disabled={tabs.length === 0}
        className="toolbar-btn"
        title="Export (Ctrl+E)"
      >
        <Download size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        onClick={undo}
        disabled={!activeTab || activeTab.undoStack.length === 0}
        className="toolbar-btn"
        title="Undo (Ctrl+Z)"
      >
        <RotateCcw size={16} />
      </button>

      <button
        onClick={redo}
        disabled={!activeTab || activeTab.redoStack.length === 0}
        className="toolbar-btn"
        title="Redo (Ctrl+Shift+Z)"
      >
        <RotateCw size={16} />
      </button>
    </>
  );
}
