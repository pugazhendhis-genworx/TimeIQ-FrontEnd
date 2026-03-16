/* ──────────────────────────────────────────────
 *  User Management page (admin only)
 * ────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchUserByIdThunk } from './dashboardSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import AddUserModal from './components/AddUserModal';
import ViewUserModal from './components/ViewUserModal';
import { toast } from '../../utils/toast';

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { users, roles } = useAppSelector((s) => s.dashboard);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter) result = result.filter((u) => u.role === roleFilter);
    if (statusFilter) result = result.filter((u) => u.status === statusFilter);
    return result;
  }, [users, search, roleFilter, statusFilter]);

  const handleViewUser = async (userId: string) => {
    try {
      await dispatch(fetchUserByIdThunk(userId)).unwrap();
      setViewModalOpen(true);
    } catch {
      toast('Error loading user', 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">User Management</h3>
        <Button className="btn--sm" onClick={() => setAddModalOpen(true)}>
          + Add User
        </Button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input
            className="table-toolbar__input"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="table-toolbar__select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.role_id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            className="table-toolbar__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No users match your filters
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.user_id}>
                  <td
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {u.user_id}
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.contact_no || '—'}</td>
                  <td>
                    <Badge variant={u.role}>{u.role || '—'}</Badge>
                  </td>
                  <td>
                    <Badge variant={u.status}>{u.status}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      className="btn--sm"
                      onClick={() => handleViewUser(u.user_id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      <ViewUserModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />
    </>
  );
};

export default UserManagement;
