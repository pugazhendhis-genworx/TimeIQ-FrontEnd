/* ──────────────────────────────────────────────
 *  Add User modal
 * ────────────────────────────────────────────── */
import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { createUserThunk, fetchUsersThunk } from '../../features/dashboard/dashboardSlice';
import Modal from '../common/Modal';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { toast } from '../../utils/toast';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

const AddUserModal = ({ open, onClose }: AddUserModalProps) => {
  const dispatch = useAppDispatch();
  const { roles } = useAppSelector((s) => s.dashboard);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setContactNo('');
    setPassword('');
    setRoleName('');
    setError('');
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');

    if (!name.trim() || !email.trim() || !password || !roleName) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        createUserThunk({
          name: name.trim(),
          email: email.trim(),
          contact_no: contactNo.trim(),
          password,
          role_name: roleName,
        }),
      ).unwrap();
      toast('User created successfully');
      handleClose();
      dispatch(fetchUsersThunk());
    } catch (err) {
      setError(String(err) || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New User"
      actions={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create User
          </Button>
        </>
      }
    >
      <InputField
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <InputField
        label="Email"
        type="email"
        placeholder="john@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <InputField
        label="Contact Number"
        type="text"
        placeholder="+1 234 567 890"
        value={contactNo}
        onChange={(e) => setContactNo(e.target.value)}
      />
      <InputField
        label="Password"
        type="password"
        placeholder="Min 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="input-field">
        <label className="input-field__label" htmlFor="new-user-role">
          Role
        </label>
        <div className="input-field__wrapper">
          <select
            id="new-user-role"
            className="input-field__input"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          >
            <option value="">Select a role</option>
            {roles.map((r) => (
              <option key={r.role_id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="modal__error">{error}</p>}
    </Modal>
  );
};

export default AddUserModal;
