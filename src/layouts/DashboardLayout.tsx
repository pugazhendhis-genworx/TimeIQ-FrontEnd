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
import { fetchClientsThunk } from '../features/client/clientSlice';
import { fetchWhitelistsThunk } from '../features/whitelist/whitelistSlice';
import Topbar from '../components/dashboard/Topbar';
import Sidebar from '../components/dashboard/Sidebar';

const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const role = user?.role?.toLowerCase() ?? '';
  const isAdmin = role === 'admin';

  /* Fetch shared data on mount */
  useEffect(() => {
    dispatch(fetchUsersThunk());
    dispatch(fetchRolesThunk());
    dispatch(fetchClientsThunk());
    dispatch(fetchWhitelistsThunk());
  }, [dispatch]);

  return (
    <div className="dashboard-shell">
      <Topbar />
      <div className="dashboard-shell__layout">
        <Sidebar isAdmin={isAdmin} role={role} />
        <main className="dashboard-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
