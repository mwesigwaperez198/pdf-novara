import type { SupportedFormat } from '../core/types/document';
import { MIME_TYPES } from './constants';
import { getFileExtension } from './format';

export function isSupportedFormat(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext in MIME_TYPES;
}

export function getFormatFromFilename(filename: string): SupportedFormat | null {
  const ext = getFileExtension(filename);
  if (ext === 'jpg') return 'jpeg';
  if (['pdf', 'docx', 'txt', 'md', 'rtf', 'png', 'jpeg'].includes(ext)) {
    return ext as SupportedFormat;
  }
  return null;
}

export function isImageFormat(format: string): boolean {
  return ['png', 'jpeg', 'jpg'].includes(format);
}

export function isTextFormat(format: string): boolean {
  return ['txt', 'md', 'rtf'].includes(format);
}

export function createFileInput(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      resolve(input.files?.[0] ?? null);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export function createDragDropHandler(
  onFiles: (files: File[]) => void
): {
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
} {
  return {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFiles(files);
      }
    },
  };
}
