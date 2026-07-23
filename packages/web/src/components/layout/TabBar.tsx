import { X, FileText } from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';

export function TabBar() {
  const tabs = useDocumentStore((s) => s.tabs);
  const activeTabId = useDocumentStore((s) => s.activeTabId);

  if (tabs.length === 0) return null;

  return (
    <div className="h-8 bg-surface-800 flex items-end border-b border-surface-700/50 shrink-0">
      <div className="flex items-end h-full overflow-x-auto scrollbar-none px-1 gap-0.5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => useDocumentStore.getState().setActiveTab(tab.id)}
              className={`group flex items-center gap-1.5 px-3 h-7 rounded-t-md cursor-pointer transition-all duration-100
                max-w-[180px] min-w-[100px]
                ${isActive
                  ? 'bg-surface-900 text-white border-t border-l border-r border-surface-700/50'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                }`}
            >
              <FileText size={12} className={isActive ? 'text-nova-400' : 'text-surface-500'} />
              <span className="text-[11px] font-medium truncate flex-1">{tab.document.name}</span>
              {tab.isDirty && <span className="text-nova-400 text-xs">•</span>}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useDocumentStore.getState().closeTab(tab.id);
                }}
                className="w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100
                           hover:bg-surface-600 text-surface-400 hover:text-white transition-all"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
