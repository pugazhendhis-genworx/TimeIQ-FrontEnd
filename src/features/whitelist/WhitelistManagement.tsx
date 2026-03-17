/* ──────────────────────────────────────────────
 *  Email Whitelist Management page (operation executive)
 * ────────────────────────────────────────────── */
import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchWhitelistsThunk } from './whitelistSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import AddWhitelistModal from './components/AddWhitelistModal';

const WhitelistManagement = () => {
  const dispatch = useAppDispatch();
  const { whitelists, whitelistsLoading } = useAppSelector((s) => s.whitelist);
  const { clients } = useAppSelector((s) => s.client);

  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchWhitelistsThunk());
  }, [dispatch]);

  /* ── Build a client lookup map ─────────────── */
  const clientMap = useMemo(() => {
    const map: Record<string, { name: string; code: string }> = {};
    clients.forEach((c) => {
      map[c.client_id] = { name: c.client_name, code: c.client_code };
    });
    return map;
  }, [clients]);

  /* ── Unique client list for the filter dropdown ── */
  const clientsInWhitelist = useMemo(() => {
    const ids = Array.from(new Set(whitelists.map((w) => w.client_id)));
    return ids
      .map((id) => ({
        id,
        name: clientMap[id]?.name ?? id,
        code: clientMap[id]?.code ?? '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [whitelists, clientMap]);

  /* ── Filtered list ─────────────────────────── */
  const filtered = useMemo(() => {
    let result = whitelists;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((w) => {
        const cName = clientMap[w.client_id]?.name?.toLowerCase() ?? '';
        const cCode = clientMap[w.client_id]?.code?.toLowerCase() ?? '';
        return (
          w.allowed_email.toLowerCase().includes(q) ||
          cName.includes(q) ||
          cCode.includes(q)
        );
      });
    }

    if (clientFilter) {
      result = result.filter((w) => w.client_id === clientFilter);
    }

    if (statusFilter) {
      const isActive = statusFilter === 'ACTIVE';
      result = result.filter((w) => w.is_active === isActive);
    }

    return result;
  }, [whitelists, search, clientFilter, statusFilter, clientMap]);

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
        <h3 className="page-header__title">Email Whitelist</h3>
        <Button className="btn--sm" onClick={() => setAddModalOpen(true)}>
          + Add Email
        </Button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input
            className="table-toolbar__input"
            type="text"
            placeholder="Search by email, client name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="table-toolbar__select"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="">All Clients</option>
            {clientsInWhitelist.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.code ? ` (${c.code})` : ''}
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

        {whitelistsLoading ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            Loading whitelisted emails...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Client Code</th>
                <th>Whitelisted Email</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-data">
                    No whitelisted emails match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.email_whitelist_id}>
                    <td style={{ fontWeight: 600 }}>
                      {clientMap[w.client_id]?.name ?? '--'}
                    </td>
                    <td>
                      <span className="client-code-cell">
                        {clientMap[w.client_id]?.code ?? '--'}
                      </span>
                    </td>
                    <td>{w.allowed_email}</td>
                    <td>
                      <Badge variant={w.is_active ? 'active' : 'inactive'}>
                        {w.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {fmtDate(w.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <AddWhitelistModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </>
  );
};

export default WhitelistManagement;
