/* ──────────────────────────────────────────────
 *  Add Client modal
 * ────────────────────────────────────────────── */
import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  createClientThunk,
  fetchClientsThunk,
} from '../../features/client/clientSlice';
import Modal from '../common/Modal';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { toast } from '../../utils/toast';

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
}

const AddClientModal = ({ open, onClose }: AddClientModalProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [clientName, setClientName] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = useCallback(() => {
    setClientName('');
    setClientCode('');
    setClientEmail('');
    setError('');
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');

    if (!clientName.trim() || !clientCode.trim() || !clientEmail.trim()) {
      setError('All fields are required.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        createClientThunk({
          client_name: clientName.trim(),
          client_code: clientCode.trim(),
          client_email: clientEmail.trim(),
          created_by: user?.user_name || user?.user_id || 'unknown',
        }),
      ).unwrap();
      toast('Client added successfully');
      handleClose();
      dispatch(fetchClientsThunk());
    } catch (err) {
      setError(String(err) || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Client"
      actions={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Add Client
          </Button>
        </>
      }
    >
      <InputField
        label="Client Name"
        type="text"
        placeholder="Acme Corporation"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        required
      />
      <InputField
        label="Client Code"
        type="text"
        placeholder="ACME-001"
        value={clientCode}
        onChange={(e) => setClientCode(e.target.value)}
        required
      />
      <InputField
        label="Client Email"
        type="email"
        placeholder="contact@acme.com"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
        required
      />

      {error && <p className="modal__error">{error}</p>}
    </Modal>
  );
};

export default AddClientModal;
