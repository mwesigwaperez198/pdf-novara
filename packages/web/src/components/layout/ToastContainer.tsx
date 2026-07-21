import { useUIStore } from '../../store/useUIStore';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
} as const;

const COLORS = {
  success: 'bg-emerald-900/90 border-emerald-600/50 text-emerald-200',
  error: 'bg-red-900/90 border-red-600/50 text-red-200',
  warning: 'bg-amber-900/90 border-amber-600/50 text-amber-200',
  info: 'bg-surface-800/90 border-surface-600/50 text-surface-200',
} as const;

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border shadow-lg backdrop-blur-sm
                        animate-fade-in min-w-[280px] ${COLORS[toast.type]}`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="text-sm flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
