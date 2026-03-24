/* ──────────────────────────────────────────────
 *  Workforce – tabbed page
 *  Tabs: Employees · Assignments
 * ────────────────────────────────────────────── */
import { useState } from 'react';
import { EmployeeManagement } from '../employee';
import { AssignmentManagement } from '../assignment';

const TABS = ['Employees', 'Assignments'] as const;
type Tab = (typeof TABS)[number];

const WorkforcePage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Employees');

  return (
    <div>
      <div className="page-header page-header--feature">
        <div>
          <h3 className="page-header__title">Workforce</h3>
          <p className="page-header__subtitle">
            Manage employees and their client assignments.
          </p>
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-bar__item${activeTab === tab ? ' tab-bar__item--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'Employees' ? <EmployeeManagement /> : <AssignmentManagement />}
      </div>
    </div>
  );
};

export default WorkforcePage;
