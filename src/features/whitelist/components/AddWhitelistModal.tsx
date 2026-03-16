/* ──────────────────────────────────────────────
 *  Add Whitelisted Email modal
 *  Lets the user pick a client and enter an email
 * ────────────────────────────────────────────── */
import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import {
  createWhitelistThunk,
  fetchWhitelistsThunk,
} from '../whitelistSlice';
import Modal from '../../../components/common/Modal';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import { toast } from '../../../utils/toast';

interface AddWhitelistModalProps {
  open: boolean;
  onClose: () => void;
}

const AddWhitelistModal = ({ open, onClose }: AddWhitelistModalProps) => {
  const dispatch = useAppDispatch();
  const { clients } = useAppSelector((s) => s.client);

  const [clientId, setClientId] = useState('');
  const [allowedEmail, setAllowedEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = useCallback(() => {
    setClientId('');
    setAllowedEmail('');
    setError('');
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');

    if (!clientId || !allowedEmail.trim()) {
      setError('Please select a client and enter an email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(allowedEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        createWhitelistThunk({
          client_id: clientId,
          allowed_email: allowedEmail.trim(),
        }),
      ).unwrap();
      toast('Email whitelisted successfully');
      handleClose();
      dispatch(fetchWhitelistsThunk());
    } catch (err) {
      setError(String(err) || 'Failed to whitelist email');
    } finally {
      setLoading(false);
    }
  };

  /* Only show active clients in the dropdown */
  const activeClients = clients.filter((c) => c.is_active);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Whitelisted Email"
      actions={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Add Email
          </Button>
        </>
      }
    >
      {/* Client selector */}
      <div className="input-field">
        <label htmlFor="wl-client" className="input-field__label">
          Client <span className="input-field__required">*</span>
        </label>
        <div className="input-field__wrapper">
          <select
            id="wl-client"
            className="input-field__input"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">-- Select a client --</option>
            {activeClients.map((c) => (
              <option key={c.client_id} value={c.client_id}>
                {c.client_name} ({c.client_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <InputField
        label="Email Address"
        type="email"
        placeholder="user@example.com"
        value={allowedEmail}
        onChange={(e) => setAllowedEmail(e.target.value)}
        required
      />

      {error && <p className="modal__error">{error}</p>}
    </Modal>
  );
};

export default AddWhitelistModal;
