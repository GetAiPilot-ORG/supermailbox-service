import React from 'react';
import type { LeadStatus } from './types';

export const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: 'New',
    bg: '#fefce8',
    text: '#a16207',
    border: '#fef08a',
  },
  extracted: {
    label: 'New Lead',
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
  },
  assigned: {
    label: 'Assigned',
    bg: '#eef2ff',
    text: '#4338ca',
    border: '#c7d2fe',
  },
  contacted: {
    label: 'Contacted',
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
  },
  interested: {
    label: 'Interested',
    bg: '#ecfdf5',
    text: '#047857',
    border: '#a7f3d0',
  },
  not_interested: {
    label: 'Not Interested',
    bg: '#f8fafc',
    text: '#64748b',
    border: '#e2e8f0',
  },
  converted: {
    label: '✓ Converted',
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#bbf7d0',
  },
  follow_up: {
    label: 'Follow Up',
    bg: '#fffbeb',
    text: '#b45309',
    border: '#fde68a',
  },
  lost: {
    label: 'Lost',
    bg: '#fef2f2',
    text: '#b91c1c',
    border: '#fecaca',
  },
};

export const LeadStatusBadge: React.FC<{
  status: LeadStatus | string;
  size?: 'xs' | 'sm';
  className?: string;
}> = ({ status, size = 'sm', className = '' }) => {
  const normalized = (status || 'new').toLowerCase().replace(/\s+/g, '_') as LeadStatus;
  const cfg = STATUS_CONFIG[normalized] ?? {
    label: status ? status.replace(/_/g, ' ') : 'New',
    bg: '#f8fafc',
    text: '#475569',
    border: '#e2e8f0',
  };

  const isXs = size === 'xs';

  return (
    <span
      className={`sales-lead-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isXs ? '1px 6px' : '2px 8px',
        borderRadius: '4px',
        fontSize: isXs ? '0.67rem' : '0.74rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        backgroundColor: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        lineHeight: 1.4,
      }}
    >
      {cfg.label}
    </span>
  );
};
