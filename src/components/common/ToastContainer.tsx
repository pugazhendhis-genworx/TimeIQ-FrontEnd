/* ──────────────────────────────────────────────
 *  Global toast notification renderer
 * ────────────────────────────────────────────── */
import { useToasts } from '../../utils/toast';

const ToastContainer = () => {
  const toasts = useToasts();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
