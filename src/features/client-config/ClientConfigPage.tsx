/* ──────────────────────────────────────────────
 *  Client Configuration – tabbed page
 *  Tabs: Clients · Client Rules · Holidays · Whitelist
 * ────────────────────────────────────────────── */
import { useState } from 'react';
import { ClientManagement } from '../client';
import { ClientRulesPage } from '../client-rules';
import { HolidaysPage } from '../holiday';
import { WhitelistManagement } from '../whitelist';

const TABS = ['Clients', 'Client Rules', 'Holidays', 'Whitelist'] as const;
type Tab = (typeof TABS)[number];

const ClientConfigPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Clients');

  const renderContent = () => {
    switch (activeTab) {
      case 'Clients':
        return <ClientManagement />;
      case 'Client Rules':
        return <ClientRulesPage />;
      case 'Holidays':
        return <HolidaysPage />;
      case 'Whitelist':
        return <WhitelistManagement />;
    }
  };

  return (
    <div>
      <div className="page-header page-header--feature">
        <div>
          <h3 className="page-header__title">Client Configuration</h3>
          <p className="page-header__subtitle">
            Manage clients, calculation rules, holidays, and whitelisted emails.
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

      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default ClientConfigPage;
