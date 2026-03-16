import { useAppSelector } from '../../../hooks/reduxHooks';
import Modal from '../../../components/common/Modal';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

interface ViewEmployeeModalProps {
  open: boolean;
  employeeId: string | null;
  onClose: () => void;
}

const ViewEmployeeModal = ({
  open,
  employeeId,
  onClose,
}: ViewEmployeeModalProps) => {
  const { employees } = useAppSelector((s) => s.employee);

  if (!employeeId) return null;

  const employee = employees.find((e) => e.employee_id === employeeId);
  if (!employee) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Employee Details"
      actions={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="detail-row">
        <span className="detail-label">Employee ID</span>
        <span>{employee.employee_id}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Name</span>
        <span>{`${employee.first_name} ${employee.last_name}`}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Email</span>
        <span>{employee.emp_email}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Designation</span>
        <span>{employee.designation}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Status</span>
        <Badge variant={employee.is_active ? 'active' : 'inactive'}>
          {employee.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <div className="detail-row">
        <span className="detail-label">Created At</span>
        <span>
          {employee.created_at
            ? new Date(employee.created_at).toLocaleString()
            : '—'}
        </span>
      </div>
    </Modal>
  );
};

export default ViewEmployeeModal;

