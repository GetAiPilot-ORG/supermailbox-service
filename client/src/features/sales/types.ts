export const SALES_STAGES = [
  'unreviewed',
  'qualified',
  'contacting',
  'engaged',
  'demo_trial',
  'nurture',
  'won',
  'lost',
  'unqualified',
] as const;

export type SalesStage = typeof SALES_STAGES[number];
export type IntentBand = 'cold' | 'warm' | 'high_intent' | 'sales_ready';
export type LifecycleState = 'registered' | 'unverified' | 'onboarding_pending' | 'onboarding_in_progress' | 'onboarding_dropoff' | 'onboarding_completed' | 'post_onboarding_inactive' | 'activated';

export type SignupMethod = 'email' | 'google' | 'truecaller' | 'phone' | 'unknown';

export type LeadStatus =
  | 'new'
  | 'extracted'
  | 'assigned'
  | 'contacted'
  | 'interested'
  | 'not_interested'
  | 'converted'
  | 'follow_up'
  | 'lost';

export const ALL_LEAD_STATUSES: LeadStatus[] = [
  'new',
  'extracted',
  'assigned',
  'contacted',
  'interested',
  'not_interested',
  'converted',
  'follow_up',
  'lost',
];

export type SubscriptionStatus = 'free' | 'active' | 'trial' | 'expired' | 'none' | 'cancelled';

export type SalesTab = 'all' | 'new' | 'extracted' | 'active' | 'truecaller';

export interface AdminProfile {
  id: string;
  full_name: string | null;
  email?: string;
  role?: string;
}

export interface SalesLead {
  id: string;
  productCode: string;
  externalUserId: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  accountType: string;
  planLabel?: string;
  signupMethod?: SignupMethod;
  leadStatus?: LeadStatus;
  isExtracted?: boolean;
  extractedAt?: string | null;
  assignedTo?: string | null;
  notes?: string | null;
  lastContactedAt?: string | null;
  country: string | null;
  registeredAt: string;
  identityVerified: boolean;
  onboardingStarted: boolean;
  onboardingStartedAt: string | null;
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
  activated: boolean;
  activatedAt: string | null;
  pricingViewedAt: string | null;
  lastProductActivityAt: string | null;
  subscriptionStatus: 'none' | 'active' | 'cancelled' | 'free' | 'trial' | 'expired';
  subStatusDetail?: 'active_paid' | 'active_trial' | 'expired_trial' | 'expired_paid' | 'free_tier';
  service?: string;
  serviceLabel?: string;
  planPricePaise?: number | null;
  expiresAt?: string | null;
  startedAt?: string | null;
  isTrial?: boolean;
  lifecycleState: LifecycleState;
  salesStage: SalesStage;
  intentScore: number;
  intentBand: IntentBand;
  nextFollowUpAt: string | null;
  convertedAt: string | null;
  conversionSource: 'product_event' | 'manual' | null;
  lostReason: string | null;
  lastSyncedAt: string | null;
  updatedAt: string;
  sourceSnapshot?: Record<string, unknown>;
}

export interface CrmActivity {
  id: string;
  leadId: string;
  type: string;
  body: string | null;
  metadata: Record<string, unknown>;
  actor: string;
  occurredAt: string;
}

export interface CrmTask {
  id: string;
  leadId: string;
  title: string;
  dueAt: string;
  status: 'open' | 'done' | 'cancelled';
  completedAt: string | null;
  createdAt: string;
  lead?: SalesLead;
}

export interface SupportTicket {
  id: string;
  leadId: string;
  subject: string;
  description: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: SalesLead;
}

export interface LeadDetail {
  lead: SalesLead;
  activities: CrmActivity[];
  tasks: CrmTask[];
  tickets: SupportTicket[];
}

export interface SalesOverview {
  rangeDays: number;
  metrics: {
    registered: number;
    onboardingCompleted: number;
    onboardingRate: number;
    activated: number;
    activationRate: number;
    converted: number;
    conversionRate: number;
    openTickets: number;
  };
  funnel: Record<'registered' | 'verified' | 'onboardingStarted' | 'onboardingCompleted' | 'activated' | 'converted', number>;
  pipeline: Record<SalesStage, number>;
  signals: {
    overdueTasks: CrmTask[];
    hotLeads: SalesLead[];
    onboardingDropoffs: SalesLead[];
    urgentTickets: SupportTicket[];
  };
  sync: null | {
    lastSuccessAt: string | null;
    lastError: string | null;
    recordsSeen: number;
    stale: boolean;
  };
}

