export const APP_NAME = 'NOVA Doc Editor';
export const APP_VERSION = '0.1.0';

export const SUPPORTED_FORMATS = {
  input: ['.pdf', '.docx', '.txt', '.md', '.rtf', '.png', '.jpg', '.jpeg'] as const,
  output: ['.pdf', '.docx', '.png', '.jpg'] as const,
};

export const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  md: 'text/markdown',
  rtf: 'application/rtf',
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_CLOUD_STORAGE = 10 * 1024 * 1024 * 1024; // 10GB

export const CANVAS_DEFAULTS = {
  backgroundColor: '#f8f9fa',
  pageShadow: '0 2px 8px rgba(0,0,0,0.12)',
  pageGap: 16,
  minZoom: 0.1,
  maxZoom: 5.0,
  defaultZoom: 1.0,
  textLayerOpacity: 0.25,
};

export const SHORTCUTS = {
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Shift+Z',
  save: 'Ctrl+S',
  open: 'Ctrl+O',
  export: 'Ctrl+E',
  copy: 'Ctrl+C',
  paste: 'Ctrl+V',
  cut: 'Ctrl+X',
  selectAll: 'Ctrl+A',
  delete: 'Delete',
  zoomIn: 'Ctrl+=',
  zoomOut: 'Ctrl+-',
  zoomFit: 'Ctrl+0',
  nextPage: 'ArrowDown',
  prevPage: 'ArrowUp',
  handTool: 'H',
  selectTool: 'V',
  textTool: 'T',
  drawTool: 'P',
} as const;

export const CLOUDFLARE_API_BASE = '/api';

export const FONTS = [
  'Inter',
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Helvetica',
  'Trebuchet MS',
  'Palatino',
  'Garamond',
  'Comic Sans MS',
  'Impact',
  'Lucida Console',
  'Tahoma',
  'Geneva',
] as const;

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96] as const;
