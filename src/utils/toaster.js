const listeners = new Set();

const notify = (toast) => {
  listeners.forEach((listener) => listener(toast));
};

export const pushToast = ({ message, type = 'info', duration = 3500 }) => {
  if (!message) return;

  notify({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    type,
    duration,
  });
};

export const subscribeToToasts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const TOAST_TYPES = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

export default {
  pushToast,
  subscribeToToasts,
  TOAST_TYPES,
};
