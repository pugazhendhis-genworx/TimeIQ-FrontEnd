/* ──────────────────────────────────────────────
 *  Paycode / Payroll management page
 * ────────────────────────────────────────────── */
import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPaycodesThunk, createPaycodeThunk } from './paycodeSlice';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { toast } from '../../utils/toast';
import Pagination from '../../components/common/Pagination';

const PaycodeManagement = () => {
    const dispatch = useAppDispatch();
    const { paycodes, paycodesLoading, createPaycodeLoading } =
        useAppSelector((s) => s.paycode);
    const [search, setSearch] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [newPaycode, setNewPaycode] = useState({ paycode: '', paycode_name: '' });
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchPaycodesThunk());
    }, [dispatch]);

    const filtered = useMemo(() => {
        if (!search) return paycodes;
        const q = search.toLowerCase();
        return paycodes.filter(
            (p) =>
                p.paycode.toLowerCase().includes(q) ||
                p.paycode_name.toLowerCase().includes(q),
        );
    }, [paycodes, search]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const pageSize = 10;
    const totalItems = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const handleAdd = async () => {
        try {
            await dispatch(createPaycodeThunk(newPaycode)).unwrap();
            toast('Paycode added');
            setAddOpen(false);
            setNewPaycode({ paycode: '', paycode_name: '' });
        } catch {
            toast('Failed to create paycode', 'error');
        }
    };

    return (
        <>
            <div className="page-header">
                <h3 className="page-header__title">Payroll / Paycodes</h3>
                <Button className="btn--sm" onClick={() => setAddOpen(true)}>
                    + Add Paycode
                </Button>
            </div>
            <div className="table-wrap">
                <div className="table-toolbar">
                    <input
                        className="table-toolbar__input"
                        type="text"
                        placeholder="Search paycode…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {paycodesLoading ? (
                    <div className="no-data" style={{ padding: '2rem' }}>
                        Loading paycodes…
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="no-data">
                                        No paycodes found
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((p) => (
                                    <tr key={p.paycode_id}>
                                        <td>{p.paycode}</td>
                                        <td>{p.paycode_name}</td>
                                        <td>{p.paycode_id}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Pagination
                page={page}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
            />

            <Modal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                title="Add Paycode"
                actions={
                    <>
                        <Button variant="ghost" onClick={() => setAddOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="btn--sm"
                            onClick={handleAdd}
                            disabled={createPaycodeLoading}
                        >
                            Save
                        </Button>
                    </>
                }
            >
                <div className="detail-row">
                    <span className="detail-label">Code</span>
                    <input
                        type="text"
                        value={newPaycode.paycode}
                        onChange={(e) =>
                            setNewPaycode((p) => ({ ...p, paycode: e.target.value }))
                        }
                    />
                </div>
                <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <input
                        type="text"
                        value={newPaycode.paycode_name}
                        onChange={(e) =>
                            setNewPaycode((p) => ({ ...p, paycode_name: e.target.value }))
                        }
                    />
                </div>
            </Modal>
        </>
    );
};

export default PaycodeManagement;
