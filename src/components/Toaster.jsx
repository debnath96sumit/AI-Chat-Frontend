import { useEffect, useState } from 'react';
import { subscribeToToasts } from '../utils/toaster';

const toastStyles = {
  success: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-500',
  info: 'border-sky-500/60 bg-sky-500/15 text-sky-500',
  warning: 'border-amber-500/60 bg-amber-500/15 text-amber-500',
  error: 'border-red-500/60 bg-red-500/15 text-red-500',
};

function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, toast.duration);
    });

    return unsubscribe;
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-sm ${toastStyles[toast.type] || toastStyles.info}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default Toaster;
