import { useEffect, useCallback, useRef } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useEditorStore } from '../store/useEditorStore';

export function useKeyboardShortcuts() {
  const { undo, redo, zoomIn, zoomOut, zoomFit, tabs } = useDocumentStore();
  const { setTool } = useEditorStore();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const hasDoc = tabs.length > 0;

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
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          zoomFit(rect.width, rect.height);
        }
        return;
      }

      if (!ctrl && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v': setTool('select'); break;
          case 't': setTool('text'); break;
          case 'p': setTool('draw'); break;
          case 'h': setTool('hand'); break;
          case 'e': setTool('eraser'); break;
        }
      }
    },
    [undo, redo, zoomIn, zoomOut, zoomFit, setTool, tabs]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return containerRef;
}
