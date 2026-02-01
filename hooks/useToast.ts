import { useToastStore } from '@/store/toast-store';

export const useToast = () => {
  const { addToast, removeToast, clear } = useToastStore();

  const success = (message: string, title?: string, duration?: number) => {
    addToast({ type: 'success', message, title, duration });
  };

  const error = (message: string, title?: string, duration?: number) => {
    addToast({ type: 'error', message, title, duration });
  };

  const warning = (message: string, title?: string, duration?: number) => {
    addToast({ type: 'warning', message, title, duration });
  };

  const info = (message: string, title?: string, duration?: number) => {
    addToast({ type: 'info', message, title, duration });
  };

  return {
    success,
    error,
    warning,
    info,
    remove: removeToast,
    clear,
  };
};
