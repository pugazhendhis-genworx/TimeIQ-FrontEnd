/* ──────────────────────────────────────────────
 *  User Management page (admin only)
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchUserByIdThunk } from './dashboardSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import AddUserModal from './components/AddUserModal';
import ViewUserModal from './components/ViewUserModal';
import { toast } from '../../utils/toast';
import Pagination from '../../components/common/Pagination';

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { users, roles } = useAppSelector((s) => s.dashboard);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const pageSize = 10;
  const totalItems = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

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
                <td colSpan={6} className="no-data">
                  No users match your filters
                </td>
              </tr>
            ) : (
              paginated.map((u) => (
                <tr key={u.user_id}>
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

        <Pagination
          page={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
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
