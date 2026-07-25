import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Search, CheckSquare, Square, Settings, ExternalLink, X, Activity, UsersRound, Plus, RefreshCw, Mail, Clock, AlertCircle } from 'lucide-react';
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
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      setShowLaunchModal(false);
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
    <div className="screen-page fade-in" style={{ backgroundColor: '#F8FAFC', width: '100%', minHeight: '100vh', paddingBottom: '40px' }}>
      
      {/* Sleek Modern Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '32px 40px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#3b82f6' }}>
              <UsersRound size={16} strokeWidth={2.5} />
            </div>
            <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>AUDIENCE LAUNCHPAD</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Campaigns & Segments
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '6px' }}>Build precise audiences from your synced user list and launch queued email campaigns.</p>
        </div>
        <div>
          <button onClick={() => setShowSettingsModal(true)} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#475569', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>
            <Settings size={16} /> SMTP Config
          </button>
        </div>
      </div>

      {settingsSavedMessage && (
        <div style={{ background: 'var(--success-light)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--success)', fontWeight: 500, fontSize: '0.875rem', marginBottom: '24px' }}>
          ✓ SMTP Provider settings updated successfully.
        </div>
      )}

      {broadcastSuccessMessage && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{broadcastSuccessMessage}</div>
              {providerUsed && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
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
          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total emails</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
                <Mail size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.queued + jobStats.sent + jobStats.failed + jobStats.suppressed}</div>
          </div>
          
          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sent or delivered</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#10b981', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={16} color="#ffffff" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.sent}</div>
          </div>
          
          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Queued</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f59e0b', display: 'grid', placeItems: 'center' }}>
                <Clock size={16} color="#ffffff" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.queued}</div>
          </div>
          
          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Failed or bounced</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#ef4444', display: 'grid', placeItems: 'center' }}>
                <AlertCircle size={16} color="#ffffff" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.failed + jobStats.suppressed}</div>
          </div>
        </div>
      )}

      {/* SINGLE COLUMN AUDIENCE PANEL */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ borderRadius: '24px', background: '#ffffff', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Target Audience</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
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
                    position: 'relative',
                    background: filterMode === segment.mode ? '#f8fafc' : '#ffffff',
                    border: filterMode === segment.mode ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: filterMode === segment.mode ? '0 10px 15px -3px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transform: filterMode === segment.mode ? 'translateY(-2px)' : 'none'
                  }}
                >
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>{segment.label}</span>
                  <strong style={{ display: 'block', fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>{segment.count}</strong>
                  {filterMode === segment.mode && (
                    <div style={{ position: 'absolute', top: '20px', right: '20px', width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px rgba(59, 130, 246, 0.6)' }} />
                  )}
                </button>
              ))}
            </div>

            <div className="campaign-toolbar">
              <div className="campaign-toolbar-actions">
                {activeSelectedCount > 0 && (
                  <button 
                    onClick={() => setShowLaunchModal(true)} 
                    className="btn-primary" 
                    style={{ background: 'var(--primary)', boxShadow: '0 0 10px rgba(37, 99, 235, 0.4)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Setup & Launch <Send size={14} />
                  </button>
                )}
                <button onClick={selectVisible} className="meta-toolbar-btn">Select Visible</button>
                <button onClick={deselectAll} className="meta-toolbar-btn">Clear All</button>
                <button onClick={() => setShowAddEmailModal(true)} className="meta-toolbar-btn">
                  + Add Email
                </button>
                <button onClick={fetchUsers} disabled={isLoadingUsers} className="meta-toolbar-btn">
                  <RefreshCw size={12} className={isLoadingUsers ? 'spin-icon' : undefined} /> Refresh
                </button>
              </div>
              <div className="search-shell">
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="campaign-table-shell">
              <table style={{ width: '100%', borderCollapse: 'collapse' }} className="meta-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}></th>
                    <th>USER</th>
                    <th style={{ textAlign: 'center' }}>STATUS</th>
                    <th style={{ textAlign: 'center' }}>PLAN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '1rem' }}>No users found in this segment.</td></tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} style={{ cursor: 'pointer', transition: 'background-color 0.15s ease', borderBottom: '1px solid #f1f5f9' }} onClick={() => toggleSelectEmail(u.email)} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ textAlign: 'center', padding: '16px 8px' }}>
                          {selectedEmails[u.email] ? <CheckSquare size={18} color="#3b82f6" /> : <Square size={18} color="#cbd5e1" />}
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{u.email}</div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '16px 8px' }}>
                          {u.is_verified === false ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '99px', background: '#fef08a', color: '#854d0e', fontSize: '0.75rem', fontWeight: 600 }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ca8a04' }}/>Unverified</span>
                          ) : u.onboarding_completed ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '99px', background: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}/>Onboarded</span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '99px', background: '#e0e7ff', color: '#3730a3', fontSize: '0.75rem', fontWeight: 600 }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }}/>{getOnboardingLabel(u)}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '16px 8px' }}>
                          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>{u.account_type || 'Free'}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* Launch Setup Modal */}
      {showLaunchModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '480px', background: '#ffffff', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6' }}>LAUNCH SETUP</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', marginTop: '4px', color: '#0f172a' }}>Campaign Details</h3>
              </div>
              <button onClick={() => setShowLaunchModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>CAMPAIGN NAME</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Q4 Black Friday Promo"
                  className="ui-input"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', fontSize: '0.95rem' }}
                  autoFocus
                />
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>EMAIL TEMPLATE</label>
                
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem'
                  }}
                >
                  {templates.find(t => t.key === selectedTemplate)?.name || 'Select a template...'}
                  <div style={{ transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                {isDropdownOpen && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 'calc(100% + 8px)', 
                    left: 0, 
                    right: 0, 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    zIndex: 110,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    padding: '8px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}>
                    <style>{`
                      div::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    {templates.map(t => (
                      <div 
                        key={t.key}
                        onClick={() => {
                          setSelectedTemplate(t.key);
                          setIsDropdownOpen(false);
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        style={{ 
                          padding: '10px 12px', 
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: selectedTemplate === t.key ? 'var(--primary)' : 'var(--text-main)',
                          fontWeight: selectedTemplate === t.key ? 600 : 400,
                          backgroundColor: 'transparent',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        {t.name}
                        {selectedTemplate === t.key && <CheckCircle2 size={16} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>SCHEDULE SEND (OPTIONAL)</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="ui-input"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', fontSize: '0.95rem', color: scheduleDate ? '#0f172a' : '#94a3b8' }}
                />
              </div>

              <div style={{ marginTop: '8px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Recipients Selected</span>
                  <div style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '20px', fontSize: '1rem', fontWeight: 700 }}>
                    {activeSelectedCount} users
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={activeSelectedCount === 0 || !campaignName || isBroadcasting}
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    fontSize: '1.05rem', 
                    fontWeight: 600,
                    borderRadius: '14px',
                    background: (activeSelectedCount === 0 || !campaignName || isBroadcasting) ? '#cbd5e1' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: (activeSelectedCount === 0 || !campaignName || isBroadcasting) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: (activeSelectedCount === 0 || !campaignName || isBroadcasting) ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {isBroadcasting ? (
                    <>Processing <Activity size={20} className="spin-loader" style={{border: 'none', animation: 'spin 1s linear infinite'}} /></>
                  ) : (
                    <>Launch Campaign 🚀</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
