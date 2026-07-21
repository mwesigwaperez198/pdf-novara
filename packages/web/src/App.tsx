import { AppShell } from './components/layout/AppShell';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  useKeyboardShortcuts();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-surface-950">
      <AppShell />
    </div>
  );
}
