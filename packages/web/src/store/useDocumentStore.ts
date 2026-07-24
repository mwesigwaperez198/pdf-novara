import { create } from 'zustand';
import type { PDFDocument, DocumentTab, EditorOperation, PageObject } from '../core/types/document';
import { documentManager } from '../core/engine/DocumentManager';
import { generateId } from '../utils/format';

interface DocumentState {
  tabs: DocumentTab[];
  activeTabId: string | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  isLoading: boolean;
  error: string | null;
  textEdits: Record<string, Record<string, string>>;
  deletedTextIds: Record<string, Set<string>>;

  openFile: (file: File) => Promise<void>;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: (containerWidth: number, containerHeight: number) => void;
  addOperation: (op: EditorOperation) => void;
  undo: () => void;
  redo: () => void;
  addPageObject: (pageIndex: number, obj: Omit<PageObject, 'id'>) => void;
  updatePageObject: (pageIndex: number, objId: string, updates: Partial<PageObject>) => void;
  removePageObject: (pageIndex: number, objId: string) => void;
  editTextItem: (pageIndex: number, itemId: string, newText: string) => void;
  deleteTextItem: (pageIndex: number, itemId: string) => void;
  getActiveTab: () => DocumentTab | undefined;
  getActiveDocument: () => PDFDocument | undefined;
  clearError: () => void;
}

const ZOOM_LEVELS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 2.0, 3.0, 4.0];

export const useDocumentStore = create<DocumentState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  currentPage: 0,
  totalPages: 0,
  zoom: 1.0,
  isLoading: false,
  error: null,
  textEdits: {},
  deletedTextIds: {},

  openFile: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const doc = await documentManager.openFile(file);
      const tab: DocumentTab = {
        id: doc.id,
        document: doc,
        isDirty: false,
        undoStack: [],
        redoStack: [],
      };
      set((state) => ({
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
        totalPages: doc.pages.length,
        currentPage: 0,
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to open file',
      });
    }
  },

  closeTab: (id: string) => {
    documentManager.closeDocument(id);
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      const newActiveId = state.activeTabId === id
        ? (newTabs[0]?.id ?? null)
        : state.activeTabId;

      const activeDoc = newActiveId
        ? newTabs.find((t) => t.id === newActiveId)?.document
        : undefined;

      return {
        tabs: newTabs,
        activeTabId: newActiveId,
        totalPages: activeDoc?.pages.length ?? 0,
        currentPage: 0,
      };
    });
  },

  setActiveTab: (id: string) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (tab) {
      documentManager.setActiveDocument(id);
      set({
        activeTabId: id,
        totalPages: tab.document.pages.length,
        currentPage: 0,
      });
    }
  },

  setCurrentPage: (page: number) => {
    const { totalPages } = get();
    if (page >= 0 && page < totalPages) {
      set({ currentPage: page });
    }
  },

  setZoom: (zoom: number) => {
    const clamped = Math.min(Math.max(zoom, 0.1), 5.0);
    set({ zoom: clamped });
  },

  zoomIn: () => {
    const { zoom } = get();
    const nextLevel = ZOOM_LEVELS.find((z) => z > zoom);
    if (nextLevel) set({ zoom: nextLevel });
  },

  zoomOut: () => {
    const { zoom } = get();
    const prevLevel = [...ZOOM_LEVELS].reverse().find((z) => z < zoom);
    if (prevLevel) set({ zoom: prevLevel });
  },

  zoomFit: (containerWidth: number, containerHeight: number) => {
    const doc = get().getActiveDocument();
    if (!doc) return;
    const page = doc.pages[get().currentPage];
    if (!page) return;

    const scaleX = (containerWidth - 40) / page.width;
    const scaleY = (containerHeight - 40) / page.height;
    const fitZoom = Math.min(scaleX, scaleY, 2.0);
    set({ zoom: Math.round(fitZoom * 100) / 100 });
  },

  addOperation: (op: EditorOperation) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === state.activeTabId
          ? {
              ...tab,
              isDirty: true,
              undoStack: [...tab.undoStack, op],
              redoStack: [],
            }
          : tab
      ),
    }));
  },

  undo: () => {
    set((state) => {
      const tab = state.tabs.find((t) => t.id === state.activeTabId);
      if (!tab || tab.undoStack.length === 0) return state;

      const newUndo = [...tab.undoStack];
      const op = newUndo.pop()!;

      return {
        tabs: state.tabs.map((t) =>
          t.id === state.activeTabId
            ? { ...t, undoStack: newUndo, redoStack: [...t.redoStack, op] }
            : t
        ),
      };
    });
  },

  redo: () => {
    set((state) => {
      const tab = state.tabs.find((t) => t.id === state.activeTabId);
      if (!tab || tab.redoStack.length === 0) return state;

      const newRedo = [...tab.redoStack];
      const op = newRedo.pop()!;

      return {
        tabs: state.tabs.map((t) =>
          t.id === state.activeTabId
            ? { ...t, undoStack: [...t.undoStack, op], redoStack: newRedo }
            : t
        ),
      };
    });
  },

  addPageObject: (pageIndex: number, obj: Omit<PageObject, 'id'>) => {
    const newObj: PageObject = { ...obj, id: generateId() };
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === state.activeTabId
          ? {
              ...tab,
              isDirty: true,
              document: {
                ...tab.document,
                pages: tab.document.pages.map((page) =>
                  page.index === pageIndex
                    ? { ...page, objects: [...page.objects, newObj] }
                    : page
                ),
              },
            }
          : tab
      ),
    }));
  },

  updatePageObject: (pageIndex: number, objId: string, updates: Partial<PageObject>) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === state.activeTabId
          ? {
              ...tab,
              isDirty: true,
              document: {
                ...tab.document,
                pages: tab.document.pages.map((page) =>
                  page.index === pageIndex
                    ? {
                        ...page,
                        objects: page.objects.map((obj) =>
                          obj.id === objId ? { ...obj, ...updates } : obj
                        ),
                      }
                    : page
                ),
              },
            }
          : tab
      ),
    }));
  },

  removePageObject: (pageIndex: number, objId: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === state.activeTabId
          ? {
              ...tab,
              isDirty: true,
              document: {
                ...tab.document,
                pages: tab.document.pages.map((page) =>
                  page.index === pageIndex
                    ? { ...page, objects: page.objects.filter((obj) => obj.id !== objId) }
                    : page
                ),
              },
            }
          : tab
      ),
    }));
  },

  editTextItem: (pageIndex: number, itemId: string, newText: string) => {
    set((state) => {
      const pageKey = `${state.activeTabId}-${pageIndex}`;
      return {
        textEdits: {
          ...state.textEdits,
          [pageKey]: {
            ...(state.textEdits[pageKey] ?? {}),
            [itemId]: newText,
          },
        },
      };
    });
  },

  deleteTextItem: (pageIndex: number, itemId: string) => {
    set((state) => {
      const pageKey = `${state.activeTabId}-${pageIndex}`;
      const existing = state.deletedTextIds[pageKey] ?? new Set<string>();
      const newSet = new Set(existing);
      newSet.add(itemId);
      return {
        deletedTextIds: {
          ...state.deletedTextIds,
          [pageKey]: newSet,
        },
      };
    });
  },

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((t) => t.id === activeTabId);
  },

  getActiveDocument: () => {
    const tab = get().getActiveTab();
    return tab?.document;
  },

  clearError: () => set({ error: null }),
}));
