import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import { createEmployeeThunk, fetchEmployeesThunk } from '../employeeSlice';
import Modal from '../../../components/common/Modal';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import { toast } from '../../../utils/toast';

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
}

const AddEmployeeModal = ({ open, onClose }: AddEmployeeModalProps) => {
  const dispatch = useAppDispatch();
  useAppSelector((s) => s.client); // kept for potential future client association

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [designation, setDesignation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = useCallback(() => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setDob('');
    setDesignation('');
    setError('');
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !dob.trim() || !designation.trim()) {
      setError('First name, last name, email, date of birth and designation are required.');
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        createEmployeeThunk({
          emp_email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          dob,
          designation: designation.trim(),
        }),
      ).unwrap();
      toast('Employee created successfully');
      handleClose();
      dispatch(fetchEmployeesThunk());
    } catch (err) {
      setError(String(err) || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Employee"
      actions={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Employee
          </Button>
        </>
      }
    >
      <InputField
        label="First Name"
        type="text"
        placeholder="Jane"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <InputField
        label="Last Name"
        type="text"
        placeholder="Doe"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <InputField
        label="Email"
        type="email"
        placeholder="jane@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <InputField
        label="Date of Birth"
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        required
      />
      <InputField
        label="Designation"
        type="text"
        placeholder="Software Engineer"
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
      />
      {error && <p className="modal__error">{error}</p>}
    </Modal>
  );
};

export default AddEmployeeModal;

