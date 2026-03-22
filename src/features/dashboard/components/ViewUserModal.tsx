/* ──────────────────────────────────────────────
 *  View User Detail modal
 * ────────────────────────────────────────────── */
import { useAppSelector } from '../../../hooks/reduxHooks';
import Modal from '../../../components/common/Modal';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

interface ViewUserModalProps {
  open: boolean;
  onClose: () => void;
}

const ViewUserModal = ({ open, onClose }: ViewUserModalProps) => {
  const { selectedUser } = useAppSelector((s) => s.dashboard);

  if (!selectedUser) return null;

  const u = selectedUser;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="User Details"
      actions={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="detail-row">
        <span className="detail-label">Name</span>
        <span>{u.name}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Email</span>
        <span>{u.email}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Contact</span>
        <span>{u.contact_no || '—'}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Role</span>
        <Badge variant={u.role}>{u.role || '—'}</Badge>
      </div>
      <div className="detail-row">
        <span className="detail-label">Status</span>
        <Badge variant={u.status}>{u.status}</Badge>
      </div>
      <div className="detail-row">
        <span className="detail-label">Created</span>
        <span>
          {u.created_at ? new Date(u.created_at).toLocaleString() : '—'}
        </span>
      </div>
    </Modal>
  );
};

export default ViewUserModal;
