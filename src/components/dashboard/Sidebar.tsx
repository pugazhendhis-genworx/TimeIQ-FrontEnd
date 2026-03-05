/* ──────────────────────────────────────────────
 *  Dashboard sidebar navigation
 * ────────────────────────────────────────────── */
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isAdmin: boolean;
}

interface NavItem {
  label: string;
  icon: string;
  path: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: '▪', path: '/dashboard' },
  { label: 'Users', icon: '👥', path: '/dashboard/users', adminOnly: true },
  { label: 'Roles', icon: '⚙', path: '/dashboard/roles', adminOnly: true },
  { label: 'Profile', icon: '👤', path: '/dashboard/profile' },
];

const Sidebar = ({ isAdmin }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = isAdmin ? NAV_ITEMS : NAV_ITEMS.filter((n) => !n.adminOnly);

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
