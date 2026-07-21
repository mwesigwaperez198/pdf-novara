import { useCallback, useState } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useUIStore } from '../store/useUIStore';
import { getFormatFromFilename } from '../utils/file';

export function useDragAndDrop() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const openFile = useDocumentStore((s) => s.openFile);
  const showToast = useUIStore((s) => s.showToast);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      const files = Array.from(e.dataTransfer.files);
      const supportedExts = ['.pdf', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.rtf'];

      for (const file of files) {
        const format = getFormatFromFilename(file.name);
        if (format && supportedExts.some((ext) => file.name.toLowerCase().endsWith(ext))) {
          await openFile(file);
          showToast(`Opened: ${file.name}`, 'success');
        } else {
          showToast(`Unsupported format: ${file.name}`, 'warning');
        }
      }
    },
    [openFile, showToast]
  );

  return {
    isDraggingOver,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
