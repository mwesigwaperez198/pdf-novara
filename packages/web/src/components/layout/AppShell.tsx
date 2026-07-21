import { Header } from './Header';
import { MainToolbar } from '../toolbar/MainToolbar';
import { Sidebar } from './Sidebar';
import { DocumentCanvas } from '../canvas/DocumentCanvas';
import { WelcomeScreen } from './WelcomeScreen';
import { ToastContainer } from './ToastContainer';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

export function AppShell() {
  const tabs = useDocumentStore((s) => s.tabs);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const { isDraggingOver, handleDragEnter, handleDragLeave, handleDragOver, handleDrop } = useDragAndDrop();

  return (
    <div
      className="flex flex-col h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Header />
      {tabs.length > 0 && <MainToolbar />}

      <div className="flex flex-1 overflow-hidden">
        {tabs.length > 0 && sidebarOpen && <Sidebar />}

        <main className="flex-1 overflow-hidden relative">
          {tabs.length > 0 ? <DocumentCanvas /> : <WelcomeScreen />}
        </main>
      </div>

      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-nova-950/80 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-nova-400 rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4 opacity-60">📄</div>
            <p className="text-xl font-semibold text-nova-200">Drop your document here</p>
            <p className="text-sm text-nova-400 mt-2">PDF, DOCX, TXT, MD, PNG, JPEG</p>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
