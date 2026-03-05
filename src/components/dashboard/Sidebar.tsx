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
  { label: 'Dashboard', icon: '', path: '/dashboard' },
  { label: 'Users', icon: '', path: '/dashboard/users', roles: ['admin'] },
  { label: 'Roles', icon: '', path: '/dashboard/roles', roles: ['admin'] },
  { label: 'Clients', icon: '', path: '/dashboard/clients', roles: ['admin', 'operation_executive'] },
  { label: 'Whitelist', icon: '', path: '/dashboard/whitelist', roles: ['admin', 'operation_executive'] },
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
