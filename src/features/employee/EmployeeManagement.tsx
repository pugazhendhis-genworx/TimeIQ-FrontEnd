/* ──────────────────────────────────────────────
 *  Employee Management page (operation executive)
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchEmployeesThunk,
  deleteEmployeeThunk,
} from './employeeSlice';
import { createAssignmentThunk } from '../assignment/assignmentSlice';
import { fetchClientsThunk } from '../client/clientSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { toast } from '../../utils/toast';
import AddEmployeeModal from './components/AddEmployeeModal';
import ViewEmployeeModal from './components/ViewEmployeeModal';
import Modal from '../../components/common/Modal';

const EmployeeManagement = () => {
  const dispatch = useAppDispatch();
  const { employees, employeesLoading } = useAppSelector(
    (s) => s.employee,
  );
  const { clients } = useAppSelector((s) => s.client);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewEmployeeId, setViewEmployeeId] = useState<string | null>(null);

  /* ── Assignment Modal State ──────────────── */
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [regularRate, setRegularRate] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [doubleTimeRate, setDoubleTimeRate] = useState('');

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
    dispatch(fetchClientsThunk());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let result = employees;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => {
        const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
        return (
          fullName.includes(q) ||
          e.emp_email.toLowerCase().includes(q)
        );
      });
    }
    if (statusFilter) {
      const isActive = statusFilter === 'ACTIVE';
      result = result.filter((e) => e.is_active === isActive);
    }
    // No client filter on employee yet – backend schema does not link employees to clients
    return result;
  }, [employees, search, statusFilter]);

  const handleDelete = async (employeeId: string) => {
    try {
      await dispatch(deleteEmployeeThunk(employeeId)).unwrap();
      toast('Employee removed successfully');
      // Force refresh to ensure clean state
      dispatch(fetchEmployeesThunk());
    } catch {
      toast('Failed to remove employee', 'error');
    }
  };

  const openAssignModal = (empId: string, empName: string) => {
    setSelectedEmployeeId(empId);
    setSelectedEmployeeName(empName);
    setSelectedClientId('');
    setStartDate('');
    setEndDate('');
    setRegularRate('');
    setOvertimeRate('');
    setDoubleTimeRate('');
    setAssignOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedClientId) {
      toast('Please select a client', 'error');
      return;
    }
    if (!startDate || !endDate || !regularRate || !overtimeRate || !doubleTimeRate) {
      toast('Please fill in all date and rate fields', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to assign ${selectedEmployeeName} to this client?`)) {
      return;
    }
    try {
      await dispatch(
        createAssignmentThunk({
          employee_id: selectedEmployeeId,
          client_id: selectedClientId,
          start_date: startDate,
          end_date: endDate,
          regular_rate: parseFloat(regularRate),
          overtime_rate: parseFloat(overtimeRate),
          double_time_rate: parseFloat(doubleTimeRate),
        }),
      ).unwrap();
      toast('Employee assigned successfully');
      setAssignOpen(false);
      dispatch(fetchEmployeesThunk());
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast('Failed to create assignment', 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">Employee Management</h3>
        <Button className="btn--sm" onClick={() => setAddModalOpen(true)}>
          + Add Employee
        </Button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input
            className="table-toolbar__input"
            type="text"
            placeholder="Search by name, code or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="table-toolbar__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <select
            className="table-toolbar__select"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.client_id} value={c.client_id}>
                {c.client_name}
              </option>
            ))}
          </select>
        </div>

        {employeesLoading ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            Loading employees…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data">
                    No employees match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.employee_id}>
                    <td>{`${e.first_name} ${e.last_name}`}</td>
                    <td>{e.emp_email}</td>
                    <td>{e.designation}</td>
                    <td>
                      <Badge variant={e.is_active ? 'active' : 'inactive'}>
                        {e.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={e.assigned ? 'matched' : 'employee_unmatched'}>
                        {e.assigned ? 'Assigned' : 'Unassigned'}
                      </Badge>
                    </td>
                    <td
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Button
                          variant="secondary"
                          className="btn--sm"
                          onClick={() => openAssignModal(e.employee_id, `${e.first_name} ${e.last_name}`)}
                        >
                          {e.assigned ? 'Reassign' : 'Assign'}
                        </Button>
                        <Button
                          variant="ghost"
                          className="btn--sm"
                          onClick={() => setViewEmployeeId(e.employee_id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="danger"
                          className="btn--sm"
                          onClick={() => handleDelete(e.employee_id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <AddEmployeeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      <ViewEmployeeModal
        open={Boolean(viewEmployeeId)}
        employeeId={viewEmployeeId}
        onClose={() => setViewEmployeeId(null)}
      />

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Employee"
        actions={
          <>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button className="btn--sm" onClick={handleAssignSubmit}>
              Confirm Assignment
            </Button>
          </>
        }
      >
        <div className="detail-row">
          <span className="detail-label">Employee</span>
          <span style={{ fontWeight: 600 }}>{selectedEmployeeName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Select Client</span>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">-- Select Client --</option>
            {clients.map((c) => (
              <option key={c.client_id} value={c.client_id}>
                {c.client_name}
              </option>
            ))}
          </select>
        </div>
        <div className="detail-row">
          <span className="detail-label">Start Date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Regular Rate ($/hr)</span>
          <input
            type="number"
            step="0.01"
            value={regularRate}
            onChange={(e) => setRegularRate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Overtime Rate ($/hr)</span>
          <input
            type="number"
            step="0.01"
            value={overtimeRate}
            onChange={(e) => setOvertimeRate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Double Time Rate ($/hr)</span>
          <input
            type="number"
            step="0.01"
            value={doubleTimeRate}
            onChange={(e) => setDoubleTimeRate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </Modal>
    </>
  );
};

export default EmployeeManagement;

