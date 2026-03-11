/* ──────────────────────────────────────────────
 *  Employee Management page (operation executive)
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchEmployeesThunk,
  deleteEmployeeThunk,
} from './employeeSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { toast } from '../../utils/toast';
import AddEmployeeModal from '../../components/employee/AddEmployeeModal';
import ViewEmployeeModal from '../../components/employee/ViewEmployeeModal';

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
  const [viewEmployeeId, setViewEmployeeId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
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
                    <td
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        className="btn--sm"
                        onClick={() => setViewEmployeeId(e.employee_id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        className="btn--sm"
                        onClick={() => handleDelete(e.employee_id)}
                      >
                        Remove
                      </Button>
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
    </>
  );
};

export default EmployeeManagement;

