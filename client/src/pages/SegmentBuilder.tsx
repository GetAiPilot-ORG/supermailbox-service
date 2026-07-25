import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Search, CheckSquare, Square, Settings, ExternalLink, X, Activity, UsersRound, Plus, RefreshCw } from 'lucide-react';
import { ApiService, type Campaign, type Template, type GetAIPilotUser } from '../services/api';

interface SegmentBuilderProps {
  campaigns: Campaign[];
  templates: Template[];
  onLaunchCampaign?: (name: string, templateKey: string, scheduledAt?: string) => void;
}

type SegmentFilterMode = 'all' | 'pending_onboarding' | 'unverified' | 'completed_onboarding';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SegmentBuilder: React.FC<SegmentBuilderProps> = ({
  templates,
  onLaunchCampaign,
}) => {
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.key || 'auth_welcome');
  const [scheduleDate, setScheduleDate] = useState('');

  // GetAIPilot users state
  const [getAIPilotUsers, setGetAIPilotUsers] = useState<GetAIPilotUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<SegmentFilterMode>('all');
  const [selectedEmails, setSelectedEmails] = useState<Record<string, boolean>>({});
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccessMessage, setBroadcastSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [providerUsed, setProviderUsed] = useState<string | null>(null);
  const [jobStats, setJobStats] = useState<any | null>(null);
  const [customTestEmail, setCustomTestEmail] = useState('');
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);

  const handleAddCustomEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTestEmail.trim()) return;
    const cleanEmail = customTestEmail.trim();
    setGetAIPilotUsers((prev: any) => [
      {
        id: 'user_custom_' + Date.now(),
        email: cleanEmail,
        full_name: cleanEmail.split('@')[0],
        account_type: 'Pro',
        country: 'IN',
        status: 'Active',
        onboarding_completed: true,
        is_verified: true,
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
    setSelectedEmails(prev => ({ ...prev, [cleanEmail]: true }));
    setCustomTestEmail('');
    setShowAddEmailModal(false);
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [zeptoApiKey, setZeptoApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('noreply@getaipilot.com');
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchMailerConfig();
  }, []);

  useEffect(() => {
    if (templates.length === 0) return;
    if (!templates.some((template) => template.key === selectedTemplate)) {
      setSelectedTemplate(templates[0].key);
    }
  }, [templates, selectedTemplate]);

  const fetchMailerConfig = async () => {
    try {
      // We should ideally use the api.ts service here, but falling back to VITE_API_URL directly
      const baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/v1` : 'http://localhost:5050/v1';
      const res = await fetch(`${baseUrl}/mailer/config`);
      if (res.ok) {
        const data = await res.json();
        if (data?.config) {
          if (data.config.zeptoApiKey) setZeptoApiKey(data.config.zeptoApiKey);
          if (data.config.fromEmail) setFromEmail(data.config.fromEmail);
          if (data.config.smtpHost) setSmtpHost(data.config.smtpHost);
          if (data.config.smtpPort) setSmtpPort(String(data.config.smtpPort));
          if (data.config.smtpUser) setSmtpUser(data.config.smtpUser);
        }
      }
    } catch (err) {
      console.error('Could not load mailer config:', err);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    const users = await ApiService.getGetAIPilotUsers();
    setGetAIPilotUsers(users);
    setSelectedEmails({});
    setIsLoadingUsers(false);
  };

  const totalCount = getAIPilotUsers.length;
  const pendingOnboardingCount = getAIPilotUsers.filter(u => u.onboarding_completed === false && u.is_verified !== false).length;
  const unverifiedCount = getAIPilotUsers.filter(u => u.is_verified === false).length;
  const completedOnboardingCount = getAIPilotUsers.filter(u => u.onboarding_completed === true).length;

  const filteredUsers = getAIPilotUsers.filter(u => {
    const matchesSearch = !searchQuery ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'pending_onboarding') return u.onboarding_completed === false && u.is_verified !== false;
    if (filterMode === 'unverified') return u.is_verified === false;
    if (filterMode === 'completed_onboarding') return u.onboarding_completed === true;
    return true;
  });

  const getOnboardingLabel = (user: GetAIPilotUser) => {
    if (user.onboarding_completed) return 'Onboarded';
    if (user.tour_completed) return 'Tour done';
    if (user.tour_step && user.tour_step > 0) return `Step ${user.tour_step}`;
    if (user.tour_seen) return 'Tour started';
    return 'Pending';
  };

  const activeSelectedCount = Object.values(selectedEmails).filter(Boolean).length;

  const toggleSelectEmail = (email: string) => {
    setSelectedEmails(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const selectVisible = () => {
    const next = { ...selectedEmails };
    filteredUsers.forEach(u => { next[u.email] = true; });
    setSelectedEmails(next);
  };

  const deselectAll = () => {
    setSelectedEmails({});
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || activeSelectedCount === 0 || isBroadcasting) return;

    setIsBroadcasting(true);
    setBroadcastSuccessMessage(null);
    setPreviewUrl(null);
    setProviderUsed(null);
    setJobStats(null);

    const recipients = getAIPilotUsers
      .filter(u => Boolean(selectedEmails[u.email]))
      .filter(u => EMAIL_RE.test(u.email))
      .map(u => ({ email: u.email, full_name: u.full_name }));

    if (recipients.length === 0) {
      throw new Error('No valid email recipients selected.');
    }

    try {
      const result = await ApiService.broadcastCampaign(
        campaignName,
        selectedTemplate,
        recipients,
        scheduleDate || undefined
      );

      if (!result.success) {
        throw new Error(result.error || 'Broadcast failed before queueing.');
      }

      onLaunchCampaign && onLaunchCampaign(
        `${campaignName} (${activeSelectedCount} Users)`,
        selectedTemplate,
        scheduleDate || undefined
      );

      setBroadcastSuccessMessage(
        `Success! Dispatched ${result.queued || recipients.length} jobs to queue. Batch ID: ${result.campaign?.id || result.campaignId || 'queued_batch'}`
      );
      if (result.previewUrl) setPreviewUrl(result.previewUrl);
      setProviderUsed(result.providerUsed || 'Ethereal / SMTP');

      if (result.campaign && result.campaign.id) {
        const stats = await ApiService.getCampaignJobStats(result.campaign.id);
        setJobStats(stats);
      } else {
        setJobStats({ queued: recipients.length, sending: 0, sent: 0, failed: 0, suppressed: 0 });
      }

      setCampaignName('');
      setScheduleDate('');
      setSelectedEmails({});
    } catch (err) {
      console.error('Broadcast failed:', err);
      setBroadcastSuccessMessage(`Broadcast failed: ${err instanceof Error ? err.message : 'Please check the server logs.'}`);
      setProviderUsed(null);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSaveMailerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/v1` : 'http://localhost:5050/v1';
      await fetch(`${baseUrl}/mailer/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: zeptoApiKey || fromEmail ? 'zeptomail' : smtpUser && smtpPass ? 'smtp' : 'ethereal',
          smtpHost,
          smtpPort: parseInt(smtpPort || '587'),
          smtpUser,
          smtpPass,
          ...(zeptoApiKey ? { zeptoApiKey } : {}),
          fromEmail
        })
      });
      setSettingsSavedMessage(true);
      setTimeout(() => setSettingsSavedMessage(false), 3500);
      setShowSettingsModal(false);
    } catch (err) {
      console.error('Failed saving mailer config', err);
    }
  };

  return (
  return (
    <div className="screen-page campaign-screen fade-in">
      <div className="screen-hero campaign-meta-hero" style={{ background: '#ffffff url(/bg2.jpg) no-repeat center center', backgroundSize: 'cover' }}>
        <div className="hero-content">
          <span className="screen-kicker" style={{ color: '#60a5fa' }}><UsersRound size={14} /> AUDIENCE LAUNCHPAD</span>
          <h2 style={{ fontSize: '32px', letterSpacing: '-0.5px', color: '#ffffff' }}>
            Campaigns & Segments
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)' }}>Build precise audiences from your synced user list and launch queued email campaigns through SuperMailBox.</p>
        </div>
        <div className="hero-action-area">
          <button onClick={() => setShowSettingsModal(true)} className="btn-secondary smtp-btn" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #ffffff', color: '#0f172a' }}>
            <Settings size={14} /> SMTP Config
          </button>
        </div>
      </div>

      {settingsSavedMessage && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: '#166534', fontWeight: 500, fontSize: '0.875rem', marginBottom: '20px' }}>
          ✓ SMTP Provider settings updated successfully.
        </div>
      )}

      {broadcastSuccessMessage && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#0D4F3C" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ink)' }}>{broadcastSuccessMessage}</div>
              {providerUsed && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Provider: <strong>{providerUsed}</strong>
                </div>
              )}
            </div>
          </div>
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
              View Sandbox Inbox <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {jobStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total emails</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
                <Mail size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.queued + jobStats.sent + jobStats.failed + jobStats.suppressed}</div>
          </div>
          
          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sent or delivered</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#24754E', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={16} color="#ffffff" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.sent}</div>
          </div>
          
          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Queued</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#d97706', display: 'grid', placeItems: 'center' }}>
                <Clock size={16} color="#ffffff" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.queued}</div>
          </div>
          
          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Failed or bounced</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#dc2626', display: 'grid', placeItems: 'center' }}>
                <AlertCircle size={16} color="#ffffff" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.failed + jobStats.suppressed}</div>
          </div>
        </div>
      )}

      {/* TWO COLUMN LAYOUT */}
      <div className="campaign-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Configuration */}
        <div className="campaign-left">
          
          <div className="dashboard-panel" style={{ background: 'var(--surface)', padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="dashboard-table-header compact" style={{ marginBottom: '20px' }}>
              <div>
                <span>SEGMENT CONTROLS</span>
                <h2>Target Audience</h2>
              </div>
            </div>
            
            <div className="campaign-segment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'All Users', count: totalCount, mode: 'all' },
                { label: 'Pending Onboarding', count: pendingOnboardingCount, mode: 'pending_onboarding' },
                { label: 'Unverified', count: unverifiedCount, mode: 'unverified' },
                { label: 'Completed', count: completedOnboardingCount, mode: 'completed_onboarding' },
              ].map(segment => (
                <button
                  key={segment.mode}
                  onClick={() => setFilterMode(segment.mode as SegmentFilterMode)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: filterMode === segment.mode ? '2px solid #0D4F3C' : '1px solid var(--border)',
                    background: filterMode === segment.mode ? '#F4F7F4' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                  aria-pressed={filterMode === segment.mode}
                >
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>{segment.label}</span>
                  <strong style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)' }}>{segment.count}</strong>
                  {filterMode === segment.mode && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', background: '#0D4F3C' }} />
                  )}
                </button>
              ))}
            </div>

            <div className="campaign-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div className="campaign-toolbar-actions" style={{ display: 'flex', gap: '8px' }}>
                <button onClick={selectVisible} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.825rem' }}>Select Visible</button>
                <button onClick={deselectAll} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.825rem' }}>Clear All</button>
                <button onClick={() => setShowAddEmailModal(true)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.825rem' }}>
                  + Add Email
                </button>
                <button onClick={fetchUsers} disabled={isLoadingUsers} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.825rem' }}>
                  <RefreshCw size={12} className={isLoadingUsers ? 'spin-icon' : undefined} /> Refresh
                </button>
              </div>
              <div className="search-shell">
                <Search size={14} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="dashboard-table-wrap" style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '44px', textAlign: 'center' }}></th>
                    <th>USER</th>
                    <th style={{ textAlign: 'center' }}>STATUS</th>
                    <th style={{ textAlign: 'center' }}>PLAN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found</td></tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => toggleSelectEmail(u.email)}>
                        <td style={{ textAlign: 'center' }}>
                          {selectedEmails[u.email] ? <CheckSquare size={16} color="#0D4F3C" /> : <Square size={16} color="var(--border)" />}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {u.is_verified === false ? (
                            <span className="badge-pill badge-neutral"><span className="dot"></span>Unverified</span>
                          ) : u.onboarding_completed ? (
                            <span className="badge-pill badge-success"><span className="dot"></span>Onboarded</span>
                          ) : (
                            <span className="badge-pill badge-neutral"><span className="dot"></span>{getOnboardingLabel(u)}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge-pill badge-neutral">{u.account_type || 'Free'}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: Sticky Summary */}
        <div className="campaign-summary" style={{ position: 'sticky', top: '20px' }}>
          
          <div className="dashboard-panel" style={{ background: 'var(--surface)', padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="dashboard-table-header compact" style={{ marginBottom: '20px' }}>
              <div>
                <span>LAUNCH SETUP</span>
                <h2>Campaign Details</h2>
              </div>
            </div>
            
            <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>CAMPAIGN NAME</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Q4 Black Friday Promo"
                  className="ui-input"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>EMAIL TEMPLATE</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="ui-input"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', cursor: 'pointer', backgroundColor: '#ffffff' }}
                >
                  {templates.map(t => (
                    <option key={t.key} value={t.key}>{t.name} ({t.key})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>SCHEDULE SEND (OPTIONAL)</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="ui-input"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Recipients Selected</span>
                  <span className="badge-pill badge-neutral" style={{ fontSize: '1rem', fontWeight: 700, padding: '4px 12px' }}>{activeSelectedCount}</span>
                </div>
                
                <button
                  type="submit"
                  disabled={activeSelectedCount === 0 || !campaignName || isBroadcasting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isBroadcasting ? (
                    <>Processing <Activity size={18} className="spin-loader" style={{border: 'none', animation: 'spin 1s linear infinite'}} /></>
                  ) : (
                    <>Launch Campaign <Send size={16} /></>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* SMTP Config Modal */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--ink) 40%, transparent)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-dropdown)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>SMTP / Delivery Config</h3>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
            </div>
            
            <form onSubmit={handleSaveMailerConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>ZeptoMail API Key</label>
                <input type="password" value={zeptoApiKey} onChange={(e) => setZeptoApiKey(e.target.value)} className="ui-input" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Verified Sender Email</label>
                <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="noreply@your-verified-domain.com" className="ui-input" style={{ width: '100%' }} />
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Fallback Custom SMTP</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="SMTP Host" className="ui-input" style={{ width: '100%' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="Username" className="ui-input" />
                    <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="Password" className="ui-input" />
                  </div>
                </div>
              </div>
              
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Save Configuration</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Email Modal */}
      {showAddEmailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--ink) 38%, transparent)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--neutral)' }}>Add Test Email</h3>
              <button onClick={() => setShowAddEmailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddCustomEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="e.g. hello@example.com"
                  value={customTestEmail}
                  onChange={(e) => setCustomTestEmail(e.target.value)}
                  className="ui-input"
                  style={{ width: '100%' }}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Add & Select</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentBuilder;
