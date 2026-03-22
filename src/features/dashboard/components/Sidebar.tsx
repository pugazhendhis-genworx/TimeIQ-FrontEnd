/* ──────────────────────────────────────────────
 *  Dashboard sidebar navigation
 * ────────────────────────────────────────────── */
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  role: string;
}

interface NavItem {
  label: string;
  path: string;
  /** Match nested routes (e.g. /dashboard/extracted-timesheets/:id) */
  prefixMatch?: boolean;
  /** Roles that can see this item. If omitted → visible to everyone. */
  roles?: string[];
}

const pathIsActive = (pathname: string, path: string, prefixMatch?: boolean) => {
  if (path === '/dashboard' && pathname === '/dashboard') return true;
  if (path === '/dashboard') return false;
  if (prefixMatch) return pathname === path || pathname.startsWith(`${path}/`);
  return pathname === path;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },

  { label: 'Users', path: '/dashboard/users', roles: ['admin'] },

  {
    label: 'Clients',
    path: '/dashboard/clients',
    roles: ['operation_executive'],
  },
  {
    label: 'Client rules',
    path: '/dashboard/client-rules',
    roles: ['operation_executive'],
  },
  {
    label: 'Holidays',
    path: '/dashboard/holidays',
    roles: ['operation_executive'],
  },
  {
    label: 'Whitelist',
    path: '/dashboard/whitelist',
    roles: ['operation_executive'],
  },
  {
    label: 'Employees',
    path: '/dashboard/employees',
    roles: ['operation_executive'],
  },
  {
    label: 'Emails',
    path: '/dashboard/emails',
    roles: ['operation_executive'],
  },
  {
    label: 'Timesheets',
    path: '/dashboard/timesheets',
    roles: ['operation_executive'],
  },
  {
    label: 'Rule violations',
    path: '/dashboard/rule-violations',
    roles: ['operation_executive', 'auditor'],
  },
  {
    label: 'Assignments',
    path: '/dashboard/assignments',
    roles: ['operation_executive'],
  },
  {
    label: 'Payroll',
    path: '/dashboard/payroll',
    roles: ['operation_executive'],
  },

  {
    label: 'Timesheets review',
    path: '/dashboard/audit-timesheets',
    roles: ['auditor'],
  },
  {
    label: 'Payroll ready',
    path: '/dashboard/payroll-ready',
    roles: ['auditor'],
  },
  {
    label: 'Audit logs',
    path: '/dashboard/audit-logs',
    roles: ['auditor'],
  },
  {
    label: 'Extracted data',
    path: '/dashboard/extracted-timesheets',
    prefixMatch: true,
    roles: ['auditor'],
  },

  { label: 'Profile', path: '/dashboard/profile' },
];

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = NAV_ITEMS.filter(
    (n) => !n.roles || n.roles.includes(role),
  );

  return (
    <nav className="sidebar">
      {items.map((item) => (
        <button
          key={`${item.path}-${item.label}`}
          type="button"
          className={`sidebar__link${
            pathIsActive(location.pathname, item.path, item.prefixMatch)
              ? ' sidebar__link--active'
              : ''
          }`}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
