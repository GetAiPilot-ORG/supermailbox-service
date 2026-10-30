import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  MailCheck,
  Megaphone,
  ShieldCheck,
  UserRound,
  Layers,
} from 'lucide-react';

export type TabType = 'dashboard' | 'project_logs' | 'templates' | 'brand_library' | 'campaigns' | 'contacts';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onLogout,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'project_logs' as TabType,
      label: 'Project Logs',
      icon: ClipboardList,
    },
    {
      id: 'templates' as TabType,
      label: 'Templates',
      icon: FileText,
    },
    {
      id: 'brand_library' as TabType,
      label: 'Brand & Media',
      icon: Layers,
    },
    {
      id: 'campaigns' as TabType,
      label: 'Campaigns',
      icon: Megaphone,
    },
    {
      id: 'contacts' as TabType,
      label: 'Audience',
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className={`sidebar-shell ${collapsed ? 'collapsed' : ''}`}>
      <div>
        <div className="sidebar-brand" style={{ justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '10px 0 14px 0' : '10px 16px 14px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="sidebar-logo" aria-hidden="true" style={{ background: 'transparent', padding: 0, width: '28px', height: '28px' }}>
                <img src="/logo.jpg" alt="GetAiPilot Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)' }}>SuperMail</span>
            </div>
          )}
          <div className="sidebar-brand-actions">
            <button className="sidebar-logout-mobile" onClick={onLogout} aria-label="Log out" title="Log out">
              <LogOut size={19} />
            </button>
            <button
              onClick={onToggleCollapse}
              className="sidebar-collapse-icon"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', color: 'var(--ink)' }}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </div>



        <div className="sidebar-nav-shell">
          <nav className="sidebar-nav" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={19} strokeWidth={2.1} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className={`sidebar-user${collapsed ? ' sidebar-user--collapsed' : ''}`} onClick={onLogout} title="Log out">
          {collapsed ? <LogOut size={19} /> : (
            <>
              <span className="sidebar-user-avatar"><UserRound size={16} /></span>
              <span className="sidebar-user-copy"><span>Admin User</span><small>Log out of workspace</small></span>
              <LogOut className="sidebar-user-logout" size={17} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
