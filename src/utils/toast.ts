/* ──────────────────────────────────────────────
 *  Lightweight toast notification system
 *  Pub/sub pattern — no Redux or Context needed
 * ────────────────────────────────────────────── */
import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;

let listeners: Listener[] = [];
let toasts: ToastItem[] = [];
let nextId = 1;

function emit() {
  listeners.forEach((fn) => fn([...toasts]));
}

/**
 * Show a toast notification.
 * Auto-dismisses after 3.5 seconds.
 */
export function toast(message: string, type: ToastType = 'success') {
  const id = String(nextId++);
  toasts = [...toasts, { id, message, type }];
  emit();
  setTimeout(() => removeToast(id), 3500);
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/**
 * React hook – subscribes to the toast list.
 */
export function useToasts(): ToastItem[] {
  const [state, setState] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    const listener: Listener = (next) => setState(next);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return state;
}