export interface StageMeta {
  id: SalesStage;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  columnBg: string;
  columnBorder: string;
  category: 'active' | 'closed';
}

export const STAGE_CONFIG: Record<SalesStage, StageMeta> = {
  unreviewed: {
    id: 'unreviewed',
    label: 'New Leads',
    dotColor: '#6366f1',
    badgeBg: '#eef2ff',
    badgeText: '#4338ca',
    columnBg: '#f8fafc',
    columnBorder: '#e2e8f0',
    category: 'active',
  },
  qualified: {
    id: 'qualified',
    label: 'Qualified',
    dotColor: '#8b5cf6',
    badgeBg: '#f5f3ff',
    badgeText: '#6d28d9',
    columnBg: '#f8fafc',
    columnBorder: '#e2e8f0',
    category: 'active',
  },
  contacting: {
    id: 'contacting',
    label: 'Contacting',
    dotColor: '#2563eb',
    badgeBg: '#eff6ff',
    badgeText: '#1d4ed8',
    columnBg: '#f8fafc',
    columnBorder: '#e2e8f0',
    category: 'active',
  },
  engaged: {
    id: 'engaged',
    label: 'In Conversation',
    dotColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeText: '#0369a1',
    columnBg: '#f8fafc',
    columnBorder: '#e2e8f0',
    category: 'active',
  },
  demo_trial: {
    id: 'demo_trial',
    label: 'Active Free Trial',
    dotColor: '#9333ea',
    badgeBg: '#faf5ff',
    badgeText: '#7e22ce',
    columnBg: '#faf5ff',
    columnBorder: '#e9d5ff',
    category: 'active',
  },
  nurture: {
    id: 'nurture',
    label: 'Follow Up (Expired)',
    dotColor: '#ea580c',
    badgeBg: '#fff7ed',
    badgeText: '#c2410c',
    columnBg: '#fff7ed',
    columnBorder: '#ffedd5',
    category: 'closed',
  },
  won: {
    id: 'won',
    label: 'Converted / Paid',
    dotColor: '#10b981',
    badgeBg: '#ecfdf5',
    badgeText: '#047857',
    columnBg: '#f0fdf4',
    columnBorder: '#bbf7d0',
    category: 'closed',
  },
  lost: {
    id: 'lost',
    label: 'Lost / Churned',
    dotColor: '#ef4444',
    badgeBg: '#fef2f2',
    badgeText: '#b91c1c',
    columnBg: '#fff5f5',
    columnBorder: '#fecaca',
    category: 'closed',
  },
  unqualified: {
    id: 'unqualified',
    label: 'Not a Fit',
    dotColor: '#64748b',
    badgeBg: '#f8fafc',
    badgeText: '#475569',
    columnBg: '#f8fafc',
    columnBorder: '#e2e8f0',
    category: 'closed',
  },
};

export const SERVICE_CONFIG: Record<
  string,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  'All-In-One AI Suite': {
    label: 'All-In-One Suite',
    icon: '⚡',
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
  },
  'Telesub (Telegram)': {
    label: 'Telegram Telesub',
    icon: '✈️',
    bg: '#f5f3ff',
    text: '#6d28d9',
    border: '#ddd6fe',
  },
  'WhatsApp Automation': {
    label: 'WhatsApp Auto',
    icon: '💬',
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#bbf7d0',
  },
  'WhatsApp + Trial': {
    label: 'WA + Trial',
    icon: '💬',
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#bbf7d0',
  },
  'CRM Operations': {
    label: 'CRM Ops',
    icon: '📊',
    bg: '#fff7ed',
    text: '#c2410c',
    border: '#fed7aa',
  },
  'AI Voice Calls': {
    label: 'Voice AI',
    icon: '📞',
    bg: '#fdf2f8',
    text: '#be185d',
    border: '#fbcfe8',
  },
  'Free Trial': {
    label: 'Free Trial',
    icon: '⏱️',
    bg: '#faf5ff',
    text: '#7e22ce',
    border: '#e9d5ff',
  },
  'Free Tier': {
    label: 'Free Tier',
    icon: '👤',
    bg: '#f8fafc',
    text: '#64748b',
    border: '#e2e8f0',
  },
};
