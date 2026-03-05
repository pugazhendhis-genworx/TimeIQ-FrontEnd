/* ──────────────────────────────────────────────
 *  Profile page
 * ────────────────────────────────────────────── */
import { useAppSelector } from '../../hooks/reduxHooks';
import Badge from '../../components/common/Badge';

const ProfilePage = () => {
  const { user } = useAppSelector((s) => s.auth);
  const { users } = useAppSelector((s) => s.dashboard);

  if (!user) return null;

  /* Merge validate data with enriched user from users list */
  const fullUser = users.find((u) => u.user_id === user.user_id);
  const name = fullUser?.name ?? user.user_name ?? user.user_id;
  const email = fullUser?.email ?? user.email ?? '—';
  const contactNo = fullUser?.contact_no ?? '—';
  const role = fullUser?.role ?? user.role ?? '—';
  const status = fullUser?.status ?? 'ACTIVE';
  const createdAt = fullUser?.created_at;
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">Profile Settings</h3>
      </div>

      <div className="profile-card">
        <div className="profile-card__avatar">{initials}</div>
        <div className="profile-card__row">
          <span className="profile-card__label">User ID</span>
          <span>{user.user_id}</span>
        </div>
        <div className="profile-card__row">
          <span className="profile-card__label">Name</span>
          <span>{name}</span>
        </div>
        <div className="profile-card__row">
          <span className="profile-card__label">Email</span>
          <span>{email}</span>
        </div>
        <div className="profile-card__row">
          <span className="profile-card__label">Contact</span>
          <span>{contactNo}</span>
        </div>
        <div className="profile-card__row">
          <span className="profile-card__label">Role</span>
          <Badge variant={role}>{role}</Badge>
        </div>
        <div className="profile-card__row">
          <span className="profile-card__label">Status</span>
          <Badge variant={status}>{status}</Badge>
        </div>
        <div className="profile-card__row">
          <span className="profile-card__label">Joined</span>
          <span>
            {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
