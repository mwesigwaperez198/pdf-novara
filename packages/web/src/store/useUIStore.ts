import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  sidebarOpen: boolean;
  sidebarTab: 'pages' | 'properties' | 'layers' | 'share';
  theme: 'light' | 'dark';
  dialogOpen: string | null;
  toasts: Toast[];

  toggleSidebar: () => void;
  setSidebarTab: (tab: UIState['sidebarTab']) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openDialog: (name: string) => void;
  closeDialog: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

let toastCounter = 0;

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarTab: 'pages',
  theme: 'dark',
  dialogOpen: null,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setTheme: (theme) => set({ theme }),
  openDialog: (name) => set({ dialogOpen: name }),
  closeDialog: () => set({ dialogOpen: null }),

  showToast: (message, type = 'info') => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
