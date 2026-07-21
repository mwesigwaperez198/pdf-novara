import { create } from 'zustand';
import type { ToolType, ToolOptions } from '../core/types/editor';
import { DEFAULT_TOOL_OPTIONS } from '../core/types/editor';

interface EditorState {
  activeTool: ToolType;
  toolOptions: ToolOptions;
  selectedElements: string[];
  isEditing: boolean;
  isPanning: boolean;
  cursorPosition: { x: number; y: number } | null;

  setTool: (tool: ToolType) => void;
  updateToolOptions: (updates: Partial<ToolOptions>) => void;
  selectElement: (id: string) => void;
  deselectElement: (id: string) => void;
  clearSelection: () => void;
  setIsEditing: (editing: boolean) => void;
  setIsPanning: (panning: boolean) => void;
  setCursorPosition: (pos: { x: number; y: number } | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeTool: 'select',
  toolOptions: { ...DEFAULT_TOOL_OPTIONS },
  selectedElements: [],
  isEditing: false,
  isPanning: false,
  cursorPosition: null,

  setTool: (tool: ToolType) => set({ activeTool: tool, selectedElements: [], isEditing: false }),

  updateToolOptions: (updates) =>
    set((state) => ({
      toolOptions: { ...state.toolOptions, ...updates },
    })),

  selectElement: (id: string) =>
    set((state) => ({
      selectedElements: [...state.selectedElements, id],
    })),

  deselectElement: (id: string) =>
    set((state) => ({
      selectedElements: state.selectedElements.filter((e) => e !== id),
    })),

  clearSelection: () => set({ selectedElements: [] }),

  setIsEditing: (editing: boolean) => set({ isEditing: editing }),
  setIsPanning: (panning: boolean) => set({ isPanning: panning }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
}));
