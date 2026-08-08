import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, Search, CheckSquare, Square, Settings, ExternalLink, X, Activity, UsersRound, Plus, RefreshCw, Mail, Clock, AlertCircle, ChevronDown, Check } from 'lucide-react';
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

  // Template Modal dialog state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');

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
  const [templateList, setTemplateList] = useState<Template[]>(templates);

  const fetchLiveTemplates = async () => {
    const live = await ApiService.getTemplates();
    if (live && live.length > 0) {
      setTemplateList(live);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMailerConfig();
    fetchLiveTemplates();
  }, []);

  useEffect(() => {
    if (showTemplateModal) {
      fetchLiveTemplates();
    }
  }, [showTemplateModal]);

  useEffect(() => {
    if (templates.length > 0) {
      setTemplateList(templates);
    }
  }, [templates]);

  useEffect(() => {
    if (templateList.length === 0) return;
    if (!templateList.some((template) => template.key === selectedTemplate)) {
      setSelectedTemplate(templateList[0].key);
    }
  }, [templateList, selectedTemplate]);

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
    <div className="screen-page campaign-screen fade-in" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="screen-hero campaign-meta-hero" style={{ background: '#ffffff url(/bg2.jpg) no-repeat center center', backgroundSize: 'cover', padding: '16px 24px', minHeight: 'auto', borderRadius: '12px' }}>
        <div className="hero-content">
          <span className="screen-kicker" style={{ color: '#60a5fa', fontSize: '0.7rem' }}><UsersRound size={13} /> AUDIENCE LAUNCHPAD</span>
          <h2 style={{ fontSize: '24px', letterSpacing: '-0.5px', color: '#ffffff', margin: '4px 0' }}>
            Campaigns & Segments
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: 0 }}>Build precise audiences from your synced user list and launch queued email campaigns through SuperMailBox.</p>
        </div>
        <div className="hero-action-area">
          <button onClick={() => setShowSettingsModal(true)} className="btn-secondary smtp-btn" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #ffffff', color: '#0f172a', padding: '6px 12px', fontSize: '0.8rem' }}>
            <Settings size={13} /> SMTP Config
          </button>
        </div>
      </div>

      {settingsSavedMessage && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#166534', fontWeight: 500, fontSize: '0.825rem', marginBottom: '8px' }}>
          ✓ SMTP Provider settings updated successfully.
        </div>
      )}

      {broadcastSuccessMessage && (
        <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#0D4F3C" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>{broadcastSuccessMessage}</div>
              {providerUsed && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Provider: <strong>{providerUsed}</strong>
                </div>
              )}
            </div>
          </div>
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 14px', fontSize: '0.825rem' }}>
              View Sandbox Inbox <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}

      {jobStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total emails</span>
              <Mail size={14} color="var(--text-secondary)" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.queued + jobStats.sent + jobStats.failed + jobStats.suppressed}</div>
          </div>

          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Sent or delivered</span>
              <CheckCircle2 size={14} color="#24754E" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.sent}</div>
          </div>

          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Queued</span>
              <Clock size={14} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.queued}</div>
          </div>

          <div style={{ background: '#F5F1EC', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Failed or bounced</span>
              <AlertCircle size={14} color="#dc2626" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>{jobStats.failed + jobStats.suppressed}</div>
          </div>
        </div>
      )}

      {/* TWO COLUMN LAYOUT */}
      <div className="campaign-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '16px', alignItems: 'start', flex: 1 }}>

        {/* LEFT COLUMN: Configuration */}
        <div className="campaign-left">

          <div className="dashboard-panel" style={{ background: 'var(--surface)', padding: '16px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="dashboard-table-header compact" style={{ marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem' }}>SEGMENT CONTROLS</span>
                <h2 style={{ fontSize: '1.1rem' }}>Target Audience</h2>
              </div>
            </div>

            <div className="campaign-segment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'All Users', count: totalCount, mode: 'all', activeBg: '#EAECE9', activeBorder: '#0D4F3C', dotColor: '#0D4F3C' },
                { label: 'Pending Onboarding', count: pendingOnboardingCount, mode: 'pending_onboarding', activeBg: '#FEF3C7', activeBorder: '#D97706', dotColor: '#D97706' },
                { label: 'Unverified', count: unverifiedCount, mode: 'unverified', activeBg: '#FEE2E2', activeBorder: '#DC2626', dotColor: '#DC2626' },
                { label: 'Completed', count: completedOnboardingCount, mode: 'completed_onboarding', activeBg: '#DCFCE7', activeBorder: '#16A34A', dotColor: '#16A34A' },
              ].map(segment => {
                const isActive = filterMode === segment.mode;
                return (
                  <button
                    key={segment.mode}
                    onClick={() => setFilterMode(segment.mode as SegmentFilterMode)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isActive ? `2px solid ${segment.activeBorder}` : '1px solid var(--border)',
                      background: isActive ? segment.activeBg : '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    aria-pressed={isActive}
                  >
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: isActive ? '#0F172A' : 'var(--text-secondary)', marginBottom: '4px' }}>{segment.label}</span>
                    <strong style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)' }}>{segment.count}</strong>
                    {isActive && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', width: '6px', height: '6px', borderRadius: '50%', background: segment.dotColor }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="campaign-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div className="campaign-toolbar-actions" style={{ display: 'flex', gap: '6px' }}>
                <button onClick={selectVisible} style={{ border: 'none', background: '#EAE6DF', color: 'var(--ink)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Select Visible</button>
                <button onClick={deselectAll} style={{ border: 'none', background: '#EAE6DF', color: 'var(--ink)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Clear All</button>
                <button onClick={() => setShowAddEmailModal(true)} style={{ border: 'none', background: '#EAE6DF', color: 'var(--ink)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                  + Add Email
                </button>
                <button onClick={fetchUsers} disabled={isLoadingUsers} style={{ border: 'none', background: '#EAE6DF', color: 'var(--ink)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <RefreshCw size={11} className={isLoadingUsers ? 'spin-icon' : undefined} /> Refresh
                </button>
              </div>
              <div className="search-shell" style={{ padding: '6px 10px' }}>
                <Search size={13} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div className="dashboard-table-wrap" style={{ border: '1px solid var(--border)', borderRadius: '10px', maxHeight: 'calc(100vh - 400px)', minHeight: '260px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FAFAFA' }}>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center', padding: '10px' }}></th>
                    <th style={{ padding: '10px 12px', fontSize: '0.75rem' }}>USER</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '0.75rem' }}>STATUS</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '0.75rem' }}>PLAN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No users found</td></tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => toggleSelectEmail(u.email)}>
                        <td style={{ textAlign: 'center', padding: '8px' }}>
                          {selectedEmails[u.email] ? <CheckSquare size={15} color="#0D4F3C" /> : <Square size={15} color="var(--border)" />}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.85rem' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                          {u.is_verified === false ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: '#FEE2E2', color: '#991B1B', fontSize: '0.75rem', fontWeight: 600 }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#DC2626' }} />Unverified
                            </span>
                          ) : u.onboarding_completed ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16A34A' }} />Onboarded
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontSize: '0.75rem', fontWeight: 600 }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D97706' }} />{getOnboardingLabel(u)}
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '5px', background: '#F1F5F9', color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>
                            {u.account_type || 'Free'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="campaign-summary">

          <div className="dashboard-panel" style={{ background: 'var(--surface)', padding: '16px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="dashboard-table-header compact" style={{ marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.7rem' }}>LAUNCH SETUP</span>
                <h2 style={{ fontSize: '1.1rem' }}>Campaign Details</h2>
              </div>
            </div>

            <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>CAMPAIGN NAME</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Q4 Black Friday Promo"
                  className="ui-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>EMAIL TEMPLATE</label>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <Mail size={15} color="#0D4F3C" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {templates.find((t) => t.key === selectedTemplate)?.name || selectedTemplate || 'Select Template'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#F1F5F9', color: '#475569', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
                    Change
                  </span>
                </button>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>SCHEDULE SEND (OPTIONAL)</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="ui-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Recipients Selected</span>
                  <span className="badge-pill badge-neutral" style={{ fontSize: '0.9rem', fontWeight: 700, padding: '3px 10px' }}>{activeSelectedCount}</span>
                </div>

                <button
                  type="submit"
                  disabled={activeSelectedCount === 0 || !campaignName || isBroadcasting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isBroadcasting ? (
                    <>Processing <Activity size={16} className="spin-loader" style={{ border: 'none', animation: 'spin 1s linear infinite' }} /></>
                  ) : (
                    <>Launch Campaign <Send size={15} /></>
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

      {/* Template Picker Dialog Modal */}
      {showTemplateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid var(--border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FAFAFA'
              }}
            >
              <div>
                <span className="screen-kicker" style={{ fontSize: '0.7rem', color: '#0D4F3C', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <Mail size={12} /> SELECT TEMPLATE
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Email Templates
                </h3>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Bar */}
            <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--border)' }}>
              <div className="search-shell" style={{ margin: 0, width: '100%', padding: '10px 14px' }}>
                <Search size={16} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Search templates by name, key, or category..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Template List */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {templateList
                .filter((t) =>
                  !templateSearch ||
                  t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                  t.key.toLowerCase().includes(templateSearch.toLowerCase()) ||
                  (t.category && t.category.toLowerCase().includes(templateSearch.toLowerCase()))
                )
                .map((t) => {
                  const isSelected = selectedTemplate === t.key;
                  return (
                    <div
                      key={t.key}
                      onClick={() => {
                        setSelectedTemplate(t.key);
                        setShowTemplateModal(false);
                        setTemplateSearch('');
                      }}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #0D4F3C' : '1px solid var(--border)',
                        background: isSelected ? '#F4F7F4' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#FFFFFF';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: isSelected ? '#0D4F3C' : '#F1F5F9',
                            color: isSelected ? '#FFFFFF' : '#475569',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Mail size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: isSelected ? '#0D4F3C' : 'var(--ink)' }}>
                            {t.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                            key: {t.key}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: t.category === 'marketing' ? '#EFF6FF' : '#F1F5F9',
                            color: t.category === 'marketing' ? '#1D4ED8' : '#475569',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: '0.03em'
                          }}
                        >
                          {t.category || 'transactional'}
                        </span>
                        {isSelected ? (
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#16A34A',
                              color: '#FFFFFF',
                              display: 'grid',
                              placeItems: 'center'
                            }}
                          >
                            <Check size={14} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentBuilder;
