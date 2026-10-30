import React from 'react';
import { ArrowRight, Headphones, LogOut, Mail, ShieldCheck } from 'lucide-react';
import '../features/sales/sales.css';

interface WorkspaceChooserProps {
  onNavigate: (path: string) => void;
  crmEnabled: boolean;
  onLogout: () => void;
}

export const WorkspaceChooser: React.FC<WorkspaceChooserProps> = ({ onNavigate, crmEnabled, onLogout }) => (
  <main className="workspace-choice-shell">
    <section className="workspace-choice-panel" aria-labelledby="workspace-title">
      <div className="workspace-choice-topbar">
        <div className="workspace-choice-brand">
          <img src="/logo.jpg" alt="" />
          <span>SuperMail</span>
        </div>
        <button className="workspace-choice-logout" onClick={onLogout}><LogOut size={17} />Log out</button>
      </div>
      <div className="workspace-choice-heading">
        <h1 id="workspace-title">Choose your workspace</h1>
        <p>Move between customer operations and delivery infrastructure without mixing their data or workflows.</p>
      </div>
      <div className="workspace-choice-grid">
        {crmEnabled && (
          <button className="workspace-choice-card" onClick={() => onNavigate('/sales')}>
            <span className="workspace-choice-icon"><Headphones size={25} /></span>
            <span className="workspace-choice-copy">
              <strong>Sales &amp; Support</strong>
              <small>Prioritize leads, follow up on onboarding, and resolve customer issues.</small>
              <span className="workspace-choice-meta"><ShieldCheck size={14} /> Isolated CRM workspace</span>
            </span>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        )}
        <button className="workspace-choice-card" onClick={() => onNavigate('/dashboard')}>
          <span className="workspace-choice-icon"><Mail size={25} /></span>
          <span className="workspace-choice-copy">
            <strong>Mail Operations</strong>
            <small>Monitor delivery, manage templates, launch campaigns, and protect reputation.</small>
            <span className="workspace-choice-meta"><ShieldCheck size={14} /> Existing mail control plane</span>
          </span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  </main>
);

