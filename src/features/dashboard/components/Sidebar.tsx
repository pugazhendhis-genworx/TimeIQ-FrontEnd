/* ──────────────────────────────────────────────
 *  Dashboard sidebar navigation
 * ────────────────────────────────────────────── */
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isAdmin: boolean;
  role: string;
}

interface NavItem {
  label: string;
  icon: string;
  path: string;
  /** Roles that can see this item. If omitted → visible to everyone. */
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  // Common
  { label: 'Dashboard', icon: '', path: '/dashboard' },

  // Admin-only
  { label: 'Users', icon: '', path: '/dashboard/users', roles: ['admin'] },
  // Note: admin no longer sees clients, whitelist, or other ops/auditor menus.

  // Operation Executive menus
  {
    label: 'Clients',
    icon: '',
    path: '/dashboard/clients',
    roles: ['operation_executive'],
  },
  {
    label: 'Whitelist',
    icon: '',
    path: '/dashboard/whitelist',
    roles: ['operation_executive'],
  },
  {
    label: 'Employees',
    icon: '',
    path: '/dashboard/employees',
    roles: ['operation_executive'],
  },
  {
    label: 'Emails',
    icon: '',
    path: '/dashboard/emails',
    roles: ['operation_executive'],
  },
  {
    label: 'Timesheets',
    icon: '',
    path: '/dashboard/timesheets',
    roles: ['operation_executive'],
  },
  {
    label: 'Timesheet Emails',
    icon: '',
    path: '/dashboard/timesheet-emails',
    roles: ['operation_executive'],
  },
  {
    label: 'Assignments',
    icon: '',
    path: '/dashboard/assignments',
    roles: ['operation_executive'],
  },
  {
    label: 'Payroll',
    icon: '',
    path: '/dashboard/payroll',
    roles: ['operation_executive'],
  },

  // Auditor menus
  {
    label: 'Timesheets Review',
    icon: '',
    path: '/dashboard/audit-timesheets',
    roles: ['auditor'],
  },
  {
    label: 'View Logs',
    icon: '',
    path: '/dashboard/audit-logs',
    roles: ['auditor'],
  },
  {
    label: 'Extracted Data',
    icon: '',
    path: '/dashboard/extracted-timesheets',
    roles: ['auditor'],
  },

  // Common
  { label: 'Profile', icon: '', path: '/dashboard/profile' },
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
          key={item.path}
          className={`sidebar__link${location.pathname === item.path ? ' sidebar__link--active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="sidebar__icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
