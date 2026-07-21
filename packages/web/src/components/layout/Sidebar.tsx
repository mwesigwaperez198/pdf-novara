import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { PageThumbnails } from '../panels/PageThumbnails';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { SharingPanel } from '../panels/SharingPanel';

const SIDEBAR_TABS = [
  { id: 'pages' as const, label: 'Pages' },
  { id: 'properties' as const, label: 'Props' },
  { id: 'share' as const, label: 'Share' },
] as const;

export function Sidebar() {
  const sidebarTab = useUIStore((s) => s.sidebarTab);
  const setSidebarTab = useUIStore((s) => s.setSidebarTab);
  const doc = useDocumentStore((s) => s.getActiveDocument());

  return (
    <aside className="w-56 bg-surface-900 border-r border-surface-700/50 flex flex-col shrink-0 animate-slide-in">
      <div className="flex border-b border-surface-700/50">
        {SIDEBAR_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={`flex-1 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${
              sidebarTab === tab.id
                ? 'text-nova-400 border-b-2 border-nova-400'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {sidebarTab === 'pages' && doc && <PageThumbnails document={doc} />}
        {sidebarTab === 'properties' && <PropertiesPanel />}
        {sidebarTab === 'share' && <SharingPanel />}
      </div>
    </aside>
  );
}
