/* ──────────────────────────────────────────────
 *  Client rules – select client, manage rules
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchClientsThunk } from '../client/clientSlice';
import {
  createClientRuleApi,
  fetchClientRulesApi,
  fetchClientRulesByStatusApi,
  updateClientRuleApi,
} from './services/clientRuleService';
import type { ClientRule, RuleConfig } from './types/clientRule.types';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { toast } from '../../utils/toast';

const defaultConfig = (): RuleConfig => ({
  ot_threshold: 8,
  dt_threshold: 12,
  reg_markup_rate: 1,
  ot_markup_rate: 1.5,
  dt_markup_rate: 2,
  reg_pay: 0,
  ot_pay: 0,
  dt_pay: 0,
  holiday_pay: 0,
});

const ClientRulesPage = () => {
  const dispatch = useAppDispatch();
  const { clients, clientsLoading } = useAppSelector((s) => s.client);

  const [clientId, setClientId] = useState('');
  const [rules, setRules] = useState<ClientRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  );
  const [sortBy, setSortBy] = useState<'created' | 'type'>('created');

  const [addOpen, setAddOpen] = useState(false);
  const [editRule, setEditRule] = useState<ClientRule | null>(null);
  const [viewRule, setViewRule] = useState<ClientRule | null>(null);
  const [draftConfig, setDraftConfig] = useState<RuleConfig>(defaultConfig());

  useEffect(() => {
    dispatch(fetchClientsThunk());
  }, [dispatch]);

  const loadRules = async (cid: string) => {
    if (!cid) {
      setRules([]);
      return;
    }
    setRulesLoading(true);
    try {
      let list: ClientRule[];
      if (statusFilter === 'active') {
        list = await fetchClientRulesByStatusApi(cid, true);
      } else if (statusFilter === 'inactive') {
        list = await fetchClientRulesByStatusApi(cid, false);
      } else {
        list = await fetchClientRulesApi(cid);
      }
      setRules(list);
    } catch {
      toast('Failed to load client rules', 'error');
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) void loadRules(clientId);
    else setRules([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filter changes
  }, [clientId, statusFilter]);

  const sortedRules = useMemo(() => {
    const copy = [...rules];
    copy.sort((a, b) => {
      if (sortBy === 'type') {
        return a.rule_type.localeCompare(b.rule_type);
      }
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
    return copy;
  }, [rules, sortBy]);

  const selectedClient = clients.find((c) => c.client_id === clientId);

  const handleCreate = async () => {
    if (!clientId) return;
    try {
      await createClientRuleApi({
        client_id: clientId,
        rule_type: 'TIMESHEET_CALCULATION',
        rule_config: draftConfig,
      });
      toast('Rule created');
      setAddOpen(false);
      setDraftConfig(defaultConfig());
      await loadRules(clientId);
    } catch {
      toast('Failed to create rule', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!editRule) return;
    try {
      await updateClientRuleApi(editRule.rule_id, { rule_config: draftConfig });
      toast('Rule updated');
      setEditRule(null);
      await loadRules(clientId);
    } catch {
      toast('Failed to update rule', 'error');
    }
  };

  const handleDeactivate = async (rule: ClientRule) => {
    if (!window.confirm('Make this rule inactive?')) return;
    try {
      await updateClientRuleApi(rule.rule_id, { is_active: false });
      toast('Rule deactivated');
      await loadRules(clientId);
    } catch {
      toast('Failed to update rule', 'error');
    }
  };

  const openEdit = (rule: ClientRule) => {
    setDraftConfig({ ...rule.rule_config });
    setEditRule(rule);
  };

  const openAdd = () => {
    setDraftConfig(defaultConfig());
    setAddOpen(true);
  };

  const configField = (
    label: string,
    key: keyof RuleConfig,
    step = 0.01,
  ) => (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      <input
        type="number"
        step={step}
        className="table-toolbar__input"
        value={draftConfig[key]}
        onChange={(e) =>
          setDraftConfig((c) => ({ ...c, [key]: parseFloat(e.target.value) || 0 }))
        }
      />
    </label>
  );

  return (
    <>
      <div className="page-header page-header--feature">
        <div>
          <h3 className="page-header__title">Client rules</h3>
          <p className="page-header__subtitle">
            Select a client to view calculation rules. Add rules, edit configuration, or
            deactivate when no longer needed.
          </p>
        </div>
      </div>

      <div className="feature-surface feature-surface--pad">
        <div className="form-row">
          <label className="form-field form-field--grow">
            <span className="form-field__label">Client</span>
            <select
              className="table-toolbar__select"
              style={{ width: '100%', maxWidth: 420 }}
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
        </div>

        {!clientId ? (
          <p className="text-muted" style={{ marginTop: '1rem' }}>
            Choose a client to load its rules.
          </p>
        ) : (
          <>
            <div
              className="table-toolbar table-toolbar--wrap"
              style={{ marginTop: '1.25rem' }}
            >
              <Button variant="primary" className="btn--sm" onClick={openAdd}>
                + Add client rule
              </Button>
              <select
                className="table-toolbar__select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
                }
              >
                <option value="all">All rules</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
              <select
                className="table-toolbar__select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created' | 'type')}
              >
                <option value="created">Sort: newest</option>
                <option value="type">Sort: rule type</option>
              </select>
            </div>

            <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
              {selectedClient?.client_name}
            </p>

            <div className="table-wrap" style={{ marginTop: '1rem' }}>
              {rulesLoading ? (
                <div className="no-data" style={{ padding: '2rem' }}>
                  Loading rules…
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Reg pay</th>
                      <th>OT pay</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRules.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="no-data">
                          No rules for this filter.
                        </td>
                      </tr>
                    ) : (
                      sortedRules.map((r) => (
                        <tr key={r.rule_id}>
                          <td>
                            <span className="client-code-cell">{r.rule_type}</span>
                          </td>
                          <td>
                            <Badge variant={r.is_active ? 'active' : 'inactive'}>
                              {r.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>{r.rule_config.reg_pay}</td>
                          <td>{r.rule_config.ot_pay}</td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {r.created_at
                              ? new Date(r.created_at).toLocaleDateString()
                              : '—'}
                          </td>
                          <td>
                            <div className="action-row">
                              <Button
                                variant="ghost"
                                className="btn--sm"
                                onClick={() => setViewRule(r)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                className="btn--sm"
                                onClick={() => openEdit(r)}
                                disabled={!r.is_active}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="secondary"
                                className="btn--sm"
                                onClick={() => handleDeactivate(r)}
                                disabled={!r.is_active}
                              >
                                Make inactive
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
          </>
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add client rule"
        size="lg"
        actions={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Create
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
          TIMESHEET_CALCULATION — thresholds and pay rates used by the rule engine.
        </p>
        <div className="rule-config-grid">
          {configField('OT threshold (h)', 'ot_threshold', 0.25)}
          {configField('DT threshold (h)', 'dt_threshold', 0.25)}
          {configField('Reg markup', 'reg_markup_rate')}
          {configField('OT markup', 'ot_markup_rate')}
          {configField('DT markup', 'dt_markup_rate')}
          {configField('Reg pay', 'reg_pay')}
          {configField('OT pay', 'ot_pay')}
          {configField('DT pay', 'dt_pay')}
          {configField('Holiday pay', 'holiday_pay')}
        </div>
      </Modal>

      <Modal
        open={!!viewRule}
        onClose={() => setViewRule(null)}
        title="Rule configuration"
        size="md"
        actions={
          <Button variant="ghost" onClick={() => setViewRule(null)}>
            Close
          </Button>
        }
      >
        {viewRule && (
          <pre className="config-json-preview">
            {JSON.stringify(viewRule.rule_config, null, 2)}
          </pre>
        )}
      </Modal>

      <Modal
        open={!!editRule}
        onClose={() => setEditRule(null)}
        title="Edit rule configuration"
        size="lg"
        actions={
          <>
            <Button variant="ghost" onClick={() => setEditRule(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Save
            </Button>
          </>
        }
      >
        <div className="rule-config-grid">
          {configField('OT threshold (h)', 'ot_threshold', 0.25)}
          {configField('DT threshold (h)', 'dt_threshold', 0.25)}
          {configField('Reg markup', 'reg_markup_rate')}
          {configField('OT markup', 'ot_markup_rate')}
          {configField('DT markup', 'dt_markup_rate')}
          {configField('Reg pay', 'reg_pay')}
          {configField('OT pay', 'ot_pay')}
          {configField('DT pay', 'dt_pay')}
          {configField('Holiday pay', 'holiday_pay')}
        </div>
      </Modal>
    </>
  );
};

export default ClientRulesPage;
