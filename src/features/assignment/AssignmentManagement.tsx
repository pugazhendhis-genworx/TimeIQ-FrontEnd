/* ──────────────────────────────────────────────
 *  Assignment Management page – operation executive
 * ────────────────────────────────────────────── */
import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchAssignmentsThunk, createAssignmentThunk } from './assignmentSlice';
import { fetchEmployeesThunk } from '../employee/employeeSlice';
import { fetchClientsThunk } from '../client/clientSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { toast } from '../../utils/toast';

const AssignmentManagement = () => {
    const dispatch = useAppDispatch();
    const { assignments, assignmentsLoading } = useAppSelector(
        (s) => s.assignment,
    );
    const { employees } = useAppSelector((s) => s.employee);
    const { clients } = useAppSelector((s) => s.client);
    const [search, setSearch] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [regularRate, setRegularRate] = useState('');
    const [overtimeRate, setOvertimeRate] = useState('');
    const [doubleTimeRate, setDoubleTimeRate] = useState('');

    const filtered = useMemo(() => {
        if (!search) return assignments;
        const q = search.toLowerCase();
        return assignments.filter(
            (a: any) =>
                a.assignment_id.toLowerCase().includes(q) ||
                a.employee_id.toLowerCase().includes(q) ||
                a.client_id.toLowerCase().includes(q),
        );
    }, [assignments, search]);

    useEffect(() => {
        dispatch(fetchAssignmentsThunk());
        dispatch(fetchEmployeesThunk());
        dispatch(fetchClientsThunk());
    }, [dispatch]);

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

    const filteredEmployees = useMemo(() => {
        if (!employeeSearch) return employees;
        const q = employeeSearch.toLowerCase();
        return employees.filter(
            (e) =>
                `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
                e.emp_email.toLowerCase().includes(q),
        );
    }, [employees, employeeSearch]);

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
                                <th>ID</th>
                                <th>Employee</th>
                                <th>Client</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Rate</th>
                                <th>Active</th>
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
                                        <td>{a.assignment_id}</td>
                                        <td>{a.employee_id}</td>
                                        <td>{a.client_id}</td>
                                        <td>{a.start_date}</td>
                                        <td>{a.end_date}</td>
                                        <td>
                                            {a.regular_rate}/{a.overtime_rate}/{a.double_time_rate}
                                        </td>
                                        <td>
                                            <Badge variant={a.is_active ? 'active' : 'inactive'}>
                                                {a.is_active ? 'Yes' : 'No'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

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
        </>
    );
};

export default AssignmentManagement;
