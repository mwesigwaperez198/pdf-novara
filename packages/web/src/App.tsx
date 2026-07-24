import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useUIStore } from './store/useUIStore';
import { useDocumentStore } from './store/useDocumentStore';

export default function App() {
  useKeyboardShortcuts();
  const theme = useUIStore((s) => s.theme);
  const error = useDocumentStore((s) => s.error);
  const isLoading = useDocumentStore((s) => s.isLoading);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-surface-950">
      <AppShell />
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
          <div className="bg-surface-800 rounded-xl px-6 py-4 flex items-center gap-3 shadow-xl border border-surface-600">
            <div className="w-5 h-5 border-2 border-nova-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-white">Opening document...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed inset-x-0 bottom-0 z-[101] p-4">
          <div className="mx-auto max-w-2xl bg-red-900/95 border border-red-500/50 rounded-xl px-4 py-3 flex items-start gap-3 shadow-2xl backdrop-blur-sm">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-[10px] font-bold">!</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-300 mb-1">Error Opening Document</p>
              <p className="text-sm text-red-200 break-all">{error}</p>
            </div>
            <button
              onClick={() => useDocumentStore.getState().clearError()}
              className="text-red-400 hover:text-white text-xs shrink-0 px-2 py-1 rounded hover:bg-red-800/50 transition-colors"
            >
              dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
