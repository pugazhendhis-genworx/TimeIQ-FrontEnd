/* ──────────────────────────────────────────────
 *  Roles page (admin only)
 * ────────────────────────────────────────────── */
import { useAppSelector } from '../../hooks/reduxHooks';

const RolesPage = () => {
  const { users, roles } = useAppSelector((s) => s.dashboard);

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">Roles</h3>
      </div>

      {roles.length === 0 ? (
        <p className="no-data">No roles found</p>
      ) : (
        <div className="roles-grid">
          {roles.map((r) => {
            const count = users.filter((u) => u.role === r.name).length;
            return (
              <div key={r.role_id} className="role-card">
                <div className="role-card__name">{r.name}</div>
                <div className="role-card__id">{r.role_id}</div>
                <div className="role-card__users">
                  {count} user{count !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default RolesPage;
