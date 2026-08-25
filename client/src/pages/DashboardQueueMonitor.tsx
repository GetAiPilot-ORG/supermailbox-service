import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Mail,
  MailCheck,
  MailWarning,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ActivityLog, MetricCardData, QueueJob } from '../services/api';

const statusColors: Record<string, string> = {
  Delivered: '#24754E',
  Sent: '#0D4F3C',
  Queued: '#F5E6C8',
  Bounced: '#A43A32',
  Failed: '#A43A32',
};

const pieColors = ['#0D4F3C', '#24754E', '#DDECE4', '#F5E6C8'];

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const cleanRecipient = (email?: string) => {
  if (!email) return '';
  return email.replace(/^camp_[a-z0-9]+_/i, '');
};

const toNumber = (value: string | number | undefined) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = Number(value.toString().replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const findMetricValue = (metrics: MetricCardData[], title: string) =>
  metrics.find((metric) => metric.title.toLowerCase() === title.toLowerCase())?.value;

const buildTrendData = (logs: ActivityLog[], range: 'today' | '7days' | '14days' | '30days' = '7days') => {
  const currentYear = new Date().getFullYear();
  const parsedLogs = logs
    .map((log) => {
      let raw = log.createdAt || log.timestamp;
      let date = new Date(raw);
      if (Number.isNaN(date.getTime())) {
        date = new Date(`${log.timestamp} ${currentYear}`);
      }
      return { ...log, date };
    })
    .filter((log) => !Number.isNaN(log.date.getTime()));

  const bucketsMap = new Map<string, {
    name: string;
    dateKey: string;
    volume: number;
    delivered: number;
    failed: number;
    queued: number;
  }>();
  const now = new Date();

  if (range === 'today') {
    for (let h = 0; h <= 21; h += 3) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, 0, 0);
      const hourFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const label = hourFormatter.format(d);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${h}`;
      bucketsMap.set(key, { name: label, dateKey: key, volume: 0, delivered: 0, failed: 0, queued: 0 });
    }

    parsedLogs.forEach((log) => {
      if (log.date.toDateString() === now.toDateString()) {
        const h = Math.floor(log.date.getHours() / 3) * 3;
        const key = `${log.date.getFullYear()}-${log.date.getMonth()}-${log.date.getDate()}-${h}`;
        const bucket = bucketsMap.get(key);
        if (bucket) {
          bucket.volume += 1;
          if (log.status === 'Delivered' || log.status === 'Sent') bucket.delivered += 1;
          else if (log.status === 'Failed' || log.status === 'Bounced') bucket.failed += 1;
          else if (log.status === 'Queued') bucket.queued += 1;
        }
      }
    });
  } else {
    const numDays = range === '30days' ? 30 : range === '14days' ? 14 : 7;
    const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = dayFormatter.format(d);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      bucketsMap.set(key, { name: label, dateKey: key, volume: 0, delivered: 0, failed: 0, queued: 0 });
    }

    parsedLogs.forEach((log) => {
      const key = `${log.date.getFullYear()}-${log.date.getMonth() + 1}-${log.date.getDate()}`;
      const bucket = bucketsMap.get(key);
      if (bucket) {
        bucket.volume += 1;
        if (log.status === 'Delivered' || log.status === 'Sent') bucket.delivered += 1;
        else if (log.status === 'Failed' || log.status === 'Bounced') bucket.failed += 1;
        else if (log.status === 'Queued') bucket.queued += 1;
      }
    });
  }

  return Array.from(bucketsMap.values());
};

interface DashboardProps {
  metrics: MetricCardData[];
  jobs: QueueJob[];
  logs: ActivityLog[];
  onRefresh: () => void;
}

export const DashboardQueueMonitor: React.FC<DashboardProps> = ({
  metrics,
  jobs,
  logs,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<QueueJob | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '14days' | '30days'>('7days');
  const itemsPerPage = 6;

  const analytics = useMemo(() => {
    const totalLogs = logs.length;
    const successful = logs.filter((l) => l.status === 'Delivered' || l.status === 'Sent').length;
    const failures = logs.filter((l) => l.status === 'Failed' || l.status === 'Bounced').length;
    const queuedLogs = logs.filter((l) => l.status === 'Queued').length;
    const activeJobs = jobs.filter((j) => j.status === 'active').length;
    const waitingJobs = jobs.filter((j) => j.status === 'waiting').length;
    const delayedJobs = jobs.filter((j) => j.status === 'delayed').length;
    const failedJobs = jobs.filter((j) => j.status === 'failed').length;
    const queuePressure = activeJobs + waitingJobs + delayedJobs;
    const deliveryRate = totalLogs > 0 ? (successful / totalLogs) * 100 : 0;
    const failureRate = totalLogs > 0 ? (failures / totalLogs) * 100 : 0;

    const providerMap = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.provider] = (acc[log.provider] ?? 0) + 1;
      return acc;
    }, {});

    const typeMap = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.type] = (acc[log.type] ?? 0) + 1;
      return acc;
    }, {});

    const statusMap = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.status] = (acc[log.status] ?? 0) + 1;
      return acc;
    }, {});

    return {
      activeJobs,
      deliveryRate,
      failedJobs,
      failureRate,
      providerData: Object.entries(providerMap).map(([name, value]) => ({ name, value })),
      queuePressure,
      queuedLogs,
      statusData: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
      successful,
      totalLogs,
      trendData: buildTrendData(logs, timeRange),
      typeData: Object.entries(typeMap).map(([name, value]) => ({ name, value })),
      waitingJobs,
      delayedJobs,
    };
  }, [jobs, logs, timeRange]);

  const effectiveLogs = logs;

  const filteredLogs = effectiveLogs.filter((l) =>
    `${l.recipient} ${l.provider} ${l.type} ${l.status}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const pagedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const maxStatusCount = Math.max(1, ...analytics.statusData.map((item) => item.value));
  const purchasedEmailCredits = 10000;
  const usedEmailCredits = analytics.totalLogs || toNumber(findMetricValue(metrics, 'Total Sent')) || 0;
  const availableEmailCredits = Math.max(0, purchasedEmailCredits - usedEmailCredits);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, logs]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const displayMetrics = [
    {
      title: 'Total mail',
      value: analytics.totalLogs || toNumber(findMetricValue(metrics, 'Total Sent')) || 0,
      subtitle: `${analytics.providerData.length} providers, ${analytics.typeData.length} mail types`,
      change: 'live',
      icon: MailCheck,
      tone: 'neutral',
    },
    {
      title: 'Delivery rate',
      value: formatPercent(analytics.deliveryRate),
      subtitle: `${analytics.successful} successful handoffs`,
      change: '0.0%',
      icon: MailCheck,
      tone: 'positive',
    },
    {
      title: 'Queue pressure',
      value: analytics.queuePressure,
      subtitle: `${analytics.activeJobs} active, ${analytics.waitingJobs} waiting, ${analytics.delayedJobs} delayed`,
      change: '0.0%',
      icon: Activity,
      tone: 'neutral',
    },
    {
      title: 'Failure rate',
      value: formatPercent(analytics.failureRate),
      subtitle: `${analytics.failedJobs} failed jobs need review`,
      change: analytics.failureRate > 2 ? '+0.6%' : '0.0%',
      icon: MailWarning,
      tone: analytics.failureRate > 2 ? 'danger' : 'positive',
    },
  ];

  return (
    <div className="dashboard-command-center fade-in">
      <section className="dashboard-command-hero" style={{ background: '#ffffff url(/bg2.jpg) no-repeat center center', backgroundSize: 'cover' }}>
        <div className="dashboard-hero-copy">
          <span className="dashboard-kicker">
            <Activity size={16} />
            SupermailBox analytics
          </span>
          <h2>Delivery command center</h2>
          <p>
            Watch campaign throughput, provider routing, queue pressure, and recent recipient activity in one operational view.
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <button className="dashboard-refresh" onClick={onRefresh} title="Refresh dashboard data">
            <RefreshCw size={16} />
            Refresh
          </button>
          <div className="dashboard-live-card">
            <span>System health</span>
            <strong>{analytics.totalLogs} events loaded</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-credits-card" aria-label="Credits information">
        <div className="dashboard-credits-body">
          <div className="dashboard-credits-icon">
            <Mail size={28} />
          </div>
          <div>
            <strong>{availableEmailCredits.toLocaleString()} emails</strong>
            <span>available out of {purchasedEmailCredits.toLocaleString()} emails purchased</span>
          </div>
        </div>
      </section>

      <section className="dashboard-kpi-grid">
        {displayMetrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.change.startsWith('+') || metric.change.startsWith('-');
          return (
            <article key={metric.title} className={`dashboard-kpi-card ${metric.tone}`}>
              <div className="dashboard-kpi-top">
                <span>{metric.title}</span>
                <Icon size={20} />
              </div>
              <strong>{metric.value}</strong>
              <div className="dashboard-kpi-bottom">
                <small>{metric.subtitle}</small>
                <b>
                  {isPositive && metric.change.startsWith('+') ? <ArrowUpRight size={14} /> : null}
                  {isPositive && metric.change.startsWith('-') ? <ArrowDownRight size={14} /> : null}
                  {metric.change}
                </b>
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-analytics-grid">
        <article className="dashboard-panel dashboard-panel-large" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>Mail analysis</h3>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: '#8B5CF6' }} /> Volume
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: '#10B981' }} /> Delivered
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: '#EF4444' }} /> Bounced/Failed
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: '#F59E0B' }} /> Queued
                </span>
              </div>
            </div>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--ink)',
                cursor: 'pointer'
              }}
            >
              <option value="7days">Last 7 days</option>
              <option value="today">Today (Hourly)</option>
              <option value="14days">Last 14 days</option>
              <option value="30days">Last 30 days</option>
            </select>
          </div>

          <div className="dashboard-chart tall" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="deliveredFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={3} fill="url(#deliveredFill)" dot={false} activeDot={{ r: 6, fill: '#10B981' }} />
                <Area type="monotone" dataKey="volume" stroke="#8B5CF6" strokeWidth={3} fill="url(#volumeFill)" dot={false} activeDot={{ r: 6, fill: '#8B5CF6' }} />
                <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="queued" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel dashboard-health-panel">
          <div className="dashboard-panel-header">
            <div>
              <span>Quality</span>
              <h3>Delivery posture</h3>
            </div>
          </div>
          <div
            className="dashboard-radial"
            style={{
              background: `conic-gradient(var(--success) 0 ${Math.round(analytics.deliveryRate)}%, var(--surface-muted) ${Math.round(analytics.deliveryRate)}% 100%)`,
            }}
          >
            <div className="dashboard-radial-score">
              <strong>{Math.round(analytics.deliveryRate)}</strong>
              <span>%</span>
            </div>
          </div>
          <div className="dashboard-health-list">
            <div>
              <CheckCircle2 size={17} />
              <span>Successful mail</span>
              <strong>{analytics.successful}</strong>
            </div>
            <div>
              <Clock3 size={17} />
              <span>Queued events</span>
              <strong>{analytics.queuedLogs}</strong>
            </div>
            <div>
              <AlertTriangle size={17} />
              <span>Needs review</span>
              <strong>{analytics.failedJobs}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-insight-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span>Providers</span>
              <h3>Route distribution</h3>
            </div>
          </div>
          <div className="dashboard-chart">
            {analytics.providerData.length === 0 ? (
              <div className="dashboard-empty-state">
                <ServerCog size={22} />
                <span>No provider data yet.</span>
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={analytics.providerData} margin={{ top: 8, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#676D63' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#676D63' }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#F8F8F6' }} contentStyle={{ borderRadius: 8, border: '1px solid #D9D6CD' }} />
                  <Bar dataKey="value" fill="#0D4F3C" radius={[6, 6, 0, 0]} barSize={34} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span>Mailbox mix</span>
              <h3>Transactional vs campaign</h3>
            </div>
          </div>
          <div className="dashboard-donut-wrap">
            {analytics.typeData.length === 0 ? (
              <div className="dashboard-empty-state">
                <MailWarning size={22} />
                <span>No mailbox mix data yet.</span>
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={analytics.typeData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={4}>
                    {analytics.typeData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #D9D6CD' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="dashboard-donut-legend">
              {analytics.typeData.map((item, index) => (
                <span key={item.name}>
                  <b style={{ background: pieColors[index % pieColors.length] }} />
                  {item.name}
                  <strong>{item.value}</strong>
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span>Status</span>
              <h3>Event outcome split</h3>
            </div>
          </div>
          <div className="dashboard-status-stack">
            {analytics.statusData.map((item) => (
              <div key={item.name}>
                <span>
                  <b style={{ background: statusColors[item.name] ?? '#676D63' }} />
                  {item.name}
                </span>
                <strong>{item.value}</strong>
                <i style={{ width: `${Math.max(6, (Number(item.value) / maxStatusCount) * 100)}%`, background: statusColors[item.name] ?? '#676D63' }} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-operations-grid">
        <article className="dashboard-panel">
          <div className="dashboard-table-header compact">
            <div>
              <span>Queue</span>
              <h2>Live jobs</h2>
            </div>
          </div>
          <div className="dashboard-job-list">
            {jobs.length === 0 ? (
              <div className="dashboard-empty-state">
                <ShieldCheck size={22} />
                <span>No active queue jobs.</span>
              </div>
            ) : (
              jobs.slice(0, 7).map((job) => (
                <button key={job.id} className="dashboard-job-row" onClick={() => setSelectedJob(job)}>
                  <span>
                    <strong>{cleanRecipient(job.recipient)}</strong>
                    <small>{job.templateKey}</small>
                  </span>
                  <b className={`queue-status ${job.status}`}>{job.status}</b>
                </button>
              ))
            )}
          </div>
        </article>

        <article className="dashboard-panel dashboard-log-panel">
          <div className="dashboard-table-header compact">
            <div>
              <span>Recent activity</span>
              <h2>Dispatch logs</h2>
            </div>
            <div className="search-shell">
              <Search size={14} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search mail, provider, status"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="dashboard-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Recipient</th>
                  <th>Type</th>
                  <th>Provider</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="dashboard-table-empty">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  pagedLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="muted-cell">{log.timestamp}</td>
                      <td className="recipient-cell">{cleanRecipient(log.recipient)}</td>
                      <td>
                        <span className="badge-pill badge-neutral">{log.type}</span>
                      </td>
                      <td className="muted-cell">{log.provider}</td>
                      <td>
                        <span className={log.status === 'Sent' || log.status === 'Delivered' ? 'badge-pill badge-success' : 'badge-pill badge-error'}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="dashboard-pagination">
            <span>
              Showing {filteredLogs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
            </span>
            <div>
              <button
                className="btn-secondary"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                className="btn-secondary"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </article>
      </section>

      {selectedJob && (
        <div className="dashboard-drawer-backdrop" onClick={() => setSelectedJob(null)}>
          <aside className="dashboard-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-drawer-header">
              <div>
                <span>Job inspector</span>
                <h3>{selectedJob.id}</h3>
              </div>
              <button onClick={() => setSelectedJob(null)} title="Close inspector">
                <X size={18} />
              </button>
            </div>
            <dl className="dashboard-drawer-details">
              <div>
                <dt>Recipient</dt>
                <dd>{cleanRecipient(selectedJob.recipient)}</dd>
              </div>
              <div>
                <dt>Template</dt>
                <dd>{selectedJob.templateKey}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selectedJob.status}</dd>
              </div>
              <div>
                <dt>Attempts</dt>
                <dd>{selectedJob.attempts}</dd>
              </div>
            </dl>
            <pre>{JSON.stringify(selectedJob.payload ?? selectedJob, null, 2)}</pre>
          </aside>
        </div>
      )}
    </div>
  );
};
