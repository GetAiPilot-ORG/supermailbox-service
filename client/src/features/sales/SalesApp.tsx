import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  CloudUpload,
  Copy,
  Crown,
  Download,
  ExternalLink,
  Eye,
  Headphones,
  HelpCircle,
  Info,
  LayoutList,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  PackagePlus,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Target,
  TicketCheck,
  User,
  UserCheck,
  UsersRound,
  X,
} from 'lucide-react';
import { CrmApi } from './crmApi';
import { LeadDetailsSheet } from './LeadDetailsSheet';
import { PipelineView } from './PipelineView';
import { SignupMethodBadge } from './SignupMethodBadge';
import {
  ALL_LEAD_STATUSES,
  SALES_STAGES,
  type AdminProfile,
  type CrmTask,
  type LeadDetail,
  type LeadStatus,
  type SalesLead,
  type SalesOverview,
  type SalesStage,
  type SalesTab,
  type SignupMethod,
  type SupportTicket,
} from './types';
import './sales.css';

type SalesView = 'today' | 'people' | 'pipeline' | 'followups' | 'support';

const STAGE_LABELS: Record<SalesStage, string> = {
  unreviewed: 'New',
  qualified: 'Good fit',
  contacting: 'Contacting',
  engaged: 'In conversation',
  demo_trial: 'Demo or trial',
  nurture: 'Follow up later',
  won: 'Converted',
  lost: 'Lost',
  unqualified: 'Not a fit',
};

const LIFECYCLE_LABELS: Record<string, string> = {
  registered: 'New user',
  unverified: 'Account not verified',
  onboarding_pending: 'Setup not started',
  onboarding_in_progress: 'Setup in progress',
  onboarding_dropoff: 'Setup left incomplete',
  onboarding_completed: 'Setup complete',
  post_onboarding_inactive: 'Setup done, not active',
  activated: 'Active user',
};

const INTENT_LABELS: Record<SalesLead['intentBand'], string> = {
  cold: 'Low interest',
  warm: 'Some interest',
  high_intent: 'High interest',
  sales_ready: 'Ready to contact',
};

