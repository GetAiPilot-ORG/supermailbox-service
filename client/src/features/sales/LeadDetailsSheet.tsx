import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  Copy,
  Headphones,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { CrmApi } from './crmApi';
import { SignupMethodBadge } from './SignupMethodBadge';
import {
  type AdminProfile,
  type LeadDetail,
  type LeadStatus,
  type SalesStage,
  type SupportTicket,
  SALES_STAGES,
  STAGE_CONFIG,
} from './types';

interface LeadDetailsSheetProps {
  leadId: string | null;
  adminProfiles?: AdminProfile[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
}

const PIPELINE_STAGE_OPTIONS: { id: SalesStage; label: string; dot: string; color: string }[] = SALES_STAGES.map((s) => ({
  id: s,
  label: STAGE_CONFIG[s].label,
  dot: STAGE_CONFIG[s].dotColor,
  color: STAGE_CONFIG[s].badgeText,
}));

const dateTime = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

const formatDateOnly = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

const localDateTimeInput = (daysFromNow: number) => {
  const value = new Date();
  if (daysFromNow === 0 && value.getHours() >= 23) return null;
  value.setDate(value.getDate() + daysFromNow);
  value.setHours(daysFromNow === 0 ? Math.max(value.getHours() + 1, 11) : 11, 0, 0, 0);
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
};

export const LeadDetailsSheet: React.FC<LeadDetailsSheetProps> = ({
  leadId,
  adminProfiles = [],
  onClose,
  onChanged,
}) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Editable fields
  const [currentStage, setCurrentStage] = useState<SalesStage>('unreviewed');
  const [currentAssignedTo, setCurrentAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [lostReason, setLostReason] = useState('');

  // Sub-tabs in drawer
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  // Activity & follow-up states
  const [quickNote, setQuickNote] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState<SupportTicket['priority']>('normal');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(''), 2500);
  };

  const loadLead = async () => {
    if (!leadId) return;
    setLoading(true);
    setError('');
    try {
      const res = await CrmApi.lead(leadId);
      setDetail(res);
      const stage = (res.lead.salesStage && res.lead.salesStage in STAGE_CONFIG ? res.lead.salesStage : 'unreviewed') as SalesStage;
      setCurrentStage(stage);
      setCurrentAssignedTo(res.lead.assignedTo || '');
      setNotes(res.lead.notes || '');
      setFollowupDate(res.lead.nextFollowUpAt ? res.lead.nextFollowUpAt.slice(0, 10) : '');
      setLostReason(res.lead.lostReason || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load lead details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      setActiveTab('overview');
      void loadLead();
    }
  }, [leadId]);

  // Trap focus and handle escape
  useEffect(() => {
    if (!leadId) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [leadId, onClose]);

  if (!leadId) return null;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard`);
    } catch {
      showToast(`Could not copy ${label}`);
    }
  };

  const handleStageChange = async (newStage: SalesStage) => {
    setSaving(true);
    setCurrentStage(newStage);
    try {
      await CrmApi.updateLead(leadId, { salesStage: newStage });
      showToast(`Pipeline stage updated to ${STAGE_CONFIG[newStage]?.label || newStage}`);
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Stage update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignChange = async (repId: string) => {
    setSaving(true);
    setCurrentAssignedTo(repId);
    try {
      await CrmApi.updateLead(leadId, { assignedTo: repId === 'none' ? null : repId });
      showToast('Assigned representative updated');
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await CrmApi.updateLead(leadId, { notes });
      showToast('Lead notes saved');
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Saving notes failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetFollowup = async () => {
    setSaving(true);
    try {
      const iso = followupDate ? new Date(followupDate + 'T12:00:00Z').toISOString() : null;
      await CrmApi.updateLead(leadId, { nextFollowUpAt: iso });
      showToast(followupDate ? `Follow-up set for ${followupDate}` : 'Follow-up cleared');
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Failed to set follow-up');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkContacted = async () => {
    setSaving(true);
    try {
      await CrmApi.updateLead(leadId, { lastContactedAt: new Date().toISOString() });
      showToast('Lead marked as contacted');
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Failed to mark as contacted');
    } finally {
      setSaving(false);
    }
  };


  const handleAddQuickNote = async () => {
    if (!quickNote.trim()) return;
    setSaving(true);
    try {
      await CrmApi.addActivity(leadId, { type: 'note', body: quickNote });
      setQuickNote('');
      showToast('Note added to timeline');
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !taskDue) return;
    setSaving(true);
    try {
      await CrmApi.createTask({ leadId, title: taskTitle, dueAt: new Date(taskDue).toISOString() });
      setTaskTitle('');
      setTaskDue('');
      showToast('Follow-up task created');
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim()) return;
    setSaving(true);
    try {
      await CrmApi.createTicket({ leadId, subject: ticketSubject, priority: ticketPriority });
      setTicketSubject('');
      showToast('Support ticket opened');
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'open' : 'done';
    setSaving(true);
    try {
      await CrmApi.updateTask(taskId, { status: nextStatus });
      showToast(nextStatus === 'done' ? 'Task marked completed' : 'Task reopened');
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Failed to update task.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTicket = async (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
    setSaving(true);
    try {
      await CrmApi.updateTicket(ticketId, { status: nextStatus });
      showToast(nextStatus === 'resolved' ? 'Support ticket resolved' : 'Ticket reopened');
      await onChanged();
      await loadLead();
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket.');
    } finally {
      setSaving(false);
    }
  };

  const lead = detail?.lead;
  const cleanPhone = (lead?.phone || '').replace(/[^0-9]/g, '');

  return (
    <div
      className="sales-drawer-backdrop"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={drawerRef}
        className="sales-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Lead record"
        tabIndex={-1}
        style={{
          width: 'min(490px, 100vw)',
          backgroundColor: '#fff',
          boxShadow: '-12px 0 35px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '13px 18px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: '#2563eb' }} />
            <h2 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
              Lead Details
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close record"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={15} />
          </button>
        </header>

        {/* Toast / Error Banner */}
        {toastMsg && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#ecfdf5',
              borderBottom: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            {toastMsg}
          </div>
        )}
        {error && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#fef2f2',
              borderBottom: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading && !detail ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 className="sales-spin" size={28} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading lead dossier…</span>
          </div>
        ) : !lead ? null : (
          <>
            {/* Top Identity Card */}
            <div style={{ padding: '16px 18px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {lead.fullName}
                  </h3>
                  <SignupMethodBadge method={lead.signupMethod} size="sm" />
                  {(() => {
                    const cfg = STAGE_CONFIG[currentStage] || STAGE_CONFIG.unreviewed;
                    return (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '2px 8px',
                          borderRadius: '5px',
                          border: `1px solid ${cfg.dotColor}33`,
                          backgroundColor: cfg.badgeBg,
                          color: cfg.badgeText,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: cfg.dotColor,
                            display: 'inline-block',
                          }}
                        />
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Contact Links */}
                <div style={{ marginTop: '9px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {lead.email && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.74rem',
                        color: '#334155',
                      }}
                    >
                      <Mail size={12} style={{ color: '#2563eb', flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{lead.email}</span>
                      <button
                        onClick={() => copy(lead.email!, 'Email')}
                        title="Copy email"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0 2px',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  )}

                  {lead.phone && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.74rem',
                        color: '#334155',
                      }}
                    >
                      <Phone size={12} style={{ color: '#059669', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>{lead.phone}</span>
                      <button
                        onClick={() => copy(lead.phone!, 'Phone')}
                        title="Copy phone"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0 2px',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  )}

                  {cleanPhone.length >= 10 && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        fontWeight: 600,
                        fontSize: '0.73rem',
                        textDecoration: 'none',
                      }}
                      title="Chat directly on WhatsApp"
                    >
                      <MessageCircle size={12} />
                      WhatsApp ↗
                    </a>
                  )}
                </div>

                {/* Key Facts Strip */}
                <div
                  style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#ffffff',
                    borderRadius: '7px',
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                  }}
                >
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      Service
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.74rem', marginTop: '1px' }}>
                      {lead.serviceLabel || (lead.planLabel?.includes('Trial') ? 'Free Trial' : 'Free Tier')}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      Active Plan
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.74rem', marginTop: '1px' }}>
                      {lead.planLabel || lead.accountType || 'Free Tier'}
                      {lead.planPricePaise ? ` (₹${(lead.planPricePaise / 100).toLocaleString('en-IN')})` : ''}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      Status & Validity
                    </div>
                    <div style={{ fontSize: '0.72rem', marginTop: '1px', fontWeight: 650 }}>
                      {lead.subStatusDetail === 'active_paid' ? (
                        <span style={{ color: '#15803d' }}>
                          🟢 Active Paid {lead.expiresAt ? `• till ${formatDateOnly(lead.expiresAt)}` : ''}
                        </span>
                      ) : lead.subStatusDetail === 'active_trial' ? (
                        <span style={{ color: '#7e22ce' }}>
                          🟣 In Trial {lead.expiresAt ? `• ends ${formatDateOnly(lead.expiresAt)}` : ''}
                        </span>
                      ) : lead.subStatusDetail === 'expired_trial' ? (
                        <span style={{ color: '#b91c1c' }}>
                          🔴 Trial Ended {lead.expiresAt ? `• ${formatDateOnly(lead.expiresAt)}` : ''}
                        </span>
                      ) : lead.subStatusDetail === 'expired_paid' ? (
                        <span style={{ color: '#c2410c' }}>
                          🟠 Plan Expired {lead.expiresAt ? `• ${formatDateOnly(lead.expiresAt)}` : ''}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>Free Tier</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      Joined
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 500, fontSize: '0.74rem', marginTop: '1px' }}>
                      {formatDateOnly(lead.registeredAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Tabs: Overview & Notes | Timeline & Tasks */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                padding: '0 18px',
                backgroundColor: '#ffffff',
              }}
            >
              {[
                { id: 'overview', label: 'Overview & Notes' },
                {
                  id: 'history',
                  label: `Tasks, Support & Timeline (${detail.tasks.length + detail.tickets.length})`,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as 'overview' | 'history')}
                  style={{
                    padding: '10px 14px',
                    border: 'none',
                    borderBottom: activeTab === t.id ? '2px solid #2563eb' : '2px solid transparent',
                    background: 'none',
                    color: activeTab === t.id ? '#2563eb' : '#64748b',
                    fontWeight: activeTab === t.id ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* TAB 1: OVERVIEW & NOTES */}
              {activeTab === 'overview' && (
                <>
                  {/* Quick Action: Contacted / WhatsApp */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={handleMarkContacted}
                      disabled={saving}
                      className="sales-btn-xs sales-btn-outline"
                      style={{
                        height: '32px',
                        padding: '0 12px',
                        fontSize: '0.74rem',
                        gap: '6px',
                        borderRadius: '6px',
                      }}
                    >
                      <UserCheck size={13} style={{ color: '#2563eb' }} />
                      {lead.lastContactedAt ? `Contacted (${dateTime(lead.lastContactedAt)})` : 'Mark as Contacted Now'}
                    </button>
                    {cleanPhone.length >= 10 && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="sales-btn-xs sales-btn-outline"
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          fontSize: '0.74rem',
                          gap: '6px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          color: '#15803d',
                          borderColor: '#bbf7d0',
                          backgroundColor: '#f0fdf4',
                        }}
                      >
                        <MessageCircle size={13} style={{ color: '#16a34a' }} />
                        WhatsApp Chat ↗
                      </a>
                    )}
                  </div>

                  {/* Status & Assignment Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                    }}
                  >
                    {/* Pipeline Status */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                        Pipeline Status
                      </label>
                      <select
                        value={currentStage}
                        onChange={(e) => handleStageChange(e.target.value as SalesStage)}
                        disabled={saving}
                        style={{
                          height: '34px',
                          padding: '0 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {PIPELINE_STAGE_OPTIONS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Assigned Representative */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                        Assigned To
                      </label>
                      <select
                        value={currentAssignedTo || 'none'}
                        onChange={(e) => handleAssignChange(e.target.value)}
                        disabled={saving}
                        style={{
                          height: '34px',
                          padding: '0 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          color: '#0f172a',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="none">Unassigned</option>
                        {adminProfiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name || p.email || p.id.slice(0, 8)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Lost Reason if Lost */}
                  {currentStage === 'lost' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#dc2626' }}>
                        Reason Lead Was Lost
                      </label>
                      <select
                        value={lostReason}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setLostReason(val);
                          try {
                            await CrmApi.updateLead(leadId, { lostReason: val });
                            showToast('Lost reason saved');
                          } catch {
                            // ignore
                          }
                        }}
                        style={{
                          height: '34px',
                          padding: '0 10px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fff',
                          fontSize: '0.78rem',
                          color: '#991b1b',
                        }}
                      >
                        <option value="">Select a reason</option>
                        <option value="not_interested">Not interested</option>
                        <option value="no_response">No response</option>
                        <option value="no_budget">No budget</option>
                        <option value="wrong_fit">Not the right fit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  {/* Follow-up Scheduling Card */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '9px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} style={{ color: '#2563eb' }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                          Next Follow-Up
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: lead.nextFollowUpAt ? '#0f172a' : '#94a3b8', fontWeight: lead.nextFollowUpAt ? 600 : 400 }}>
                        {lead.nextFollowUpAt ? dateTime(lead.nextFollowUpAt) : 'No follow-up scheduled'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          setFollowupDate(d.toISOString().slice(0, 10));
                        }}
                        style={{
                          height: '26px',
                          padding: '0 8px',
                          borderRadius: '5px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 3);
                          setFollowupDate(d.toISOString().slice(0, 10));
                        }}
                        style={{
                          height: '26px',
                          padding: '0 8px',
                          borderRadius: '5px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        In 3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 7);
                          setFollowupDate(d.toISOString().slice(0, 10));
                        }}
                        style={{
                          height: '26px',
                          padding: '0 8px',
                          borderRadius: '5px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        Next Week
                      </button>

                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="date"
                          value={followupDate}
                          onChange={(e) => setFollowupDate(e.target.value)}
                          style={{
                            height: '28px',
                            padding: '0 6px',
                            borderRadius: '5px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            fontSize: '0.74rem',
                            color: '#0f172a',
                            outline: 'none',
                          }}
                        />
                        <button
                          onClick={handleSetFollowup}
                          disabled={saving || !followupDate}
                          className="sales-btn-xs sales-btn-primary"
                          style={{ height: '28px', padding: '0 10px', fontSize: '0.7rem' }}
                        >
                          {saving ? 'Saving…' : 'Set'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                        Lead Notes
                      </label>
                      <button
                        onClick={handleSaveNotes}
                        disabled={saving}
                        className="sales-btn-xs sales-btn-primary"
                        style={{ height: '26px', padding: '0 10px', fontSize: '0.7rem' }}
                      >
                        {saving ? 'Saving…' : 'Save Notes'}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add conversation notes, customer requirements, budget, or concerns…"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        lineHeight: 1.5,
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </>
              )}

              {/* TAB 2: TIMELINE & TASKS */}
              {activeTab === 'history' && (
                <>
                  {/* Create Quick Task */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock3 size={13} style={{ color: '#d97706' }} />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                        Add Follow-up Task
                      </span>
                    </div>
                    <input
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Task to do (e.g. Call regarding pricing)"
                      style={{
                        height: '32px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        backgroundColor: '#fff',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => { const d = localDateTimeInput(0); if (d) setTaskDue(d); }}
                        style={{ height: '26px', padding: '0 8px', borderRadius: '5px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.7rem', color: '#475569', cursor: 'pointer' }}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => { const d = localDateTimeInput(1); if (d) setTaskDue(d); }}
                        style={{ height: '26px', padding: '0 8px', borderRadius: '5px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.7rem', color: '#475569', cursor: 'pointer' }}
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => { const d = localDateTimeInput(3); if (d) setTaskDue(d); }}
                        style={{ height: '26px', padding: '0 8px', borderRadius: '5px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.7rem', color: '#475569', cursor: 'pointer' }}
                      >
                        In 3 Days
                      </button>
                      <input
                        type="datetime-local"
                        value={taskDue}
                        onChange={(e) => setTaskDue(e.target.value)}
                        style={{ height: '28px', padding: '0 6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.72rem', flex: 1, minWidth: '140px', backgroundColor: '#fff' }}
                      />
                      <button
                        onClick={handleCreateTask}
                        disabled={saving || !taskTitle.trim() || !taskDue}
                        className="sales-btn-xs sales-btn-primary"
                        style={{ height: '28px', padding: '0 12px', fontSize: '0.72rem' }}
                      >
                        Add Task
                      </button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                        Scheduled Tasks ({detail.tasks.length})
                      </span>
                    </div>
                    {detail.tasks.length === 0 ? (
                      <div style={{ padding: '10px 12px', fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px dashed #e2e8f0' }}>
                        No follow-ups scheduled.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {detail.tasks.map((task) => {
                          const isDone = task.status === 'done';
                          return (
                            <div
                              key={task.id}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                backgroundColor: isDone ? '#f8fafc' : '#ffffff',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.76rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => handleToggleTask(task.id, task.status)}
                                  disabled={saving}
                                  style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                                />
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: isDone ? '#94a3b8' : '#0f172a',
                                    textDecoration: isDone ? 'line-through' : 'none',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {task.title}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.7rem', color: isDone ? '#10b981' : '#64748b', fontWeight: isDone ? 600 : 400, flexShrink: 0 }}>
                                {isDone ? '✓ Completed' : dateTime(task.dueAt)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Log Call / Quick Note */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageSquareText size={13} style={{ color: '#2563eb' }} />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                        Log Call or Note to Timeline
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        value={quickNote}
                        onChange={(e) => setQuickNote(e.target.value)}
                        placeholder="e.g. Spoke on phone, client requested pricing on pro plan…"
                        style={{
                          height: '32px',
                          padding: '0 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          flex: 1,
                          backgroundColor: '#fff',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void handleAddQuickNote();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddQuickNote}
                        disabled={saving || !quickNote.trim()}
                        className="sales-btn-xs sales-btn-primary"
                        style={{ height: '32px', padding: '0 12px', fontSize: '0.72rem' }}
                      >
                        Log
                      </button>
                    </div>
                  </div>

                  {/* Support Tickets Section */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                        Support Tickets ({detail.tickets.length})
                      </span>
                    </div>

                    {/* Quick Ticket Input */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <input
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Open support issue…"
                        style={{ height: '30px', padding: '0 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.74rem', flex: 1 }}
                      />
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value as any)}
                        style={{ height: '30px', padding: '0 6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <button
                        onClick={handleCreateTicket}
                        disabled={saving || !ticketSubject.trim()}
                        className="sales-btn-xs sales-btn-outline"
                        style={{ height: '30px', padding: '0 10px', fontSize: '0.72rem' }}
                      >
                        Open
                      </button>
                    </div>

                    {detail.tickets.length === 0 ? (
                      <div style={{ padding: '10px 12px', fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px dashed #e2e8f0' }}>
                        No support tickets opened.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {detail.tickets.map((t) => {
                          const isResolved = t.status === 'resolved' || t.status === 'closed';
                          return (
                            <div
                              key={t.id}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                backgroundColor: isResolved ? '#f8fafc' : '#ffffff',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.76rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                <span
                                  style={{
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    backgroundColor: isResolved
                                      ? '#94a3b8'
                                      : t.priority === 'urgent'
                                      ? '#ef4444'
                                      : t.priority === 'high'
                                      ? '#ea580c'
                                      : '#2563eb',
                                    flexShrink: 0,
                                  }}
                                  title={`Priority: ${t.priority}`}
                                />
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: isResolved ? '#94a3b8' : '#0f172a',
                                    textDecoration: isResolved ? 'line-through' : 'none',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {t.subject}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                <span
                                  style={{
                                    fontSize: '0.67rem',
                                    color: '#64748b',
                                    textTransform: 'capitalize',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    backgroundColor: '#f1f5f9',
                                  }}
                                >
                                  {t.priority}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleTicket(t.id, t.status)}
                                  disabled={saving}
                                  style={{
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: isResolved ? '#f1f5f9' : '#ecfdf5',
                                    color: isResolved ? '#64748b' : '#047857',
                                    borderRadius: '4px',
                                    padding: '2px 7px',
                                    fontSize: '0.67rem',
                                    fontWeight: 650,
                                    cursor: 'pointer',
                                    transition: 'all 120ms ease',
                                  }}
                                >
                                  {isResolved ? 'Reopen' : '✓ Resolve'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Activity History Timeline */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                        Activity History ({detail.activities.length})
                      </span>
                    </div>
                    {detail.activities.length === 0 ? (
                      <div style={{ padding: '10px 12px', fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px dashed #e2e8f0' }}>
                        No activity recorded yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {detail.activities.map((act) => (
                          <div
                            key={act.id}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.76rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.7rem' }}>
                              <strong style={{ textTransform: 'capitalize', color: '#334155' }}>{act.type.replace(/_/g, ' ')}</strong>
                              <span>{dateTime(act.occurredAt)}</span>
                            </div>
                            {act.body && (
                              <p style={{ margin: '4px 0 0', color: '#0f172a', lineHeight: 1.4 }}>
                                {act.body}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
