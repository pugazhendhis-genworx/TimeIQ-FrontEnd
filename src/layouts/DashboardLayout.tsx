/* ──────────────────────────────────────────────
 *  DashboardLayout – shell for all dashboard pages
 *  Topbar + Sidebar + Main content area
 * ────────────────────────────────────────────── */
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import {
  fetchUsersThunk,
  fetchRolesThunk,
} from '../features/dashboard/dashboardSlice';
import Topbar from '../components/dashboard/Topbar';
import Sidebar from '../components/dashboard/Sidebar';

const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  /* Fetch users & roles on mount */
  useEffect(() => {
    dispatch(fetchUsersThunk());
    dispatch(fetchRolesThunk());
  }, [dispatch]);

  return (
    <div className="dashboard-shell">
      <Topbar />
      <div className="dashboard-shell__layout">
        <Sidebar isAdmin={isAdmin} />
        <main className="dashboard-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
