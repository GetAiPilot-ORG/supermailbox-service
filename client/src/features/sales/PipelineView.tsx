import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  User,
  UsersRound,
  X,
  Zap,
} from 'lucide-react';
import { SignupMethodBadge } from './SignupMethodBadge';
import {
  SALES_STAGES,
  STAGE_CONFIG,
  SERVICE_CONFIG,
  type StageMeta,
  type AdminProfile,
  type SalesLead,
  type SalesStage,
} from './types';

export { STAGE_CONFIG, SERVICE_CONFIG, type StageMeta };

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
};

const formatFollowup = (iso?: string | null) => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const now = new Date();
    const isOverdue = d.getTime() < now.getTime();
    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
    }).format(d);
    return { text: formatted, isOverdue };
  } catch {
    return null;
  }
};

interface PipelineViewProps {
  allLeads: SalesLead[];
  adminProfiles: AdminProfile[];
  draggedLead: SalesLead | null;
  onDrag: (lead: SalesLead | null) => void;
  onDrop: (lead: SalesLead, stage: SalesStage) => void;
  onOpenLead: (id: string) => void;
  onRefresh: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  allLeads,
  adminProfiles,
  draggedLead,
  onDrag,
  onDrop,
  onOpenLead,
  onRefresh,
  onShowToast,
}) => {
  // Filter states
  const [search, setSearch] = useState('');
  const [repFilter, setRepFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageScope, setStageScope] = useState<'all' | 'active' | 'closed'>('all');
  const [dragOverStage, setDragOverStage] = useState<SalesStage | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Rep name lookup map
  const repNameMap = useMemo(() => {
    const map = new Map<string, string>();
    adminProfiles.forEach((p) => {
      map.set(p.id, p.full_name || p.email || p.id.slice(0, 8));
    });
    return map;
  }, [adminProfiles]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allLeads.filter((lead) => {
      // 1. Search Query
      if (q) {
        const nameMatch = (lead.fullName || '').toLowerCase().includes(q);
        const emailMatch = (lead.email || '').toLowerCase().includes(q);
        const phoneMatch = (lead.phone || '').includes(q);
        const planMatch = (lead.planLabel || '').toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch && !planMatch) return false;
      }

      // 2. Rep filter
      if (repFilter !== 'all') {
        if (repFilter === 'unassigned') {
          if (lead.assignedTo) return false;
        } else if (lead.assignedTo !== repFilter) {
          return false;
        }
      }

      // 3. Platform filter
      if (platformFilter !== 'all' && lead.signupMethod !== platformFilter) {
        return false;
      }

      // 4. Service filter
      if (serviceFilter !== 'all') {
        const leadService = lead.serviceLabel || (lead.planLabel?.includes('Trial') ? 'Free Trial' : 'Free Tier');
        if (leadService !== serviceFilter) return false;
      }

      // 5. Subscription Status filter
      if (statusFilter !== 'all') {
        const detail = lead.subStatusDetail || (lead.subscriptionStatus === 'active' ? 'active_paid' : 'free_tier');
        if (detail !== statusFilter) return false;
      }

      return true;
    });
  }, [allLeads, search, repFilter, platformFilter, serviceFilter, statusFilter]);

  // Grouped by stage
  const columns = useMemo(() => {
    const grouped = {} as Record<SalesStage, SalesLead[]>;
    SALES_STAGES.forEach((s) => {
      grouped[s] = [];
    });

    filteredLeads.forEach((lead) => {
      const stage = (lead.salesStage in grouped ? lead.salesStage : 'unreviewed') as SalesStage;
      grouped[stage].push(lead);
    });

    return grouped;
  }, [filteredLeads]);

  // Visible stages based on stageScope
  const visibleStages = useMemo(() => {
    if (stageScope === 'active') {
      return SALES_STAGES.filter((s) => STAGE_CONFIG[s].category === 'active');
    }
    if (stageScope === 'closed') {
      return SALES_STAGES.filter((s) => STAGE_CONFIG[s].category === 'closed');
    }
    return SALES_STAGES;
  }, [stageScope]);

  // Pipeline metrics
  const metrics = useMemo(() => {
    const total = allLeads.length;
    const activePaid = allLeads.filter((l) => l.subStatusDetail === 'active_paid' || l.salesStage === 'won').length;
    const activeTrial = allLeads.filter((l) => l.subStatusDetail === 'active_trial' || l.salesStage === 'demo_trial').length;
    const expiredTrial = allLeads.filter((l) => l.subStatusDetail === 'expired_trial').length;
    const expiredPaid = allLeads.filter((l) => l.subStatusDetail === 'expired_paid').length;
    const winRate = total > 0 ? Math.round((activePaid / total) * 100) : 0;

    return { total, activePaid, activeTrial, expiredTrial, expiredPaid, winRate };
  }, [allLeads]);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await onRefresh();
      onShowToast('Synced latest GetAiPilot leads, plans & subscriptions.');
    } catch (e: any) {
      onShowToast(e?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const hasFilters = Boolean(
    search ||
      repFilter !== 'all' ||
      platformFilter !== 'all' ||
      serviceFilter !== 'all' ||
      statusFilter !== 'all' ||
      stageScope !== 'all'
  );

  const clearFilters = () => {
    setSearch('');
    setRepFilter('all');
    setPlatformFilter('all');
    setServiceFilter('all');
    setStatusFilter('all');
    setStageScope('all');
  };

  const renderLeadStatusPill = (lead: SalesLead) => {
    const detail = lead.subStatusDetail || (lead.subscriptionStatus === 'active' ? 'active_paid' : 'free_tier');
    const expFormatted = formatDate(lead.expiresAt);
    const now = new Date();
    const expDate = lead.expiresAt ? new Date(lead.expiresAt) : null;
    const daysLeft = expDate ? Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24)) : null;
    const priceFormatted = lead.planPricePaise
      ? ` • ₹${(lead.planPricePaise / 100).toLocaleString('en-IN')}`
      : '';

    // 1. Active Paid: Single clean emerald pill
    if (detail === 'active_paid' || lead.salesStage === 'won') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '2px 8px',
            borderRadius: '5px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            fontSize: '0.67rem',
            fontWeight: 700,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={`Active Paid Subscription. Plan: ${lead.planLabel || 'Paid'}${priceFormatted}${expFormatted ? ` • till ${expFormatted}` : ''}`}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lead.planLabel || 'Paid Plan'}{priceFormatted}{expFormatted ? ` • till ${expFormatted}` : ''}
          </span>
        </span>
      );
    }

    // 2. Active Free Trial: Single clean purple pill
    if (detail === 'active_trial' || lead.salesStage === 'demo_trial') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '5px',
            backgroundColor: '#faf5ff',
            border: '1px solid #ddd6fe',
            color: '#7e22ce',
            fontSize: '0.67rem',
            fontWeight: 700,
          }}
          title={`Free Trial Active. Ends: ${lead.expiresAt ? new Date(lead.expiresAt).toLocaleDateString() : 'Soon'}`}
        >
          <Clock size={11} style={{ color: '#9333ea', flexShrink: 0 }} />
          Free Trial {daysLeft !== null && daysLeft >= 0 ? `(${daysLeft}d left)` : expFormatted ? `• till ${expFormatted}` : ''}
        </span>
      );
    }

    // 3. Free Trial Expired: Single clean rose pill
    if (detail === 'expired_trial') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '5px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.67rem',
            fontWeight: 650,
          }}
          title="Free Trial ended. Follow-up pitch needed."
        >
          <AlertCircle size={11} style={{ color: '#ef4444', flexShrink: 0 }} />
          Trial Ended {expFormatted ? `(${expFormatted})` : ''}
        </span>
      );
    }

    // 4. Paid Subscription Expired: Single clean orange pill
    if (detail === 'expired_paid') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '5px',
            backgroundColor: '#fff7ed',
            border: '1px solid #fed7aa',
            color: '#c2410c',
            fontSize: '0.67rem',
            fontWeight: 700,
          }}
          title="Paid plan ended. Renewal follow-up required."
        >
          <RefreshCw size={11} style={{ color: '#ea580c', flexShrink: 0 }} />
          {lead.planLabel || 'Plan'} Expired {expFormatted ? `(${expFormatted})` : ''}
        </span>
      );
    }

    // 5. Connected specific service tag on free tier (e.g. Telesub, WhatsApp)
    const service = lead.serviceLabel && lead.serviceLabel !== 'Free Tier' ? lead.serviceLabel : null;
    if (service) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '1px 6px',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '0.64rem',
            fontWeight: 600,
          }}
        >
          {service}
        </span>
      );
    }

    // Raw free tier leads have no extra boxes, keeping the card clean and uncluttered
    return null;
  };

  const getSelectStyle = (isActive: boolean): React.CSSProperties => ({
    height: '32px',
    padding: '0 24px 0 9px',
    borderRadius: '6px',
    border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
    backgroundColor: isActive ? '#eff6ff' : '#ffffff',
    color: isActive ? '#1d4ed8' : '#334155',
    fontSize: '0.74rem',
    fontWeight: isActive ? 650 : 500,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '11px',
    transition: 'all 120ms ease',
    flexShrink: 0,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, flex: 1 }}>
      {/* ─── 1. Header & Live Funnel Metrics Ribbon ─── */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        {/* Row 1: Title, Count, Scope Tabs & Interactive KPIs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          {/* Left: Pipeline Title + Count Badge + Funnel Stage Segmented Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Pipeline
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid #dbeafe',
                }}
              >
                {filteredLeads.length} {filteredLeads.length === allLeads.length ? 'Leads' : `/ ${allLeads.length}`}
              </span>
            </div>

            {/* Funnel Stage View Segmented Control */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                padding: '2px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              {(
                [
                  { id: 'all', label: 'All Stages' },
                  { id: 'active', label: 'Active Funnel' },
                  { id: 'closed', label: 'Follow-ups & Won' },
                ] as const
              ).map((scope) => {
                const active = stageScope === scope.id;
                return (
                  <button
                    key={scope.id}
                    onClick={() => setStageScope(scope.id)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.73rem',
                      fontWeight: active ? 700 : 500,
                      backgroundColor: active ? '#ffffff' : 'transparent',
                      color: active ? '#0f172a' : '#64748b',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    {scope.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Modern Interactive KPI Chips + Sync Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Won / Converted Chip */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'active_paid' ? 'all' : 'active_paid')}
              title="Click to filter converted paying customers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '7px',
                border: statusFilter === 'active_paid' ? '1px solid #86efac' : '1px solid #e2e8f0',
                backgroundColor: statusFilter === 'active_paid' ? '#ecfdf5' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#15803d' }}>
                Won ({metrics.activePaid})
              </span>
            </button>

            {/* In Free Trial Chip */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'active_trial' ? 'all' : 'active_trial')}
              title="Click to filter active free trial leads"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '7px',
                border: statusFilter === 'active_trial' ? '1px solid #d8b4fe' : '1px solid #e2e8f0',
                backgroundColor: statusFilter === 'active_trial' ? '#faf5ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              <Clock size={12} style={{ color: '#9333ea' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#7e22ce' }}>
                Free Trial ({metrics.activeTrial})
              </span>
            </button>

            {/* Trial Expired Chip */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'expired_trial' ? 'all' : 'expired_trial')}
              title="Click to filter leads whose free trial ended"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '7px',
                border: statusFilter === 'expired_trial' ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                backgroundColor: statusFilter === 'expired_trial' ? '#fef2f2' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              <AlertCircle size={12} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#b91c1c' }}>
                Trial Ended ({metrics.expiredTrial})
              </span>
            </button>

            {/* Renewal Due Chip */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'expired_paid' ? 'all' : 'expired_paid')}
              title="Click to filter customers due for subscription renewal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '7px',
                border: statusFilter === 'expired_paid' ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                backgroundColor: statusFilter === 'expired_paid' ? '#fff7ed' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              <RefreshCw size={12} style={{ color: '#ea580c' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#c2410c' }}>
                Renewals Due ({metrics.expiredPaid})
              </span>
            </button>

            {/* Sync CRM Button */}
            <button
              onClick={handleManualSync}
              disabled={syncing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '31px',
                padding: '0 12px',
                fontSize: '0.74rem',
                fontWeight: 650,
                color: '#334155',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '7px',
                cursor: syncing ? 'wait' : 'pointer',
                transition: 'all 120ms ease',
              }}
              title="Sync latest GetAiPilot users, subscriptions, and prune deleted accounts"
            >
              <RefreshCw size={12} className={syncing ? 'sales-spin' : ''} style={{ color: '#475569' }} />
              <span>{syncing ? 'Syncing…' : 'Sync CRM'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search & Multi-Dimensional Filter Bar (Guaranteed Single Row, No Wrapping) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'nowrap',
            overflowX: 'auto',
          }}
        >
          {/* Left Group: Search + Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 10px',
                height: '32px',
                borderRadius: '6px',
                border: search ? '1px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                width: '230px',
                flexShrink: 0,
                transition: 'border-color 120ms ease',
              }}
            >
              <Search size={13} style={{ color: search ? '#2563eb' : '#94a3b8', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.75rem',
                  color: '#0f172a',
                  width: '100%',
                  backgroundColor: 'transparent',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />

            {/* Service Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={getSelectStyle(serviceFilter !== 'all')}
              title="Filter by connected service"
            >
              <option value="all">All Services</option>
              <option value="All-In-One AI Suite">⚡ All-In-One Suite</option>
              <option value="Telesub (Telegram)">✈️ Telesub (Telegram)</option>
              <option value="WhatsApp Automation">💬 WhatsApp Auto</option>
              <option value="CRM Operations">📊 CRM Ops</option>
              <option value="Free Trial">⏱️ Free Trial</option>
              <option value="Free Tier">👤 Free Tier</option>
            </select>

            {/* Customer Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={getSelectStyle(statusFilter !== 'all')}
              title="Filter by customer subscription status"
            >
              <option value="all">All Statuses</option>
              <option value="active_paid">🟢 Active Paid ({metrics.activePaid})</option>
              <option value="active_trial">🟣 In Free Trial ({metrics.activeTrial})</option>
              <option value="expired_trial">🔴 Trial Expired ({metrics.expiredTrial})</option>
              <option value="expired_paid">🟠 Renewal Due ({metrics.expiredPaid})</option>
              <option value="free_tier">⚪ Free Tier / Prospects</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              style={getSelectStyle(repFilter !== 'all')}
              title="Filter by assigned representative"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned Only</option>
              {adminProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email || p.id.slice(0, 8)}
                </option>
              ))}
            </select>

            {/* Source / Platform Filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              style={getSelectStyle(platformFilter !== 'all')}
              title="Filter by signup channel / platform"
            >
              <option value="all">All Sources</option>
              <option value="google">Google OAuth</option>
              <option value="truecaller">Truecaller</option>
              <option value="email">Email / OTP</option>
              <option value="phone">Phone</option>
            </select>

            {/* Clear Filters Button */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  height: '30px',
                  padding: '0 8px',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.73rem',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontWeight: 650,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                <RotateCcw size={11} />
                Reset
              </button>
            )}
          </div>

          {/* Right: Deals count */}
          <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Showing <strong>{filteredLeads.length}</strong> of {allLeads.length} deals
          </span>
        </div>
      </div>

      {/* ─── 3. Full-Bleed Kanban Board ─── */}
      <div
        className="sales-pipeline-board"
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '14px 18px 20px',
          display: 'flex',
          gap: '12px',
          backgroundColor: '#f1f5f9',
          minHeight: 0,
        }}
      >
        {visibleStages.map((stage) => {
          const config = STAGE_CONFIG[stage];
          const stageLeads = columns[stage] || [];
          const isOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverStage !== stage) setDragOverStage(stage);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverStage(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStage(null);
                if (draggedLead && draggedLead.salesStage !== stage) {
                  onDrop(draggedLead, stage);
                }
                onDrag(null);
              }}
              style={{
                flex: '0 0 280px',
                width: '280px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: isOver ? '#eff6ff' : config.columnBg,
                borderRadius: '10px',
                border: isOver ? '2px dashed #2563eb' : `1px solid ${config.columnBorder}`,
                boxShadow: isOver ? '0 4px 16px rgba(37,99,235,0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
                height: '100%',
                maxHeight: '100%',
                minHeight: 0,
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: '9px 12px',
                  borderBottom: `1px solid ${config.columnBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  borderTopLeftRadius: '9px',
                  borderTopRightRadius: '9px',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: config.dotColor,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', fontWeight: 750, color: '#0f172a' }}>
                    {config.label}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    backgroundColor: config.badgeBg,
                    color: config.badgeText,
                    border: `1px solid ${config.dotColor}33`,
                  }}
                >
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards Container */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minHeight: 0,
                }}
              >
                {stageLeads.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      minHeight: '90px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '8px',
                      color: '#94a3b8',
                      fontSize: '0.72rem',
                      fontStyle: 'italic',
                      padding: '12px',
                      textAlign: 'center',
                    }}
                  >
                    No deals in {config.label}
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                    const isBeingDragged = draggedLead?.id === lead.id;
                    const followup = formatFollowup(lead.nextFollowUpAt);
                    const repName = lead.assignedTo ? repNameMap.get(lead.assignedTo) : null;
                    const priceFormatted = lead.planPricePaise
                      ? `₹${(lead.planPricePaise / 100).toLocaleString('en-IN')}`
                      : null;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', lead.id);
                          onDrag(lead);
                        }}
                        onDragEnd={() => onDrag(null)}
                        onClick={() => onOpenLead(lead.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          padding: '10px 11px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '7px',
                          cursor: 'grab',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
                          opacity: isBeingDragged ? 0.4 : 1,
                          transform: isBeingDragged ? 'scale(0.98)' : 'none',
                          transition: 'border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isBeingDragged) {
                            e.currentTarget.style.borderColor = '#2563eb';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isBeingDragged) {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)';
                          }
                        }}
                      >
                        {/* 1. Top: Name, Platform Badge & WhatsApp */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 750,
                              color: '#0f172a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                            }}
                            title={lead.fullName}
                          >
                            {lead.fullName}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <SignupMethodBadge method={lead.signupMethod} size="xs" />
                            {cleanPhone.length >= 10 && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Chat on WhatsApp"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '4px',
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  color: '#16a34a',
                                  textDecoration: 'none',
                                }}
                              >
                                <MessageCircle size={10} />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* 2. Status / Plan Pill (Single clean pill, only when relevant) */}
                        {(() => {
                          const pill = renderLeadStatusPill(lead);
                          return pill ? <div style={{ display: 'flex', alignItems: 'center' }}>{pill}</div> : null;
                        })()}

                        {/* 4. Contact details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.7rem', color: '#64748b' }}>
                          {lead.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                              <Mail size={11} style={{ flexShrink: 0, color: '#94a3b8' }} />
                              <a
                                href={`mailto:${lead.email}`}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  color: '#475569',
                                  textDecoration: 'none',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                                title={`Email: ${lead.email}`}
                              >
                                {lead.email}
                              </a>
                            </div>
                          )}
                          {lead.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} style={{ flexShrink: 0, color: '#059669' }} />
                              <a
                                href={`tel:${cleanPhone}`}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  color: '#047857',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                                title={`Call: ${lead.phone}`}
                              >
                                {lead.phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* 5. Footer Badges: Rep & Follow-up */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '4px',
                            paddingTop: '5px',
                            borderTop: '1px solid #f1f5f9',
                            flexWrap: 'wrap',
                          }}
                        >
                          {repName ? (
                            <span
                              style={{
                                fontSize: '0.64rem',
                                color: '#2563eb',
                                fontWeight: 650,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <User size={10} />
                              {repName}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.64rem', color: '#94a3b8' }}>
                              Unassigned
                            </span>
                          )}

                          {followup && (
                            <span
                              style={{
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: followup.isOverdue ? '#fef2f2' : '#fffbeb',
                                color: followup.isOverdue ? '#dc2626' : '#b45309',
                                border: `1px solid ${followup.isOverdue ? '#fecaca' : '#fde68a'}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                              title={`Next Follow-up: ${followup.text}`}
                            >
                              <Calendar size={9} />
                              {followup.text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
