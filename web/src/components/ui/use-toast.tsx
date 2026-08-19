"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
type ToastItem = { id: number; type: ToastType; message: string };

const ToastContext = createContext<{
  toast: (type: ToastType, message: string) => void;
}>({ toast: () => {} });

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden />,
  error: <XCircle className="h-4 w-4 text-red-500" aria-hidden />,
  warning: <AlertCircle className="h-4 w-4 text-yellow-500" aria-hidden />,
  info: <Info className="h-4 w-4 text-blue-500" aria-hidden />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-black px-4 py-3 text-sm font-bold text-white shadow-2xl"
          >
            {ICONS[t.type]}
            <span>{t.message}</span>
            <button type="button"
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              className="text-gray-400 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const { toast } = useContext(ToastContext);
  return {
    toast: {
      success: (m: string) => toast("success", m),
      error: (m: string) => toast("error", m),
      warning: (m: string) => toast("warning", m),
      info: (m: string) => toast("info", m),
    },
  };
}