const dateTime = (value?: string | null) => {
  if (!value) return 'Not recorded';
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

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

const routeToView = (path: string): SalesView => {
  if (path.startsWith('/sales/people')) return 'people';
  if (path.startsWith('/sales/pipeline')) return 'pipeline';
  if (path.startsWith('/sales/follow-ups')) return 'followups';
  if (path.startsWith('/sales/support')) return 'support';
  return 'today';
};

const viewPath: Record<SalesView, string> = {
  today: '/sales',
  people: '/sales/people',
  pipeline: '/sales/pipeline',
  followups: '/sales/follow-ups',
  support: '/sales/support',
};

const Badge: React.FC<{ tone?: string; children: React.ReactNode }> = ({ tone = 'neutral', children }) => (
  <span className={`sales-badge sales-badge--${tone}`}>{children}</span>
);

const Person: React.FC<{ lead: SalesLead; compact?: boolean }> = ({ lead, compact }) => (
  <span className={`sales-person${compact ? ' sales-person--compact' : ''}`}>
    <span className="sales-avatar" aria-hidden="true">{initials(lead.fullName)}</span>
    <span>
      <strong>{lead.fullName}</strong>
      <small>{lead.email || lead.phone || lead.externalUserId}</small>
    </span>
  </span>
);

export const SalesApp: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  const [view, setView] = useState<SalesView>(() => routeToView(window.location.pathname));
  const [overview, setOverview] = useState<SalesOverview | null>(null);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [draggedLead, setDraggedLead] = useState<SalesLead | null>(null);

  const loadData = async (options: { sync?: boolean; force?: boolean } = {}) => {
    setLoading(true);
    setError('');
    try {
      if (options.sync) {
        setSyncing(true);
        await CrmApi.sync(options.force === true);
      }
      const [overviewData, leadData, taskData, ticketData, staffData] = await Promise.all([
        CrmApi.overview('30d'),
        CrmApi.leads({ limit: 2000 }),
        CrmApi.tasks(),
        CrmApi.tickets(),
        CrmApi.staff().catch(() => [] as AdminProfile[]),
      ]);
      setOverview(overviewData);
      setLeads(leadData.items);
      setTotalLeads(leadData.total);
      setTasks(taskData);
      setTickets(ticketData);
      setAdminProfiles(staffData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sales workspace could not be loaded.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => { void loadData({ sync: true, force: true }); }, []);

  useEffect(() => {
    const onPopState = () => setView(routeToView(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const navigateView = (next: SalesView) => {
    setView(next);
    window.history.pushState(null, '', viewPath[next]);
  };

  const refresh = async () => loadData({ sync: true, force: true });
  const forceSync = async () => {
    await loadData({ sync: true, force: true });
    showToast('CRM leads synced with GetAiPilot');
  };

  const pipelineLeads = useMemo(
    () => Object.fromEntries(SALES_STAGES.map((stage) => [stage, leads.filter((lead) => lead.salesStage === stage)])) as Record<SalesStage, SalesLead[]>,
    [leads]
  );

  const changeStage = async (lead: SalesLead, nextStage: SalesStage) => {
    const previous = lead.salesStage;
    setLeads((items) => items.map((item) => (item.id === lead.id ? { ...item, salesStage: nextStage } : item)));
    try {
      await CrmApi.updateLead(lead.id, { salesStage: nextStage });
      showToast(`${lead.fullName} moved to ${STAGE_LABELS[nextStage]}.`);
      if (['nurture', 'lost'].includes(nextStage)) {
        setSelectedLeadId(lead.id);
      }
      await refresh();
    } catch (err) {
      setLeads((items) => items.map((item) => (item.id === lead.id ? { ...item, salesStage: previous } : item)));
      setError(err instanceof Error ? err.message : 'Stage update failed.');
    }
  };

  const completeTask = async (task: CrmTask) => {
    await CrmApi.updateTask(task.id, { status: task.status === 'done' ? 'open' : 'done' });
    await refresh();
  };

  const updateTicketStatus = async (ticket: SupportTicket, status: SupportTicket['status']) => {
    await CrmApi.updateTicket(ticket.id, { status });
    await refresh();
  };

  const navItems: Array<{ id: SalesView; label: string; icon: React.ElementType }> = [
    { id: 'today', label: 'Today', icon: LayoutList },
    { id: 'people', label: 'People', icon: UsersRound },
    { id: 'pipeline', label: 'Pipeline', icon: BarChart3 },
    { id: 'followups', label: 'Follow-ups', icon: Clock3 },
    { id: 'support', label: 'Support', icon: TicketCheck },
  ];

  return (
    <div className="sales-shell">
      <aside className="sales-sidebar">
        <button className="sales-brand" onClick={() => onNavigate('/workspace')} aria-label="Choose workspace">
          <img src="/logo.jpg" alt="" />
          <span>
            <strong>SuperMail</strong>
            <small>Sales &amp; Support</small>
          </span>
        </button>
        <nav aria-label="Sales workspace navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? 'active' : ''}
                onClick={() => navigateView(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="sales-workspace-switch" onClick={() => onNavigate('/workspace')}>
          <ArrowLeftRight size={17} />
          <span>Switch workspace</span>
        </button>
      </aside>

      <main className={`sales-main sales-main-${view}`}>
        {toast && (
          <div className="sales-toast" role="status">
            <CheckCircle2 size={17} />
            {toast}
          </div>
        )}

        <header className="sales-command-bar">
          <div>
            <h1>{view === 'today' ? 'Today' : navItems.find((item) => item.id === view)?.label}</h1>
          
          </div>
          <div className="sales-command-actions">
            <span className={`sales-sync-state${overview?.sync?.stale ? ' is-stale' : ''}`}>
              <CircleDot size={14} />
              {overview?.sync?.lastSuccessAt ? `Synced ${dateTime(overview.sync.lastSuccessAt)}` : 'Not synced yet'}
            </span>
          </div>
        </header>

        {error && (
          <div className="sales-page-error">
            <AlertCircle size={20} />
            <div>
              <strong>We could not load the sales data</strong>
              <p>{error}</p>
            </div>
            <button onClick={() => loadData({ sync: true })}>Try again</button>
            <button onClick={() => onNavigate('/dashboard')}>Open Mail Operations</button>
          </div>
        )}

        {loading && !overview ? (
          <SalesPageSkeleton />
        ) : (
          overview && (
            <>
              {view === 'today' && <TodayView overview={overview} onOpenLead={setSelectedLeadId} />}
              {view === 'people' && (
                <PeopleView
                  allLeads={leads}
                  totalLeads={totalLeads}
                  adminProfiles={adminProfiles}
                  onOpenLead={setSelectedLeadId}
                  onRefresh={forceSync}
                  onShowToast={showToast}
                />
              )}
              {view === 'pipeline' && (
                <PipelineView
                  allLeads={leads}
                  adminProfiles={adminProfiles}
                  draggedLead={draggedLead}
                  onDrag={setDraggedLead}
                  onDrop={changeStage}
                  onOpenLead={setSelectedLeadId}
                  onRefresh={forceSync}
                  onShowToast={showToast}
                />
              )}
              {view === 'followups' && <FollowUpsView tasks={tasks} onToggle={completeTask} onOpenLead={setSelectedLeadId} />}
              {view === 'support' && <SupportView tickets={tickets} onUpdate={updateTicketStatus} onOpenLead={setSelectedLeadId} />}
            </>
          )
        )}
      </main>

      {/* Comprehensive Lead Dossier Sheet */}
      <LeadDetailsSheet
        leadId={selectedLeadId}
        adminProfiles={adminProfiles}
        onClose={() => setSelectedLeadId(null)}
        onChanged={refresh}
      />
    </div>
  );
};

const SalesPageSkeleton = () => (
  <div className="sales-page-skeleton">
    <span />
    <span />
    <span />
    <span />
    <span />
    <div />
    <div />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   EXECUTIVE PEOPLE / SALES LEADS VIEW (GETAIPILOT-INSPIRED EXECUTIVE SYSTEM)
   ══════════════════════════════════════════════════════════════════════════ */

const SALES_STAGE_OPTIONS: { id: LeadStatus; label: string; dot: string; color: string }[] = [
  { id: 'new', label: 'New', dot: '#64748b', color: '#334155' },
  { id: 'contacted', label: 'Contacted', dot: '#2563eb', color: '#1d4ed8' },
  { id: 'follow_up', label: 'Follow Up', dot: '#d97706', color: '#b45309' },
  { id: 'interested', label: 'Interested', dot: '#059669', color: '#047857' },
  { id: 'converted', label: 'Won', dot: '#10b981', color: '#047857' },
  { id: 'not_interested', label: 'Not Interested', dot: '#94a3b8', color: '#64748b' },
  { id: 'lost', label: 'Lost', dot: '#ef4444', color: '#b91c1c' },
];

function getLeadStageInfo(lead: SalesLead): { id: LeadStatus; label: string; dot: string; color: string } {
  const raw = (lead.leadStatus || (lead.salesStage !== 'unreviewed' ? lead.salesStage : 'new')).toLowerCase();
  if (raw === 'extracted' || raw === 'new' || raw === 'unreviewed') {
    return { id: 'new', label: 'New', dot: '#64748b', color: '#334155' };
  }
  if (raw === 'contacted') {
    return { id: 'contacted', label: 'Contacted', dot: '#2563eb', color: '#1d4ed8' };
  }
  if (raw === 'follow_up' || raw === 'followup') {
    return { id: 'follow_up', label: 'Follow Up', dot: '#d97706', color: '#b45309' };
  }
  if (raw === 'interested' || raw === 'qualified' || raw === 'negotiating') {
    return { id: 'interested', label: 'Interested', dot: '#059669', color: '#047857' };
  }
  if (raw === 'converted' || raw === 'won') {
    return { id: 'converted', label: 'Won', dot: '#10b981', color: '#047857' };
  }
  if (raw === 'not_interested') {
    return { id: 'not_interested', label: 'Not Interested', dot: '#94a3b8', color: '#64748b' };
  }
  if (raw === 'lost') {
    return { id: 'lost', label: 'Lost', dot: '#ef4444', color: '#b91c1c' };
  }
  return { id: 'new', label: 'New', dot: '#64748b', color: '#334155' };
}

interface PeopleViewProps {
  allLeads: SalesLead[];
  totalLeads: number;
  adminProfiles: AdminProfile[];
  onOpenLead: (id: string) => void;
  onRefresh: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

const PeopleView: React.FC<PeopleViewProps> = ({
  allLeads,
  adminProfiles,
  onOpenLead,
  onRefresh,
  onShowToast,
}) => {
  // Tabs: 'all' | 'new' | 'extracted' | 'active' | 'truecaller'
  const [activeTab, setActiveTab] = useState<SalesTab>('all');

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const hasActiveFilters = Boolean(searchInput || appliedSearch || platformFilter !== 'all' || leadStatusFilter !== 'all');

  // Multi-selection & Batch Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [extractConfirm, setExtractConfirm] = useState<null | 'selected' | 'all_new'>(null);
  const [extracting, setExtracting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const closeMenu = () => setOpenStatusMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Compute live tab counts
  const counts = useMemo(() => {
    const total = allLeads.length;
    const newCount = allLeads.filter((r) => !r.isExtracted || r.leadStatus === 'new' || r.salesStage === 'unreviewed').length;
    const extractedCount = allLeads.filter((r) => r.isExtracted || (r.leadStatus && r.leadStatus !== 'new') || r.salesStage !== 'unreviewed').length;
    const activeCount = allLeads.filter((r) => r.subscriptionStatus === 'active').length;
    const truecallerCount = allLeads.filter((r) => r.signupMethod === 'truecaller').length;
    return { total, newCount, extractedCount, activeCount, truecallerCount };
  }, [allLeads]);

  // Client-side filtering
  const filteredRows = useMemo(() => {
    let list = allLeads;

    // 1. Primary Tab filter
    switch (activeTab) {
      case 'new':
        list = list.filter((r) => !r.isExtracted || r.leadStatus === 'new' || r.salesStage === 'unreviewed');
        break;
      case 'extracted':
        list = list.filter((r) => r.isExtracted || (r.leadStatus && r.leadStatus !== 'new') || r.salesStage !== 'unreviewed');
        break;
      case 'active':
        list = list.filter((r) => r.subscriptionStatus === 'active');
        break;
      case 'truecaller':
        list = list.filter((r) => r.signupMethod === 'truecaller');
        break;
      default:
        break;
    }

    // 2. Search filter
    if (appliedSearch) {
      const q = appliedSearch.trim().toLowerCase();
      const qDigits = q.replace(/\D/g, '');

      list = list.filter((r) => {
        const phone = r.phone || '';
        const phoneDigits = phone.replace(/\D/g, '');

        const phoneMatches = Boolean(
          (phone && phone.toLowerCase().includes(q)) ||
            (qDigits.length > 0 &&
              phoneDigits &&
              (phoneDigits.includes(qDigits) ||
                (qDigits.length >= 10 && qDigits.includes(phoneDigits)) ||
                (qDigits.startsWith('91') && qDigits.length > 2 && phoneDigits.includes(qDigits.slice(2))) ||
                (phoneDigits.startsWith('91') && phoneDigits.length > 2 && phoneDigits.slice(2).includes(qDigits))))
        );

        return (
          r.fullName?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          phoneMatches ||
          r.externalUserId?.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      });
    }

    // 3. Platform filter
    if (platformFilter !== 'all') {
      list = list.filter((r) => r.signupMethod === platformFilter);
    }

    // 4. Lead Status filter
    if (leadStatusFilter !== 'all') {
      if (leadStatusFilter === 'unextracted') {
        list = list.filter((r) => !r.isExtracted || r.leadStatus === 'new' || r.salesStage === 'unreviewed');
      } else {
        list = list.filter((r) => r.leadStatus === leadStatusFilter);
      }
    }

    return list;
  }, [allLeads, activeTab, appliedSearch, platformFilter, leadStatusFilter]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const allPageSelected = pagedRows.length > 0 && pagedRows.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allPageSelected) {
      pagedRows.forEach((r) => next.delete(r.id));
    } else {
      pagedRows.forEach((r) => next.add(r.id));
    }
    setSelectedIds(next);
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSearch = () => {
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput('');
    setAppliedSearch('');
    setPlatformFilter('all');
    setLeadStatusFilter('all');
    setPage(1);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleInlineStatusChange = async (lead: SalesLead, status: LeadStatus) => {
    try {
      await CrmApi.updateLead(lead.id, { leadStatus: status });
      onShowToast(`Lead status updated to ${status}`);
      await onRefresh();
    } catch (e: any) {
      onShowToast(e?.message || 'Status update failed');
    }
  };

  // CSV Export
  const exportCsv = (rowsToExport: SalesLead[]) => {
    const headers = [
      'User ID',
      'Customer Name',
      'Email',
      'Phone',
      'Connected Platform',
      'Subscription Plan',
      'Account Status',
      'Lead Status',
      'Sales Stage',
      'Assigned Rep',
      'Next Follow-up',
      'Last Contacted',
      'Notes',
      'Joined Date',
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const lines = [
      headers.join(','),
      ...rowsToExport.map((row) =>
        [
          escapeCsv(row.externalUserId || row.id),
          escapeCsv(row.fullName),
          escapeCsv(row.email || ''),
          escapeCsv(row.phone || ''),
          escapeCsv(row.signupMethod || 'unknown'),
          escapeCsv(row.planLabel || row.accountType || 'Free Tier'),
          escapeCsv(row.subscriptionStatus || 'free'),
          escapeCsv(row.leadStatus || (row.salesStage !== 'unreviewed' ? 'extracted' : 'new')),
          escapeCsv(STAGE_LABELS[row.salesStage] || row.salesStage),
          escapeCsv(row.assignedTo || ''),
          escapeCsv(row.nextFollowUpAt || ''),
          escapeCsv(row.lastContactedAt || ''),
          escapeCsv(row.notes || ''),
          escapeCsv(row.registeredAt || ''),
        ].join(',')
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SuperMail_Sales_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Sales leads exported as CSV');
  };

  // Extraction logic
  const doExtract = async (mode: 'selected' | 'all_new') => {
    setExtracting(true);
    try {
      let idsToExtract: string[] = [];
      if (mode === 'selected') {
        idsToExtract = Array.from(selectedIds);
      }
      const res = await CrmApi.extractLeads({
        ids: mode === 'selected' ? idsToExtract : undefined,
        allNew: mode === 'all_new' ? true : undefined,
      });
      onShowToast(`${res.extracted} leads extracted into pipeline`);
      setSelectedIds(new Set());
      await onRefresh();
    } catch (e: any) {
      onShowToast(e?.message || 'Extraction failed');
    } finally {
      setExtracting(false);
      setExtractConfirm(null);
    }
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onShowToast(`${label} copied to clipboard`);
    } catch {
      onShowToast(`Could not copy ${label}`);
    }
  };

  const newUsersInView = filteredRows.filter((r) => !r.isExtracted || r.leadStatus === 'new' || r.salesStage === 'unreviewed').length;
  const startRecord = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, filteredRows.length);

  return (
    <div className="sales-leads-card">
      {/* ─── 1. Header Tabs Row ─── */}
      <div className="sales-leads-tab-row">
        <div className="sales-leads-tabs-list">
          <button
            type="button"
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={`sales-leads-tab-btn ${activeTab === 'all' ? 'is-active' : ''}`}
          >
            All Leads <span className="sales-leads-tab-count">{counts.total}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('new'); setPage(1); }}
            className={`sales-leads-tab-btn ${activeTab === 'new' ? 'is-active' : ''}`}
          >
            Fresh Leads <span className="sales-leads-tab-count">{counts.newCount}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('extracted'); setPage(1); }}
            className={`sales-leads-tab-btn ${activeTab === 'extracted' ? 'is-active' : ''}`}
          >
            In Pipeline <span className="sales-leads-tab-count">{counts.extractedCount}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('active'); setPage(1); }}
            className={`sales-leads-tab-btn ${activeTab === 'active' ? 'is-active' : ''}`}
          >
            Active Subscribers <span className="sales-leads-tab-count">{counts.activeCount}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('truecaller'); setPage(1); }}
            className={`sales-leads-tab-btn ${activeTab === 'truecaller' ? 'is-active' : ''}`}
          >
            Truecaller Leads <span className="sales-leads-tab-count">{counts.truecallerCount}</span>
          </button>
        </div>

        <div className="sales-leads-subbar-actions">
          <button
            type="button"
            onClick={() => exportCsv(filteredRows)}
            className="sales-btn-xs sales-btn-outline"
          >
            <Download size={13} style={{ color: '#64748b' }} />
            Export All (CSV)
          </button>

          {newUsersInView > 0 && (
            <button
              type="button"
              onClick={() => setExtractConfirm('all_new')}
              disabled={extracting}
              className="sales-btn-xs sales-btn-primary"
            >
              {extracting ? <Loader2 size={13} className="sales-spin" /> : <PackagePlus size={13} />}
              Process Leads ({newUsersInView})
            </button>
          )}

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="sales-btn-xs sales-btn-outline"
            style={{ height: '30px', padding: '0 12px', fontSize: '0.74rem', gap: '6px' }}
            title="Sync latest leads & prune deleted accounts"
          >
            {refreshing ? <Loader2 size={13} className="sales-spin" /> : <RefreshCw size={13} />}
            {refreshing ? 'Syncing…' : 'Sync CRM'}
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="sales-btn-xs sales-btn-outline sales-btn-icon"
            title="Refresh & sync leads"
          >
            <RotateCcw size={13} className={refreshing ? 'sales-spin' : ''} />
          </button>
        </div>
      </div>

      
      <div className="sales-leads-subbar"></div>

      {/* ─── 3. Search & Filter Bar (Single-Line Compact Executive Toolbar) ─── */}
      <div className="sales-leads-filter-grid">
        {/* Customer Search with embedded icon */}
        <div className="sales-search-box-wrap">
          <Search size={14} className="sales-search-icon" />
          <input
            type="text"
            className="sales-search-input"
            placeholder="Search name, email, or phone"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                setPage(1);
              }}
              className="sales-search-clear-inline"
              title="Clear search text"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Platform Dropdown */}
        <select
          value={platformFilter}
          onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
          className="sales-filter-select sales-filter-platform"
          title="Filter by platform"
        >
          <option value="all">Platform: All</option>
          <option value="google">Google</option>
          <option value="email">Email</option>
          <option value="truecaller">Truecaller</option>
          <option value="phone">Mobile OTP</option>
        </select>

        {/* Sales Stage Dropdown */}
        <select
          value={leadStatusFilter}
          onChange={(e) => { setLeadStatusFilter(e.target.value); setPage(1); }}
          className="sales-filter-select sales-filter-stage"
          title="Filter by sales stage"
        >
          <option value="all">Stage: All Stages</option>
          <option value="unextracted">Stage: Fresh Leads</option>
          {SALES_STAGE_OPTIONS.filter((s) => s.id !== 'new').map((s) => (
            <option key={s.id} value={s.id}>
              Stage: {s.label}
            </option>
          ))}
        </select>

        {/* Count Dropdown */}
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="sales-filter-select sales-filter-count"
          title="Rows per page"
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>

        {/* Action Buttons */}
        <button
          type="button"
          onClick={handleSearch}
          className="sales-btn-xs sales-btn-primary sales-filter-search-btn"
        >
          <Search size={13} />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          className={`sales-filter-clear-btn ${hasActiveFilters ? 'is-active' : ''}`}
          title="Reset search and filters"
        >
          <RotateCcw size={12} />
          <span>Clear</span>
        </button>
      </div>

      {/* ─── Batch Actions Banner (when rows selected) ─── */}
      {selectedIds.size > 0 && (
        <div className="sales-batch-banner">
          <div>
            <strong>{selectedIds.size}</strong> lead{selectedIds.size === 1 ? '' : 's'} selected
          </div>
          <div className="sales-batch-banner-actions">
            <button
              type="button"
              onClick={() => setExtractConfirm('selected')}
              disabled={extracting}
              className="sales-btn-xs sales-btn-primary"
            >
              <PackagePlus size={13} />
              Add Selected to Pipeline ({selectedIds.size})
            </button>
            <button
              type="button"
              onClick={() => exportCsv(filteredRows.filter((r) => selectedIds.has(r.id)))}
              className="sales-btn-xs sales-btn-outline"
            >
              <Download size={13} />
              Export Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="sales-btn-xs sales-btn-outline"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* ─── 4. Table ─── */}
      <div className="sales-leads-table-container">
        {filteredRows.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
            <UsersRound size={32} style={{ color: '#cbd5e1', margin: '0 auto 10px' }} />
            <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.9rem' }}>No leads found</strong>
            <p style={{ margin: '4px 0 0' }}>Try adjusting your search or clear one of the filters.</p>
          </div>
        ) : (
          <table className="sales-leads-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                    aria-label="Select all rows"
                  />
                </th>
                <th style={{ width: '26%' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>Lead Profile</span>
                    <div className="sales-info-popover-wrap">
                      <button
                        type="button"
                        className="sales-info-icon-btn"
                        aria-label="Info about signup methods"
                      >
                        <Info size={11} />
                      </button>
                      <div className="sales-info-popover-box">
                        <strong style={{ display: 'block', marginBottom: '6px', color: '#0f172a' }}>
                          Signup Source &amp; Methods:
                        </strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <img src="/Google.webp" alt="Google" style={{ width: 14, height: 14, marginTop: '2px', flexShrink: 0 }} />
                            <span><strong>Google:</strong> User ne 1-click "Continue with Google" OAuth SSO se sign in kiya.</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <img src="/Gmail.webp" alt="Email" style={{ width: 14, height: 14, marginTop: '2px', flexShrink: 0 }} />
                            <span><strong>Email:</strong> User ne manual email daal kar Email OTP code se signup kiya.</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <img src="/trucaller.png" alt="Truecaller" style={{ width: 14, height: 14, marginTop: '2px', flexShrink: 0 }} />
                            <span><strong>Truecaller:</strong> User ne Truecaller app 1-tap mobile verification se signup kiya.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </th>
                <th style={{ width: '22%' }}>Plan &amp; Subscription</th>
                <th style={{ width: '26%' }}>Contact Channels</th>
                <th style={{ width: '18%' }}>Sales Stage</th>
                <th style={{ width: '80px', textAlign: 'right', paddingRight: '16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((lead) => {
                const isSelected = selectedIds.has(lead.id);
                const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');

                return (
                  <tr key={lead.id} className={isSelected ? 'is-selected' : ''}>
                    {/* 1. Checkbox */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(lead.id)}
                        style={{ cursor: 'pointer' }}
                        aria-label={`Select ${lead.fullName}`}
                      />
                    </td>

                    {/* 2. Lead Profile */}
                    <td>
                      <div className="sales-cell-person">
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => onOpenLead(lead.id)}
                              className="sales-lead-name-btn"
                            >
                              {lead.fullName || 'Customer'}
                            </button>
                            <SignupMethodBadge method={lead.signupMethod} />
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                            {lead.registeredAt ? `Joined ${new Date(lead.registeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Plan & Subscription */}
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#0f172a' }}>
                          {lead.planLabel || lead.accountType || 'Free Tier'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', marginTop: '3px', color: '#64748b' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 500,
                              color:
                                lead.subscriptionStatus === 'active'
                                  ? '#059669'
                                  : lead.subscriptionStatus === 'trial'
                                  ? '#4f46e5'
                                  : lead.subscriptionStatus === 'expired'
                                  ? '#e11d48'
                                  : '#64748b',
                            }}
                          >
                            <span
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor:
                                  lead.subscriptionStatus === 'active'
                                    ? '#10b981'
                                    : lead.subscriptionStatus === 'trial'
                                    ? '#6366f1'
                                    : lead.subscriptionStatus === 'expired'
                                    ? '#f43f5e'
                                    : '#94a3b8',
                              }}
                            />
                            <span style={{ textTransform: 'capitalize' }}>
                              {lead.subscriptionStatus === 'active'
                                ? 'Active'
                                : lead.subscriptionStatus === 'trial'
                                ? 'Trial'
                                : lead.subscriptionStatus === 'expired'
                                ? 'Expired'
                                : 'Free'}
                            </span>
                          </span>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{ color: lead.onboardingCompleted ? '#059669' : '#94a3b8' }}>
                            {lead.onboardingCompleted ? 'Setup complete' : 'Setup pending'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 5. Contact Channels */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {lead.email ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.73rem', color: '#334155' }}>
                            <Mail size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px', fontWeight: 500 }}>
                              {lead.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => copy(lead.email!, 'Email')}
                              className="sales-copy-icon-btn"
                              title="Copy email"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        ) : null}

                        {lead.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.73rem', color: '#475569' }}>
                            <Phone size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 500 }}>
                              {lead.phone.startsWith('+') ? lead.phone : `+${cleanPhone}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => copy(lead.phone!, 'Phone')}
                              className="sales-copy-icon-btn"
                              title="Copy phone"
                            >
                              <Copy size={10} />
                            </button>
                            {cleanPhone.length >= 10 && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="sales-wa-link"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={10} />
                                WA
                              </a>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            No phone on file
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Sales Stage (Interactive Dropdown + Follow-up Subtext) */}
                    <td>
                      {(() => {
                        const stageInfo = getLeadStageInfo(lead);
                        const isMenuOpen = openStatusMenuId === lead.id;

                        let subtext = 'No follow-up set';
                        if (lead.nextFollowUpAt) {
                          subtext = `Follow-up ${new Date(lead.nextFollowUpAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                        } else if (lead.lastContactedAt) {
                          subtext = `Contacted ${new Date(lead.lastContactedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                        } else if (stageInfo.id === 'new') {
                          subtext = 'Fresh lead';
                        }

                        return (
                          <div>
                            <div className="sales-stage-dropdown-wrap">
                              <button
                                type="button"
                                className="sales-stage-trigger-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenStatusMenuId(isMenuOpen ? null : lead.id);
                                }}
                                title="Click to update sales stage"
                              >
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    backgroundColor: stageInfo.dot,
                                    display: 'inline-block',
                                    flexShrink: 0,
                                  }}
                                />
                                <span style={{ fontWeight: 600, color: stageInfo.color }}>
                                  {stageInfo.label}
                                </span>
                                <ChevronDown size={11} style={{ opacity: 0.5, marginLeft: 2 }} />
                              </button>

                              {isMenuOpen && (
                                <div
                                  className="sales-stage-dropdown-popover"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {SALES_STAGE_OPTIONS.map((opt) => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      className={`sales-stage-popover-item ${stageInfo.id === opt.id ? 'is-selected' : ''}`}
                                      onClick={() => {
                                        setOpenStatusMenuId(null);
                                        void handleInlineStatusChange(lead, opt.id);
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: 7,
                                          height: 7,
                                          borderRadius: '50%',
                                          backgroundColor: opt.dot,
                                          display: 'inline-block',
                                          flexShrink: 0,
                                        }}
                                      />
                                      <span>{opt.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>
                              {subtext}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* 7. Action */}
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      <button
                        type="button"
                        onClick={() => onOpenLead(lead.id)}
                        className="sales-inspect-link"
                      >
                        Inspect Lead →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── 5. Pagination Footer ─── */}
      <div
        className="sales-leads-pagination"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.74rem',
          color: '#64748b',
          backgroundColor: '#ffffff',
        }}
      >
        <div>
          Showing {startRecord} - {endRecord} of {filteredRows.length}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="sales-btn-xs sales-btn-outline sales-btn-icon"
          >
            <ChevronLeft size={14} />
          </button>

          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="sales-btn-xs sales-btn-outline sales-btn-icon"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ─── Extract Confirmation Modal Dialog ─── */}
      {extractConfirm && (
        <div className="sales-modal-backdrop" onClick={() => setExtractConfirm(null)}>
          <div className="sales-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              {extractConfirm === 'selected'
                ? `Extract ${selectedIds.size} Selected Leads?`
                : `Extract All ${newUsersInView} New Leads?`}
            </h3>
            <p>
              This will assign these users to the active CRM pipeline and create sales lead records.
            </p>
            <div className="sales-modal-actions">
              <button
                type="button"
                className="sales-btn-xs sales-btn-outline"
                onClick={() => setExtractConfirm(null)}
                disabled={extracting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sales-btn-xs sales-btn-primary"
                onClick={() => doExtract(extractConfirm)}
                disabled={extracting}
              >
                {extracting ? <Loader2 size={13} className="sales-spin" /> : null}
                {extracting ? 'Extracting…' : 'Yes, Extract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   TODAY, PIPELINE, FOLLOWUPS, SUPPORT VIEWS
   ══════════════════════════════════════════════════════════════════════════ */

const TodayView: React.FC<{ overview: SalesOverview; onOpenLead: (id: string) => void }> = ({ overview, onOpenLead }) => {
  const metricRows = [
    ['New users', overview.metrics.registered, 'Last 30 days'],
    ['Setup complete', overview.metrics.onboardingCompleted, `${overview.metrics.onboardingRate}% of users`],
    ['Active users', overview.metrics.activated, `${overview.metrics.activationRate}% of users`],
    ['Customers', overview.metrics.converted, `${overview.metrics.conversionRate}% converted`],
    ['Open support issues', overview.metrics.openTickets, 'Need help'],
  ];
  const funnel = [
    ['Registered', overview.funnel.registered],
    ['Verified', overview.funnel.verified],
    ['Started', overview.funnel.onboardingStarted],
    ['Completed', overview.funnel.onboardingCompleted],
    ['Activated', overview.funnel.activated],
    ['Converted', overview.funnel.converted],
  ];
  const maxFunnel = Math.max(overview.funnel.registered, 1);
  const signals = [
    ...overview.signals.overdueTasks.map((item) => ({
      id: `task-${item.id}`,
      leadId: item.leadId,
      kind: 'Follow-up overdue',
      title: item.lead?.fullName || item.title,
      detail: `${item.title} · ${dateTime(item.dueAt)}`,
      tone: 'danger',
    })),
    ...overview.signals.hotLeads.map((item) => ({
      id: `hot-${item.id}`,
      leadId: item.id,
      kind: 'High interest',
      title: item.fullName,
      detail: `${item.intentScore}/100 interest · ${LIFECYCLE_LABELS[item.lifecycleState]}`,
      tone: 'success',
    })),
    ...overview.signals.onboardingDropoffs.map((item) => ({
      id: `drop-${item.id}`,
      leadId: item.id,
      kind: 'Setup left incomplete',
      title: item.fullName,
      detail: `Last active ${dateTime(item.lastProductActivityAt)}`,
      tone: 'warning',
    })),
    ...overview.signals.urgentTickets.map((item) => ({
      id: `ticket-${item.id}`,
      leadId: item.leadId,
      kind: `${item.priority} support`,
      title: item.lead?.fullName || item.subject,
      detail: item.subject,
      tone: 'danger',
    })),
  ].slice(0, 16);

  return (
    <div className="sales-view sales-today-view">
      <section className="sales-metric-ledger" aria-label="30-day performance">
        {metricRows.map(([label, value, detail]) => (
          <div key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </div>
        ))}
      </section>
      <div className="sales-today-grid">
        <section className="sales-work-panel sales-signal-panel">
          <div className="sales-panel-heading">
            <div>
              <h2>Needs attention</h2>
              <p>Start with the people and tasks that need action first.</p>
            </div>
            <Badge tone={signals.length ? 'warning' : 'success'}>
              {signals.length} {signals.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          {signals.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing needs action now"
              copy="There are no late follow-ups, high-interest new leads, unfinished setups, or urgent support issues."
            />
          ) : (
            <div className="sales-signal-list">
              {signals.map((signal) => (
                <button key={signal.id} onClick={() => onOpenLead(signal.leadId)}>
                  <span className={`sales-signal-dot sales-signal-dot--${signal.tone}`} />
                  <span>
                    <small>{signal.kind}</small>
                    <strong>{signal.title}</strong>
                    <p>{signal.detail}</p>
                  </span>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          )}
          <div className="sales-queue-health" aria-label="Queue category status">
            <span><b>{overview.signals.overdueTasks.length}</b> overdue follow-ups</span>
            <span><b>{overview.signals.hotLeads.length}</b> high-interest leads</span>
            <span><b>{overview.signals.onboardingDropoffs.length}</b> unfinished setups</span>
            <span><b>{overview.signals.urgentTickets.length}</b> urgent support issues</span>
          </div>
        </section>
        <section className="sales-work-panel sales-funnel-panel">
          <div className="sales-panel-heading">
            <div>
              <h2>Customer progress</h2>
              <p>How users moved from signup to customer.</p>
            </div>
          </div>
          <div className="sales-funnel">
            {funnel.map(([label, value]) => (
              <div key={String(label)}>
                <span>
                  <strong>{label}</strong>
                  <b>{value}</b>
                </span>
                <i>
                  <em style={{ width: `${(Number(value) / maxFunnel) * 100}%` }} />
                </i>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="sales-work-panel sales-pipeline-summary">
        <div className="sales-panel-heading">
          <div>
            <h2>Sales stages</h2>
            <p>How many leads are in each step.</p>
          </div>
        </div>
        <div className="sales-pipeline-ledger" tabIndex={0} role="region" aria-label="Sales stage counts">
          {SALES_STAGES.map((stage) => (
            <div key={stage}>
              <span>{STAGE_LABELS[stage]}</span>
              <strong>{overview.pipeline[stage] || 0}</strong>
            </div>
          ))}
        </div>
        <p className="sales-scroll-hint">
          Swipe to see all sales stages <ChevronRight size={14} />
        </p>
      </section>
    </div>
  );
};


const FollowUpsView: React.FC<{
  tasks: CrmTask[];
  onToggle: (task: CrmTask) => void;
  onOpenLead: (id: string) => void;
}> = ({ tasks, onToggle, onOpenLead }) => {
  const sorted = [...tasks].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  return (
    <section className="sales-view sales-work-panel">
      <div className="sales-panel-heading">
        <div>
          <h2>Follow-ups</h2>
          <p>Tasks are sorted by due time, so the next call is easy to find.</p>
        </div>
        <Badge tone="neutral">{tasks.filter((task) => task.status === 'open').length} open</Badge>
      </div>
      {sorted.length === 0 ? (
        <EmptyState icon={Clock3} title="No follow-ups planned" copy="Open a user and create the next task." />
      ) : (
        <div className="sales-task-list">
          {sorted.map((task) => {
            const overdue = task.status === 'open' && new Date(task.dueAt).getTime() < Date.now();
            return (
              <div key={task.id} className={task.status === 'done' ? 'is-complete' : ''}>
                <button
                  className="sales-task-check"
                  onClick={() => onToggle(task)}
                  aria-label={task.status === 'done' ? 'Reopen follow-up' : 'Complete follow-up'}
                >
                  {task.status === 'done' && <Check size={15} />}
                </button>
                <button className="sales-task-copy" onClick={() => onOpenLead(task.leadId)}>
                  <strong>{task.title}</strong>
                  <span>{task.lead?.fullName || 'Customer record'}</span>
                </button>
                <Badge tone={overdue ? 'danger' : task.status === 'done' ? 'success' : 'neutral'}>
                  {task.status === 'done' ? 'Completed' : overdue ? 'Late' : dateTime(task.dueAt)}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

const SupportView: React.FC<{
  tickets: SupportTicket[];
  onUpdate: (ticket: SupportTicket, status: SupportTicket['status']) => void;
  onOpenLead: (id: string) => void;
}> = ({ tickets, onUpdate, onOpenLead }) => (
  <section className="sales-view sales-work-panel">
    <div className="sales-panel-heading">
      <div>
        <h2>Customer support</h2>
        <p>Keep every customer problem here until it is solved.</p>
      </div>
      <Badge tone="neutral">{tickets.filter((ticket) => !['resolved', 'closed'].includes(ticket.status)).length} active</Badge>
    </div>
    {tickets.length === 0 ? (
      <EmptyState icon={Headphones} title="No support issues" copy="Open a user and create a support ticket when they need help." />
    ) : (
      <div className="sales-ticket-list">
        {tickets.map((ticket) => (
          <article key={ticket.id}>
            <button className="sales-ticket-person" onClick={() => onOpenLead(ticket.leadId)}>
              <Person
                lead={ticket.lead || ({ fullName: 'Customer', email: null, phone: null, externalUserId: ticket.leadId } as SalesLead)}
                compact
              />
            </button>
            <div className="sales-ticket-copy">
              <strong>{ticket.subject}</strong>
              {ticket.description && <p>{ticket.description}</p>}
              <small>Opened {dateTime(ticket.createdAt)}</small>
            </div>
            <Badge tone={ticket.priority}>{ticket.priority}</Badge>
            <select
              aria-label={`Status for ${ticket.subject}`}
              value={ticket.status}
              onChange={(event) => onUpdate(ticket, event.target.value as SupportTicket['status'])}
            >
              <option value="open">Open</option>
              <option value="in_progress">Working on it</option>
              <option value="waiting">Waiting for customer</option>
              <option value="resolved">Solved</option>
              <option value="closed">Closed</option>
            </select>
          </article>
        ))}
      </div>
    )}
  </section>
);

const EmptyState: React.FC<{ icon: React.ElementType; title: string; copy: string }> = ({ icon: Icon, title, copy }) => (
  <div className="sales-empty-state">
    <Icon size={24} />
    <strong>{title}</strong>
    <p>{copy}</p>
  </div>
);
