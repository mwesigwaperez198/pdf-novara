import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useUIStore } from './store/useUIStore';

export default function App() {
  useKeyboardShortcuts();
  const theme = useUIStore((s) => s.theme);

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
    </div>
  );
}
