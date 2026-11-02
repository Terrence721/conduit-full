import { useEffect, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      const toast: Toast = { id: Date.now() + Math.random(), message };
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 4000);
    };

    window.addEventListener("conduit:toast", handler);
    return () => window.removeEventListener("conduit:toast", handler);
  }, []);

  return (
    <>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className="toast" key={toast.id} role="status">
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}

export default ToastProvider;
