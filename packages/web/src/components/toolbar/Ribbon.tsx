import {
  Save,
  Undo2,
  Redo2,
  FolderOpen,
  FileDown,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { useEditorStore } from '../../store/useEditorStore';
import { createFileInput } from '../../utils/file';
import { documentManager } from '../../core/engine/DocumentManager';

export type RibbonTab = 'home' | 'edit' | 'insert' | 'page' | 'review' | 'view';

export const RIBBON_TABS: { id: RibbonTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'edit', label: 'Edit' },
  { id: 'insert', label: 'Insert' },
  { id: 'page', label: 'Page Layout' },
  { id: 'review', label: 'Review' },
  { id: 'view', label: 'View' },
];

interface RibbonGroupProps {
  label: string;
  children: React.ReactNode;
}

function RibbonGroup({ label, children }: RibbonGroupProps) {
  return (
    <div className="flex flex-col items-center border-r border-surface-200/10 px-2 last:border-r-0">
      <div className="flex items-center gap-0.5 mb-1">{children}</div>
      <span className="text-[9px] text-surface-500 font-medium tracking-wide uppercase">{label}</span>
    </div>
  );
}

interface RibbonButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  large?: boolean;
  title?: string;
}

function RibbonButton({ icon, label, onClick, disabled, active, large, title }: RibbonButtonProps) {
  if (large) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={title || label}
        className={`flex flex-col items-center justify-center w-[52px] h-[52px] rounded-md
          transition-all duration-100 select-none
          ${active ? 'bg-nova-600/20 text-nova-400 ring-1 ring-nova-500/30' : 'text-surface-300 hover:bg-surface-200/10 hover:text-white'}
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
      >
        <div className="mb-1">{icon}</div>
        <span className="text-[9px] leading-none font-medium">{label}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-medium
        transition-all duration-100 select-none whitespace-nowrap
        ${active ? 'bg-nova-600/20 text-nova-400' : 'text-surface-300 hover:bg-surface-200/10 hover:text-white'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-[0.97]'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function HomeTab() {
  const openFile = useDocumentStore((s) => s.openFile);
  const undo = useDocumentStore((s) => s.undo);
  const redo = useDocumentStore((s) => s.redo);
  const activeTab = useDocumentStore((s) => s.getActiveTab());
  const tabs = useDocumentStore((s) => s.tabs);
  const openDialog = useUIStore((s) => s.openDialog);
  const showToast = useUIStore((s) => s.showToast);
  const setTool = useEditorStore((s) => s.setTool);

  const handleOpen = async () => {
    const file = await createFileInput('.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.rtf');
    if (file) {
      await openFile(file);
      showToast(`Opened: ${file.name}`, 'success');
    }
  };

  return (
    <div className="flex items-stretch h-[68px] px-2 gap-0">
      <RibbonGroup label="Clipboard">
        <RibbonButton
          icon={<FolderOpen size={20} />}
          label="Open"
          onClick={handleOpen}
          large
        />
        <RibbonButton
          icon={<Save size={18} />}
          label="Save"
          disabled={tabs.length === 0}
          large
        />
        <RibbonButton
          icon={<FileDown size={18} />}
          label="Export"
          disabled={tabs.length === 0}
          onClick={() => openDialog('export')}
          large
        />
      </RibbonGroup>

      <RibbonGroup label="History">
        <RibbonButton
          icon={<Undo2 size={16} />}
          label="Undo"
          onClick={undo}
          disabled={!activeTab || activeTab.undoStack.length === 0}
        />
        <RibbonButton
          icon={<Redo2 size={16} />}
          label="Redo"
          onClick={redo}
          disabled={!activeTab || activeTab.redoStack.length === 0}
        />
      </RibbonGroup>

      <RibbonGroup label="Tools">
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 4h6m0 0v6m0-6-7 7"/><path d="M18 20H4a2 2 0 01-2-2V6a2 2 0 012-2h10"/></svg>}
          label="Edit Text"
          onClick={() => setTool('text')}
          title="Edit text in document"
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83"/></svg>}
          label="Comment"
          title="Add comment"
        />
      </RibbonGroup>

      <RibbonGroup label="Zoom">
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>}
          label="Zoom In"
          onClick={() => useDocumentStore.getState().zoomIn()}
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>}
          label="Zoom Out"
          onClick={() => useDocumentStore.getState().zoomOut()}
        />
      </RibbonGroup>
    </div>
  );
}

function EditTab() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setTool = useEditorStore((s) => s.setTool);

  const tools = [
    { id: 'select' as const, icon: '⬚', label: 'Select', key: 'V' },
    { id: 'hand' as const, icon: '✋', label: 'Hand', key: 'H' },
    { id: 'text' as const, icon: 'T', label: 'Text', key: 'T' },
    { id: 'draw' as const, icon: '✏', label: 'Draw', key: 'P' },
    { id: 'eraser' as const, icon: '◻', label: 'Eraser', key: 'E' },
  ];

  return (
    <div className="flex items-stretch h-[68px] px-2 gap-0">
      <RibbonGroup label="Modify">
        {tools.map((t) => (
          <RibbonButton
            key={t.id}
            icon={<span className="text-sm font-bold w-5 h-5 flex items-center justify-center">{t.icon}</span>}
            label={t.label}
            onClick={() => setTool(t.id)}
            active={activeTool === t.id}
            title={`${t.label} (${t.key})`}
          />
        ))}
      </RibbonGroup>

      <RibbonGroup label="Annotate">
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>}
          label="Highlight"
          onClick={() => setTool('highlight')}
          active={activeTool === 'highlight'}
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>}
          label="Note"
          title="Add sticky note"
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
          label="Comment"
          title="Add comment"
        />
      </RibbonGroup>
    </div>
  );
}

function InsertTab() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setTool = useEditorStore((s) => s.setTool);
  const updateToolOptions = useEditorStore((s) => s.updateToolOptions);
  const toolOptions = useEditorStore((s) => s.toolOptions);

  return (
    <div className="flex items-stretch h-[68px] px-2 gap-0">
      <RibbonGroup label="Images">
        <RibbonButton
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>}
          label="Image"
          onClick={() => setTool('image')}
          active={activeTool === 'image'}
          large
        />
      </RibbonGroup>

      <RibbonGroup label="Shapes">
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/></svg>}
          label="Rectangle"
          onClick={() => { setTool('shape'); updateToolOptions({ shapeType: 'rectangle' }); }}
          active={activeTool === 'shape' && toolOptions.shapeType === 'rectangle'}
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>}
          label="Circle"
          onClick={() => { setTool('shape'); updateToolOptions({ shapeType: 'circle' }); }}
          active={activeTool === 'shape' && toolOptions.shapeType === 'circle'}
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19L19 5"/></svg>}
          label="Line"
          onClick={() => { setTool('shape'); updateToolOptions({ shapeType: 'line' }); }}
          active={activeTool === 'shape' && toolOptions.shapeType === 'line'}
        />
      </RibbonGroup>

      <RibbonGroup label="Draw">
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>}
          label="Pen"
          onClick={() => setTool('draw')}
          active={activeTool === 'draw'}
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>}
          label="Signature"
          onClick={() => setTool('signature')}
          active={activeTool === 'signature'}
        />
      </RibbonGroup>

      <RibbonGroup label="Style">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-surface-400 w-8">Fill</span>
              <input
                type="color"
                value={toolOptions.fillColor === 'transparent' ? '#000000' : toolOptions.fillColor}
                onChange={(e) => updateToolOptions({ fillColor: e.target.value })}
                className="w-5 h-5 rounded border border-surface-600 cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-surface-400 w-8">Stroke</span>
              <input
                type="color"
                value={toolOptions.strokeColor}
                onChange={(e) => updateToolOptions({ strokeColor: e.target.value })}
                className="w-5 h-5 rounded border border-surface-600 cursor-pointer bg-transparent"
              />
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={toolOptions.strokeWidth}
            onChange={(e) => updateToolOptions({ strokeWidth: Number(e.target.value) })}
            className="w-16 h-1 accent-nova-500"
            title="Stroke width"
          />
        </div>
      </RibbonGroup>
    </div>
  );
}

function PageLayoutTab() {
  const doc = useDocumentStore((s) => s.getActiveDocument());
  const currentPage = useDocumentStore((s) => s.currentPage);
  const totalPages = useDocumentStore((s) => s.totalPages);
  const setCurrentPage = useDocumentStore((s) => s.setCurrentPage);
  const showToast = useUIStore((s) => s.showToast);
  const openFile = useDocumentStore((s) => s.openFile);

  const ensureEditorLoaded = async () => {
    const editor = documentManager.getEditor();
    const docData = documentManager.getActiveDocumentData();
    if (docData) {
      await editor.loadFromBytes(docData);
    }
    return editor;
  };

  const handleRotate = async () => {
    if (!doc) return;
    try {
      const editor = await ensureEditorLoaded();
      editor.rotatePage(currentPage, 90);
      showToast('Page rotated 90°', 'info');
    } catch {
      showToast('Rotate failed', 'error');
    }
  };

  const handleDeletePage = async () => {
    if (!doc || totalPages <= 1) {
      showToast('Cannot delete the only page', 'warning');
      return;
    }
    try {
      const editor = await ensureEditorLoaded();
      editor.deletePage(currentPage);
      if (currentPage >= totalPages - 1) {
        setCurrentPage(Math.max(0, totalPages - 2));
      }
      showToast('Page deleted', 'info');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const handleInsertPage = async () => {
    const file = await createFileInput('.pdf');
    if (file) {
      await openFile(file);
      showToast('Page inserted', 'success');
    }
  };

  return (
    <div className="flex items-stretch h-[68px] px-2 gap-0">
      <RibbonGroup label="Pages">
        <RibbonButton
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>}
          label="Insert"
          onClick={handleInsertPage}
          large
        />
        <RibbonButton
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>}
          label="Delete"
          onClick={handleDeletePage}
          disabled={!doc || totalPages <= 1}
        />
      </RibbonGroup>

      <RibbonGroup label="Organize">
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>}
          label="Rotate Left"
          onClick={handleRotate}
          title="Rotate 90° counter-clockwise"
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>}
          label="Rotate Right"
          onClick={handleRotate}
          title="Rotate 90° clockwise"
        />
      </RibbonGroup>

      <RibbonGroup label="Navigate">
        <div className="flex items-center gap-1">
          <button
            onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200/10 text-surface-300 disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="text-[11px] font-mono text-surface-300 min-w-[50px] text-center">
            {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : '---'}
          </span>
          <button
            onClick={() => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200/10 text-surface-300 disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </RibbonGroup>
    </div>
  );
}

function ReviewTab() {
  return (
    <div className="flex items-stretch h-[68px] px-2 gap-0">
      <RibbonGroup label="Markup">
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>}
          label="Highlight"
          title="Highlight text"
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>}
          label="Underline"
          title="Underline text"
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>}
          label="Strikethrough"
          title="Strikethrough text"
        />
      </RibbonGroup>

      <RibbonGroup label="Annotations">
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
          label="Note"
          title="Add sticky note"
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.174 6.812a1 1 0 00-3.986-3.987L3.842 16.174a2 2 0 00-.5.83l-1.321 4.352a.5.5 0 00.623.622l4.353-1.32a2 2 0 00.83-.497z"/></svg>}
          label="Stamp"
          title="Add stamp"
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>}
          label="Sign"
          title="Add signature"
        />
      </RibbonGroup>
    </div>
  );
}

function ViewTab() {
  const zoom = useDocumentStore((s) => s.zoom);
  const setZoom = useDocumentStore((s) => s.setZoom);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="flex items-stretch h-[68px] px-2 gap-0">
      <RibbonGroup label="Zoom">
        <RibbonButton
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>}
          label="Zoom In"
          onClick={() => useDocumentStore.getState().zoomIn()}
          large
        />
        <RibbonButton
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>}
          label="Zoom Out"
          onClick={() => useDocumentStore.getState().zoomOut()}
          large
        />
      </RibbonGroup>

      <RibbonGroup label="Preset Zoom">
        {[50, 75, 100, 125, 150, 200].map((pct) => (
          <RibbonButton
            key={pct}
            icon={<span className="text-[11px] font-mono">{pct}%</span>}
            label=""
            onClick={() => setZoom(pct / 100)}
            active={Math.round(zoom * 100) === pct}
          />
        ))}
      </RibbonGroup>

      <RibbonGroup label="Layout">
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>}
          label="Panel"
          onClick={toggleSidebar}
          active={sidebarOpen}
          title="Toggle sidebar"
        />
        <RibbonButton
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>}
          label="Fit Page"
          onClick={() => {
            const c = document.querySelector('[data-canvas-container]');
            if (c) useDocumentStore.getState().zoomFit(c.clientWidth, c.clientHeight);
          }}
          title="Fit to page"
        />
      </RibbonGroup>
    </div>
  );
}

const TAB_COMPONENTS: Record<RibbonTab, React.FC> = {
  home: HomeTab,
  edit: EditTab,
  insert: InsertTab,
  page: PageLayoutTab,
  review: ReviewTab,
  view: ViewTab,
};

export function Ribbon({ activeTab, onTabChange }: { activeTab: RibbonTab; onTabChange: (tab: RibbonTab) => void }) {
  const TabContent = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex flex-col bg-surface-900 border-b border-surface-700/50 select-none shrink-0">
      {/* Tab headers */}
      <div className="flex items-center h-8 px-1 gap-0 bg-surface-900 border-b border-surface-700/30">
        <div className="flex items-center gap-0 px-1">
          <div className="w-5 h-5 flex items-center justify-center mr-1">
            <span className="text-[10px] font-black text-nova-400">N</span>
          </div>
        </div>
        {RIBBON_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 h-7 text-[11px] font-semibold tracking-wide rounded-t transition-all duration-100
              ${activeTab === tab.id
                ? 'bg-surface-800 text-white border-t-2 border-nova-500 -mb-px'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
              }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="flex-1" />

        <div className="flex items-center gap-1 pr-2">
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors" title="Settings">
            <Settings size={14} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors" title="Help">
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-surface-850 min-h-[68px] flex items-center">
        <TabContent />
      </div>
    </div>
  );
}
