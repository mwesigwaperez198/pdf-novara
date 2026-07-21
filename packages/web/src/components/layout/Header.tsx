import {
  PanelLeftClose,
  PanelLeftOpen,
  FileUp,
  Moon,
  Sun,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { createFileInput } from '../../utils/file';

export function Header() {
  const tabs = useDocumentStore((s) => s.tabs);
  const activeTabId = useDocumentStore((s) => s.activeTabId);
  const openFile = useDocumentStore((s) => s.openFile);
  const { sidebarOpen, toggleSidebar, theme, setTheme, openDialog } = useUIStore();

  const handleOpen = async () => {
    const file = await createFileInput('.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.rtf');
    if (file) await openFile(file);
  };

  return (
    <header className="h-10 bg-surface-900 border-b border-surface-700/50 flex items-center px-2 shrink-0 select-none">
      <div className="flex items-center gap-1">
        {tabs.length > 0 && (
          <button onClick={toggleSidebar} className="toolbar-btn" title="Toggle sidebar">
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-nova-400 tracking-tight">NOVA</span>
          <span className="text-xs text-surface-400">Doc Editor</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {tabs.length === 0 && (
          <button
            onClick={handleOpen}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md
                       bg-nova-600 hover:bg-nova-500 text-white transition-colors"
          >
            <FileUp size={14} />
            Open File
          </button>
        )}

        {tabs.length > 0 && (
          <div className="flex items-center bg-surface-800 rounded-md px-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => useDocumentStore.getState().setActiveTab(tab.id)}
                className={`px-3 py-1 text-xs rounded-md transition-colors max-w-[160px] truncate ${
                  tab.id === activeTabId
                    ? 'bg-surface-700 text-white'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                {tab.document.name}
                {tab.isDirty && <span className="text-nova-400 ml-1">&#x2022;</span>}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => openDialog('export')}
          className="toolbar-btn"
          title="Export document"
        >
          <FileUp size={16} />
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="toolbar-btn"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
