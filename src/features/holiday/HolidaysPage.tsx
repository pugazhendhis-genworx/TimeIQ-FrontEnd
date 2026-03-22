/* ──────────────────────────────────────────────
 *  Client holidays – operation executive
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchClientsThunk } from '../client/clientSlice';
import {
  createHolidayApi,
  deleteHolidayApi,
  fetchHolidaysByClientApi,
} from './services/holidayService';
import type { Holiday } from './types/holiday.types';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { toast } from '../../utils/toast';

const HolidaysPage = () => {
  const dispatch = useAppDispatch();
  const { clients, clientsLoading } = useAppSelector((s) => s.client);

  const [clientId, setClientId] = useState('');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    dispatch(fetchClientsThunk());
  }, [dispatch]);

  const loadHolidays = async (cid: string) => {
    if (!cid) {
      setHolidays([]);
      return;
    }
    setLoading(true);
    try {
      const list = await fetchHolidaysByClientApi(cid);
      setHolidays(list);
    } catch {
      toast('Failed to load holidays', 'error');
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHolidays(clientId);
  }, [clientId]);

  const sorted = useMemo(() => {
    const copy = [...holidays];
    copy.sort((a, b) => {
      const da = new Date(a.holiday_date).getTime();
      const db = new Date(b.holiday_date).getTime();
      return sortAsc ? da - db : db - da;
    });
    return copy;
  }, [holidays, sortAsc]);

  const selectedClient = clients.find((c) => c.client_id === clientId);

  const handleAdd = async () => {
    if (!clientId || !name.trim() || !holidayDate) {
      toast('Select a client, name, and date', 'error');
      return;
    }
    try {
      await createHolidayApi({
        client_id: clientId,
        holiday_date: holidayDate,
        name: name.trim(),
        type: 'Client Holiday',
      });
      toast('Holiday added');
      setName('');
      setHolidayDate('');
      await loadHolidays(clientId);
    } catch {
      toast('Failed to add holiday', 'error');
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this holiday?')) return;
    try {
      await deleteHolidayApi(id);
      toast('Holiday removed');
      await loadHolidays(clientId);
    } catch {
      toast('Failed to remove holiday', 'error');
    }
  };

  return (
    <>
      <div className="page-header page-header--feature">
        <div>
          <h3 className="page-header__title">Holidays</h3>
          <p className="page-header__subtitle">
            Define client-specific holidays used by scheduling and payroll rules.
          </p>
        </div>
      </div>

      <div className="feature-surface feature-surface--pad">
        <label className="form-field form-field--grow" style={{ maxWidth: 420 }}>
          <span className="form-field__label">Client</span>
          <select
            className="table-toolbar__select"
            style={{ width: '100%' }}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={clientsLoading}
          >
            <option value="">Select a client…</option>
            {clients.map((c) => (
              <option key={c.client_id} value={c.client_id}>
                {c.client_name} ({c.client_code})
              </option>
            ))}
          </select>
        </label>

        {clientId && (
          <>
            <div
              className="table-toolbar table-toolbar--wrap"
              style={{ marginTop: '1.25rem', border: 'none', paddingLeft: 0 }}
            >
              <input
                className="table-toolbar__input"
                style={{ maxWidth: 280 }}
                placeholder="Holiday name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="date"
                className="table-toolbar__input"
                style={{ maxWidth: 200 }}
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
              />
              <Button variant="primary" className="btn--sm" onClick={handleAdd}>
                Add holiday
              </Button>
              <Button
                variant="ghost"
                className="btn--sm"
                onClick={() => setSortAsc((s) => !s)}
              >
                Date: {sortAsc ? 'oldest first' : 'newest first'}
              </Button>
            </div>

            <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
              {selectedClient?.client_name}
            </p>

            <div className="table-wrap" style={{ marginTop: '1rem' }}>
              {loading ? (
                <div className="no-data" style={{ padding: '2rem' }}>
                  Loading holidays…
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="no-data">
                          No holidays for this client.
                        </td>
                      </tr>
                    ) : (
                      sorted.map((h) => (
                        <tr key={h.id}>
                          <td>
                            {new Date(h.holiday_date).toLocaleDateString()}
                          </td>
                          <td>{h.name}</td>
                          <td>
                            <Badge variant="info">{h.type}</Badge>
                          </td>
                          <td>
                            <Button
                              variant="secondary"
                              className="btn--sm"
                              onClick={() => handleRemove(h.id)}
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
          </>
        )}

        {!clientId && (
          <p className="text-muted" style={{ marginTop: '1rem' }}>
            Choose a client to view and manage holidays.
          </p>
        )}
      </div>
    </>
  );
};

export default HolidaysPage;
