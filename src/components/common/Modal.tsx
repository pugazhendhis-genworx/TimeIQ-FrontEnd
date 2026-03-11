/* ──────────────────────────────────────────────
 *  Reusable Modal component with overlay
 * ────────────────────────────────────────────── */
import { useEffect, useCallback, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  /** 'md' (default 480px) | 'lg' (720px) | 'xl' (960px) */
  size?: 'md' | 'lg' | 'xl';
}

const sizeClass: Record<string, string> = {
  md: '',
  lg: 'modal--lg',
  xl: 'modal--xl',
};

const Modal = ({ open, onClose, title, children, actions, size = 'md' }: ModalProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`modal ${sizeClass[size]}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">{title}</h3>
        {children}
        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
