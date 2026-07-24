import { useEffect, useCallback } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useEditorStore } from '../store/useEditorStore';
import { useUIStore } from '../store/useUIStore';
import { createFileInput } from '../utils/file';

export function useKeyboardShortcuts() {
  const { undo, redo, zoomIn, zoomOut, zoomFit, tabs } = useDocumentStore();
  const { setTool } = useEditorStore();
  const { openDialog, showToast } = useUIStore();
  const openFile = useDocumentStore((s) => s.openFile);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const hasDoc = tabs.length > 0;

      if (ctrl && e.key === 'o') {
        e.preventDefault();
        createFileInput('.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.rtf').then(async (file) => {
          if (file) {
            await openFile(file);
            showToast(`Opened: ${file.name}`, 'success');
          }
        });
        return;
      }

      if (ctrl && e.key === 'e') {
        e.preventDefault();
        if (hasDoc) openDialog('export');
        return;
      }

      if (ctrl && e.key === 's') {
        e.preventDefault();
        if (hasDoc) openDialog('export');
        return;
      }

      if (ctrl && e.key === 'z' && !shift) {
        e.preventDefault();
        if (hasDoc) undo();
        return;
      }

      if (ctrl && e.key === 'z' && shift) {
        e.preventDefault();
        if (hasDoc) redo();
        return;
      }

      if (ctrl && e.key === 'y') {
        e.preventDefault();
        if (hasDoc) redo();
        return;
      }

      if (ctrl && e.key === '=') {
        e.preventDefault();
        zoomIn();
        return;
      }

      if (ctrl && e.key === '-') {
        e.preventDefault();
        zoomOut();
        return;
      }

      if (ctrl && e.key === '0') {
        e.preventDefault();
        const container = document.querySelector('[data-canvas-container]');
        if (container) {
          zoomFit(container.clientWidth, container.clientHeight);
        }
        return;
      }

      if (!ctrl && !e.altKey && !e.target?.toString().includes('HTMLInputElement')) {
        switch (e.key.toLowerCase()) {
          case 'v': setTool('select'); break;
          case 't': setTool('text'); break;
          case 'p': setTool('draw'); break;
          case 'h': setTool('hand'); break;
          case 'e': setTool('eraser'); break;
        }
      }
    },
    [undo, redo, zoomIn, zoomOut, zoomFit, setTool, tabs, openFile, openDialog, showToast]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
