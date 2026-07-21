import type { ToolType, ToolOptions } from './document';

export type { ToolType, ToolOptions };

export interface EditorState {
  activeTool: ToolType;
  toolOptions: ToolOptions;
  selectedElements: string[];
  isEditing: boolean;
  isPanning: boolean;
  cursorPosition: { x: number; y: number } | null;
}

export interface TextEditState {
  elementId: string;
  pageIndex: number;
  originalText: string;
  currentText: string;
  cursorStart: number;
  cursorEnd: number;
  fontStyle: {
    fontSize: number;
    fontFamily: string;
    fontWeight: number;
    color: string;
  };
}

export interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  points: { x: number; y: number }[];
}

export interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export interface CanvasTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_TOOL_OPTIONS: ToolOptions = {
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 2,
  fontSize: 16,
  fontFamily: 'Inter',
  fontWeight: 400,
  opacity: 1,
  shapeType: 'rectangle',
};

export const ZOOM_LEVELS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 2.0, 3.0, 4.0] as const;

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5.0;
export const ZOOM_STEP = 0.1;
export const PAGE_GAP = 20;
