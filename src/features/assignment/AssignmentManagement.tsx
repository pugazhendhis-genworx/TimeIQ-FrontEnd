/* ──────────────────────────────────────────────
 *  Assignment Management page – operation executive
 * ────────────────────────────────────────────── */
import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
    fetchAssignmentsThunk,
    createAssignmentThunk,
    updateAssignmentThunk,
    deleteAssignmentThunk,
} from './assignmentSlice';
import { fetchEmployeesThunk } from '../employee/employeeSlice';
import { fetchClientsThunk } from '../client/clientSlice';
import { fetchPaycodesThunk } from '../paycode/paycodeSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { toast } from '../../utils/toast';
import type { Assignment } from '../../types/assignment.types';

const AssignmentManagement = () => {
    const dispatch = useAppDispatch();
    const { assignments, assignmentsLoading } = useAppSelector(
        (s) => s.assignment,
    );
    const { employees } = useAppSelector((s) => s.employee);
    const { clients } = useAppSelector((s) => s.client);
    const { paycodes } = useAppSelector((s) => s.paycode);
    const [search, setSearch] = useState('');

    /* ── Add modal state ───────────────────────── */
    const [addOpen, setAddOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [regularRate, setRegularRate] = useState('');
    const [overtimeRate, setOvertimeRate] = useState('');
    const [doubleTimeRate, setDoubleTimeRate] = useState('');

    /* ── Edit modal state ──────────────────────── */
    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Assignment | null>(null);
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [editRegularRate, setEditRegularRate] = useState('');
    const [editOvertimeRate, setEditOvertimeRate] = useState('');
    const [editDoubleTimeRate, setEditDoubleTimeRate] = useState('');
    const [editPaycodeId, setEditPaycodeId] = useState('');
    const [editIsActive, setEditIsActive] = useState(true);

    /* ── Delete confirm state ──────────────────── */
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

    const filtered = useMemo(() => {
        if (!search) return assignments;
        const q = search.toLowerCase();
        return assignments.filter(
            (a: Assignment) =>
                a.assignment_id.toLowerCase().includes(q) ||
                a.employee_id.toLowerCase().includes(q) ||
                a.client_id.toLowerCase().includes(q),
        );
    }, [assignments, search]);

    useEffect(() => {
        dispatch(fetchAssignmentsThunk());
        dispatch(fetchEmployeesThunk());
        dispatch(fetchClientsThunk());
        dispatch(fetchPaycodesThunk());
    }, [dispatch]);

    /* ── Add handler ─────────────────────────────── */
    const handleAssignEmployee = async () => {
        if (!selectedEmployeeId || !selectedClientId) {
            toast('Please select both employee and client', 'error');
            return;
        }
        if (!startDate || !endDate || !regularRate || !overtimeRate || !doubleTimeRate) {
            toast('Please fill in all date and rate fields', 'error');
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
            setAddOpen(false);
            setSelectedEmployeeId('');
            setSelectedClientId('');
            setEmployeeSearch('');
            setStartDate('');
            setEndDate('');
            setRegularRate('');
            setOvertimeRate('');
            setDoubleTimeRate('');
        } catch (error) {
            console.error('Failed to create assignment:', error);
            toast('Failed to create assignment', 'error');
        }
    };

    /* ── Edit handlers ───────────────────────────── */
    const openEdit = (a: Assignment) => {
        setEditTarget(a);
        setEditStartDate(a.start_date);
        setEditEndDate(a.end_date);
        setEditRegularRate(String(a.regular_rate));
        setEditOvertimeRate(String(a.overtime_rate));
        setEditDoubleTimeRate(String(a.double_time_rate));
        setEditPaycodeId(a.paycode_id ?? '');
        setEditIsActive(a.is_active);
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editTarget) return;
        try {
            await dispatch(
                updateAssignmentThunk({
                    assignmentId: editTarget.assignment_id,
                    payload: {
                        start_date: editStartDate,
                        end_date: editEndDate,
                        regular_rate: parseFloat(editRegularRate),
                        overtime_rate: parseFloat(editOvertimeRate),
                        double_time_rate: parseFloat(editDoubleTimeRate),
                        paycode_id: editPaycodeId || null,
                        is_active: editIsActive,
                    },
                }),
            ).unwrap();
            toast('Assignment updated successfully');
            setEditOpen(false);
            setEditTarget(null);
        } catch (error) {
            console.error('Failed to update assignment:', error);
            toast('Failed to update assignment', 'error');
        }
    };

    /* ── Delete handlers ─────────────────────────── */
    const openDelete = (a: Assignment) => {
        setDeleteTarget(a);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await dispatch(deleteAssignmentThunk(deleteTarget.assignment_id)).unwrap();
            toast('Assignment deleted successfully');
            setDeleteOpen(false);
            setDeleteTarget(null);
        } catch (error) {
            console.error('Failed to delete assignment:', error);
            toast('Failed to delete assignment', 'error');
        }
    };

    const filteredEmployees = useMemo(() => {
        if (!employeeSearch) return employees;
        const q = employeeSearch.toLowerCase();
        return employees.filter(
            (e) =>
                `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
                e.emp_email.toLowerCase().includes(q),
        );
    }, [employees, employeeSearch]);

    /* ── Helper: resolve names ──────────────────── */
    const getEmployeeName = (id: string) => {
        const emp = employees.find((e) => e.employee_id === id);
        return emp ? `${emp.first_name} ${emp.last_name}` : id.slice(0, 8) + '…';
    };
    const getClientName = (id: string) => {
        const c = clients.find((cl) => cl.client_id === id);
        return c ? c.client_name : id.slice(0, 8) + '…';
    };

    return (
        <>
            <div className="page-header">
                <h3 className="page-header__title">Assignments</h3>
                <Button className="btn--sm" onClick={() => setAddOpen(true)}>
                    + Add Assignment
                </Button>
            </div>
            <div className="table-wrap">
                <div className="table-toolbar">
                    <input
                        className="table-toolbar__input"
                        type="text"
                        placeholder="Search by ID / employee / client…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {assignmentsLoading ? (
                    <div className="no-data" style={{ padding: '2rem' }}>
                        Loading assignments…
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Client</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Reg / OT / DT Rate</th>
                                <th>Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="no-data">
                                        No assignments found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((a) => (
                                    <tr key={a.assignment_id}>
                                        <td>{getEmployeeName(a.employee_id)}</td>
                                        <td>{getClientName(a.client_id)}</td>
                                        <td>{a.start_date}</td>
                                        <td>{a.end_date}</td>
                                        <td>
                                            ${a.regular_rate} / ${a.overtime_rate} / ${a.double_time_rate}
                                        </td>
                                        <td>
                                            <Badge variant={a.is_active ? 'active' : 'inactive'}>
                                                {a.is_active ? 'Yes' : 'No'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                <Button
                                                    variant="secondary"
                                                    className="btn--sm"
                                                    onClick={() => openEdit(a)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="btn--sm"
                                                    onClick={() => openDelete(a)}
                                                >
                                                    Delete
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

            {/* ── Add Assignment Modal ──────────────── */}
            <Modal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                title="Add Assignment"
                actions={
                    <>
                        <Button variant="ghost" onClick={() => setAddOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="btn--sm" onClick={handleAssignEmployee}>
                            Assign
                        </Button>
                    </>
                }
            >
                <div className="detail-row">
                    <span className="detail-label">Select Employee</span>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Search employee…"
                            value={employeeSearch}
                            onChange={(e) => setEmployeeSearch(e.target.value)}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="">-- Select Employee --</option>
                            {filteredEmployees.map((e) => (
                                <option key={e.employee_id} value={e.employee_id}>
                                    {e.first_name} {e.last_name} ({e.emp_email})
                                </option>
                            ))}
                        </select>
                    </div>
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

            {/* ── Edit Assignment Modal ─────────────── */}
            <Modal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                title="Edit Assignment"
                actions={
                    <>
                        <Button variant="ghost" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="btn--sm" onClick={handleSaveEdit}>
                            Save Changes
                        </Button>
                    </>
                }
            >
                {editTarget && (
                    <>
                        <div className="detail-row">
                            <span className="detail-label">Employee</span>
                            <span>{getEmployeeName(editTarget.employee_id)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Client</span>
                            <span>{getClientName(editTarget.client_id)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Start Date</span>
                            <input
                                type="date"
                                value={editStartDate}
                                onChange={(e) => setEditStartDate(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">End Date</span>
                            <input
                                type="date"
                                value={editEndDate}
                                onChange={(e) => setEditEndDate(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Regular Rate ($/hr)</span>
                            <input
                                type="number"
                                step="0.01"
                                value={editRegularRate}
                                onChange={(e) => setEditRegularRate(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Overtime Rate ($/hr)</span>
                            <input
                                type="number"
                                step="0.01"
                                value={editOvertimeRate}
                                onChange={(e) => setEditOvertimeRate(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Double Time Rate ($/hr)</span>
                            <input
                                type="number"
                                step="0.01"
                                value={editDoubleTimeRate}
                                onChange={(e) => setEditDoubleTimeRate(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Paycode</span>
                            <select
                                value={editPaycodeId}
                                onChange={(e) => setEditPaycodeId(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">-- None --</option>
                                {paycodes.map((p) => (
                                    <option key={p.paycode_id} value={p.paycode_id}>
                                        {p.paycode} — {p.paycode_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Active</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={editIsActive}
                                    onChange={(e) => setEditIsActive(e.target.checked)}
                                />
                                {editIsActive ? 'Active' : 'Inactive'}
                            </label>
                        </div>
                    </>
                )}
            </Modal>

            {/* ── Delete Confirm Modal ────────────── */}
            <Modal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                title="Delete Assignment"
                actions={
                    <>
                        <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="btn--sm btn--danger" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                {deleteTarget && (
                    <p>
                        Are you sure you want to delete the assignment for{' '}
                        <strong>{getEmployeeName(deleteTarget.employee_id)}</strong> →{' '}
                        <strong>{getClientName(deleteTarget.client_id)}</strong>?
                        This action cannot be undone.
                    </p>
                )}
            </Modal>
        </>
    );
};

export default AssignmentManagement;
