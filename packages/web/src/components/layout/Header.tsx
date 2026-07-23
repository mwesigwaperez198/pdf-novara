import {
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';

export function Header() {
  const tabs = useDocumentStore((s) => s.tabs);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  return (
    <header className="h-9 bg-nova-900 flex items-center px-1 shrink-0 select-none drag-region">
      {/* Sidebar toggle */}
      <div className="flex items-center gap-0.5 no-drag">
        {tabs.length > 0 && (
          <button
            onClick={toggleSidebar}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Toggle sidebar"
          >
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          </button>
        )}
      </div>

      {/* Quick access - brand */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <span className="text-[11px] font-bold text-white/90 tracking-wider">NOVARA</span>
        <span className="text-[10px] text-white/40 font-medium">Doc Editor</span>
      </div>

      {/* Window controls area + theme */}
      <div className="flex items-center gap-0.5 no-drag">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
    </header>
  );
}
