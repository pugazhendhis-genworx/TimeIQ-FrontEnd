/* ──────────────────────────────────────────────
 *  Client Management page (operation executive)
 * ────────────────────────────────────────────── */
import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchClientsThunk,
  toggleClientStatusThunk,
} from './clientSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import AddClientModal from './components/AddClientModal';
import { toast } from '../../utils/toast';

const ClientManagement = () => {
  const dispatch = useAppDispatch();
  const { clients, clientsLoading } = useAppSelector((s) => s.client);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchClientsThunk());
  }, [dispatch]);

  /* ── Filtered list ─────────────────────────── */
  const filtered = useMemo(() => {
    let result = clients;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.client_name.toLowerCase().includes(q) ||
          c.client_code.toLowerCase().includes(q) ||
          c.client_email.toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      const isActive = statusFilter === 'ACTIVE';
      result = result.filter((c) => c.is_active === isActive);
    }
    return result;
  }, [clients, search, statusFilter]);

  /* ── Toggle status handler ─────────────────── */
  const handleToggleStatus = async (clientId: string, currentlyActive: boolean) => {
    try {
      await dispatch(toggleClientStatusThunk(clientId)).unwrap();
      toast(
        `Client ${currentlyActive ? 'deactivated' : 'activated'} successfully`,
      );
    } catch {
      toast('Failed to update client status', 'error');
    }
  };

  /* ── Format date ───────────────────────────── */
  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">Client Management</h3>
        <Button className="btn--sm" onClick={() => setAddModalOpen(true)}>
          + Add Client
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
        </div>

        {clientsLoading ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            Loading clients…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Code</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data">
                    No clients match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.client_id}>
                    <td style={{ fontWeight: 600 }}>{c.client_name}</td>
                    <td>
                      <span className="client-code-cell">{c.client_code}</span>
                    </td>
                    <td>{c.client_email}</td>
                    <td>
                      <Badge variant={c.is_active ? 'active' : 'inactive'}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {fmtDate(c.created_at)}
                    </td>
                    <td>{c.created_by}</td>
                    <td>
                      <Button
                        variant={c.is_active ? 'secondary' : 'primary'}
                        className="btn--sm"
                        onClick={() =>
                          handleToggleStatus(c.client_id, c.is_active)
                        }
                      >
                        {c.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <AddClientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </>
  );
};

export default ClientManagement;
