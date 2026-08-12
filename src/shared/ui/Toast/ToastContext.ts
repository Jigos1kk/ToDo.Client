import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

export interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast должен использоваться внутри <ToastProvider>');
  }
  return context;
}
