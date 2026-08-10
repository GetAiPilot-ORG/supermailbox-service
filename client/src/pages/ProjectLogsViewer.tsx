import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Mail, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import { ApiService, type ActivityLog } from '../services/api';

export const ProjectLogsViewer: React.FC = () => {
  const [projectLogs, setProjectLogs] = useState<Record<string, ActivityLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logs = await ApiService.getProjectLogs();
      setProjectLogs(logs);
      if (Object.keys(logs).length > 0) {
        setSelectedProject(Object.keys(logs)[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const projects = Object.keys(projectLogs);
  const selectedLogs = projectLogs[selectedProject] || [];
  const allLogs = Object.values(projectLogs).flat();
  const deliveredCount = allLogs.filter((log) => log.status === 'Delivered' || log.status === 'Sent').length;
  const failedCount = allLogs.filter((log) => log.status === 'Failed' || log.status === 'Bounced').length;
  const queuedCount = allLogs.filter((log) => log.status === 'Queued').length;
  const projectCount = projects.filter((project) => (projectLogs[project] || []).length > 0).length;

  const formatProjectName = (project: string) =>
    project
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const getStatusClass = (status: ActivityLog['status']) => {
    if (status === 'Delivered' || status === 'Sent') return 'project-logs-status success';
    if (status === 'Failed' || status === 'Bounced') return 'project-logs-status danger';
    return 'project-logs-status neutral';
  };

  const getProjectLogo = (proj: string) => {
    const lower = (proj || '').toLowerCase();
    if (lower.includes('whatsapp')) return 'https://wb.getaipilot.in/logo.png';
    if (lower.includes('social')) return 'https://social.getaipilot.in/logo.png';
    return 'https://getaipilot.in/logo.png';
  };

  return (
    <section className="project-logs-page fade-in">
      <div className="project-logs-hero" style={{ background: '#ffffff url(/bg2.jpg) no-repeat center center', backgroundSize: 'cover' }}>
        <div className="project-logs-hero-copy">
          <span className="project-logs-kicker" style={{ color: '#60a5fa' }}>
            <Server size={14} />
            Multi-project mail stream
          </span>
          <h2 style={{ color: '#ffffff' }}>Project Emails</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)' }}>Track transactional and campaign mail by source project, recipient, provider, and delivery state.</p>
        </div>
        <button className="project-logs-refresh" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'project-logs-refreshing' : ''} />
          {loading ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <div className="project-logs-stats">
        <div className="project-logs-stat" style={{ flexDirection: 'row', alignItems: 'center', padding: '12px 16px', minHeight: 'auto', gap: '16px' }}>
          <div className="project-logs-stat-header" style={{ width: 'auto', justifyContent: 'flex-start', gap: '12px' }}>
            <div className="project-logs-stat-icon dark" style={{ width: '36px', height: '36px' }}>
              <Mail size={16} />
            </div>
            <span style={{ fontSize: '0.9rem' }}>Total emails</span>
          </div>
          <div className="project-logs-stat-value" style={{ marginLeft: 'auto' }}>
            <strong style={{ fontSize: '1.5rem' }}>{allLogs.length}</strong>
          </div>
        </div>
        <div className="project-logs-stat" style={{ flexDirection: 'row', alignItems: 'center', padding: '12px 16px', minHeight: 'auto', gap: '16px' }}>
          <div className="project-logs-stat-header" style={{ width: 'auto', justifyContent: 'flex-start', gap: '12px' }}>
            <div className="project-logs-stat-icon green" style={{ width: '36px', height: '36px' }}>
              <CheckCircle2 size={16} />
            </div>
            <span style={{ fontSize: '0.9rem' }}>Sent or delivered</span>
          </div>
          <div className="project-logs-stat-value" style={{ marginLeft: 'auto' }}>
            <strong style={{ fontSize: '1.5rem' }}>{deliveredCount}</strong>
          </div>
        </div>
        <div className="project-logs-stat" style={{ flexDirection: 'row', alignItems: 'center', padding: '12px 16px', minHeight: 'auto', gap: '16px' }}>
          <div className="project-logs-stat-header" style={{ width: 'auto', justifyContent: 'flex-start', gap: '12px' }}>
            <div className="project-logs-stat-icon amber" style={{ width: '36px', height: '36px' }}>
              <Clock3 size={16} />
            </div>
            <span style={{ fontSize: '0.9rem' }}>Queued</span>
          </div>
          <div className="project-logs-stat-value" style={{ marginLeft: 'auto' }}>
            <strong style={{ fontSize: '1.5rem' }}>{queuedCount}</strong>
          </div>
        </div>
        <div className="project-logs-stat" style={{ flexDirection: 'row', alignItems: 'center', padding: '12px 16px', minHeight: 'auto', gap: '16px' }}>
          <div className="project-logs-stat-header" style={{ width: 'auto', justifyContent: 'flex-start', gap: '12px' }}>
            <div className="project-logs-stat-icon red" style={{ width: '36px', height: '36px' }}>
              <AlertCircle size={16} />
            </div>
            <span style={{ fontSize: '0.9rem' }}>Failed or bounced</span>
          </div>
          <div className="project-logs-stat-value" style={{ marginLeft: 'auto' }}>
            <strong style={{ fontSize: '1.5rem' }}>{failedCount}</strong>
          </div>
        </div>
      </div>

      <div className="project-logs-shell">
        {loading && projects.length === 0 ? (
          <div className="project-logs-loading">
            <div className="spin-loader" />
            <p>Loading project mail activity...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="project-logs-empty">
            <ShieldCheck size={34} />
            <h3>No project emails yet</h3>
            <p>Send a transactional email or campaign and it will appear here grouped by project.</p>
          </div>
        ) : (
          <div className="project-logs-grid">
            <aside className="project-logs-projects" aria-label="Projects">
              <div className="project-logs-projects-header">
                <span>Projects</span>
                <strong>{projectCount}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projects.map((proj) => {
                  const isActive = selectedProject === proj;
                  return (
                    <button
                      key={proj}
                      onClick={() => setSelectedProject(proj)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: isActive ? '1px solid #0D4F3C' : '1px solid transparent',
                        background: isActive ? '#F4F7F4' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '8px', background: '#FFFFFF',
                          border: '1px solid var(--border)', display: 'grid', placeItems: 'center', padding: '4px',
                          flexShrink: 0
                        }}>
                          <img src={getProjectLogo(proj)} alt={proj} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isActive ? '#0D4F3C' : 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {formatProjectName(proj)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {proj}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700,
                        background: isActive ? '#0D4F3C' : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#475569',
                        padding: '4px 10px', borderRadius: '999px',
                        flexShrink: 0,
                        marginLeft: '8px'
                      }}>
                        {projectLogs[proj].length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="project-logs-table-panel">
              <div style={{ 
                background: 'linear-gradient(to right, #FFFFFF, #F8FAFC)',
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                padding: '20px 24px', 
                marginBottom: '24px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', background: '#FFFFFF', 
                    border: '1px solid var(--border)', display: 'grid', placeItems: 'center', padding: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}>
                    <img src={getProjectLogo(selectedProject)} alt={selectedProject} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Selected Stream</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>{formatProjectName(selectedProject)}</h3>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Volume</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0D4F3C', background: '#F4F7F4', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(13, 79, 60, 0.2)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    {selectedLogs.length} emails
                  </strong>
                </div>
              </div>

              <div className="project-logs-table-wrap" style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', overflowY: 'auto', overflowX: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
                <table className="project-logs-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#F8FAFC', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <tr>
                      <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Status</th>
                      <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Recipient</th>
                      <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Type</th>
                      <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Provider</th>
                      <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLogs.map((log, idx) => (
                      <tr key={log.id || idx} style={{ transition: 'background-color 0.15s ease', borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '16px' }}>
                          <span className={getStatusClass(log.status)}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--ink)' }}>
                          <span className="project-logs-recipient">{log.recipient ? log.recipient.replace(/^camp_[a-z0-9]+_/i, '') : ''}</span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '0.85rem' }}><span className="project-logs-type">{log.type}</span></td>
                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.provider}</td>
                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                    {selectedLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="project-logs-table-empty">
                          No emails found for {selectedProject}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
