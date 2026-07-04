import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { ToastMessage } from "../utils/toast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<Omit<ToastMessage, "id"> & { id?: string }>;
      const { message, type } = customEvent.detail;
      const id = customEvent.detail.id || Math.random().toString(36).substring(2, 9);
      
      setToasts((prev) => [...prev, { message, type, id }]);

      // Auto remove after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    };

    window.addEventListener("app-toast", handleToast);
    return () => {
      window.removeEventListener("app-toast", handleToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
        let bgClass = "bg-white border-blue-100 text-slate-800";
        let progressClass = "bg-blue-500";

        if (toast.type === "success") {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          bgClass = "bg-white border-emerald-100 text-slate-800 shadow-md";
          progressClass = "bg-emerald-500";
        } else if (toast.type === "error") {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          bgClass = "bg-white border-rose-100 text-slate-800 shadow-md";
          progressClass = "bg-rose-500";
        } else if (toast.type === "warning") {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
          bgClass = "bg-white border-amber-100 text-slate-800 shadow-md";
          progressClass = "bg-amber-500";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 animate-fade-in ${bgClass} relative overflow-hidden`}
            role="alert"
            id={`toast-${toast.id}`}
          >
            {icon}
            <div className="flex-1 text-xs font-semibold leading-relaxed pr-2">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {/* Elegant tiny bottom progress animation bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100/50">
              <div className={`h-full ${progressClass} animate-toast-progress`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
