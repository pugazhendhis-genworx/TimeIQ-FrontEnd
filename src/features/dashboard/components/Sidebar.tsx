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
  icon?: string;
  /** Match nested routes (e.g. /dashboard/extracted-timesheets/:id) */
  prefixMatch?: boolean;
  /** Roles that can see this item. If omitted → visible to everyone. */
  roles?: string[];
  /** Optional group separator label rendered above this item */
  group?: string;
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
    label: 'Client Config',
    path: '/dashboard/client-config',
    roles: ['operation_executive'],
    group: 'Management',
  },
  {
    label: 'Workforce',
    path: '/dashboard/workforce',
    roles: ['operation_executive'],
  },
  {
    label: 'Emails',
    path: '/dashboard/emails',
    roles: ['operation_executive'],
    group: 'Processing',
  },
  {
    label: 'Timesheets',
    path: '/dashboard/timesheets',
    roles: ['operation_executive'],
  },
  {
    label: 'Rule Violations',
    path: '/dashboard/rule-violations',
    roles: ['operation_executive', 'auditor'],
    group: 'Compliance',
  },
  {
    label: 'Payroll Codes',
    path: '/dashboard/payroll',
    roles: ['operation_executive'],
  },

  {
    label: 'Timesheets Review',
    path: '/dashboard/audit-timesheets',
    roles: ['auditor'],
    group: 'Audit',
  },
  {
    label: 'Payroll Ready',
    path: '/dashboard/payroll-ready',
    roles: ['auditor'],
  },
  {
    label: 'Audit Logs',
    path: '/dashboard/audit-logs',
    roles: ['auditor'],
  },
  {
    label: 'Extracted Data',
    path: '/dashboard/extracted-timesheets',
    prefixMatch: true,
    roles: ['auditor'],
  },

  { label: 'Profile', path: '/dashboard/profile', group: 'Account' },
];

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = NAV_ITEMS.filter(
    (n) => !n.roles || n.roles.includes(role),
  );

  let lastGroup: string | undefined;

  return (
    <nav className="sidebar">
      {items.map((item) => {
        const showGroup = item.group && item.group !== lastGroup;
        if (item.group) lastGroup = item.group;

        return (
          <div key={`${item.path}-${item.label}`}>
            {showGroup && (
              <div className="sidebar__group">{item.group}</div>
            )}
            <button
              type="button"
              className={`sidebar__link${
                pathIsActive(location.pathname, item.path, item.prefixMatch)
                  ? ' sidebar__link--active'
                  : ''
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.icon && <span className="sidebar__icon">{item.icon}</span>}
              {item.label}
            </button>
          </div>
        );
      })}
    </nav>
  );
};

export default Sidebar;
