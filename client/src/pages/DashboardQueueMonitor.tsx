import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
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

const buildTrendData = (logs: ActivityLog[]) => {
  if (logs.length === 0) return [];

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

  if (parsedLogs.length === 0) return [];

  parsedLogs.sort((a, b) => a.date.getTime() - b.date.getTime());

  const firstDate = parsedLogs[0].date;
  const lastDate = parsedLogs[parsedLogs.length - 1].date;
  const isSameDay = firstDate.toDateString() === lastDate.toDateString();

  const buckets = new Map<string, { name: string; volume: number; delivered: number; failed: number }>();

  if (isSameDay) {
    const hourFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    parsedLogs.forEach((log) => {
      const name = hourFormatter.format(log.date);
      const bucket = buckets.get(name) ?? { name, volume: 0, delivered: 0, failed: 0 };
      bucket.volume += 1;
      if (log.status === 'Delivered' || log.status === 'Sent') bucket.delivered += 1;
      if (log.status === 'Failed' || log.status === 'Bounced') bucket.failed += 1;
      buckets.set(name, bucket);
    });
  } else {
    const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    parsedLogs.forEach((log) => {
      const name = dayFormatter.format(log.date);
      const bucket = buckets.get(name) ?? { name, volume: 0, delivered: 0, failed: 0 };
      bucket.volume += 1;
      if (log.status === 'Delivered' || log.status === 'Sent') bucket.delivered += 1;
      if (log.status === 'Failed' || log.status === 'Bounced') bucket.failed += 1;
      buckets.set(name, bucket);
    });
  }

  const chartData = Array.from(buckets.values());

  if (chartData.length === 1) {
    return [
      { name: 'Start', volume: 0, delivered: 0, failed: 0 },
      chartData[0]
    ];
  }

  return chartData.slice(-10);
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
      trendData: buildTrendData(logs),
      typeData: Object.entries(typeMap).map(([name, value]) => ({ name, value })),
      waitingJobs,
      delayedJobs,
    };
  }, [jobs, logs]);

  const effectiveLogs = logs;

  const filteredLogs = effectiveLogs.filter((l) =>
    `${l.recipient} ${l.provider} ${l.type} ${l.status}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayMetrics = [
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
      value: analytics.queuePressure || toNumber(metrics[0]?.value) || 0,
      subtitle: `${analytics.activeJobs} active, ${analytics.waitingJobs} waiting`,
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
    {
      title: 'Provider coverage',
      value: analytics.providerData.length,
      subtitle: 'ZeptoMail, SES, Resend routes',
      change: 'balanced',
      icon: ServerCog,
      tone: 'neutral',
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
          <div className="dashboard-live-card">
            <span>System health</span>
            <strong>Telemetry online</strong>
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
        <article className="dashboard-panel dashboard-panel-large">
          <div className="dashboard-panel-header">
            <div>
              <span>Throughput</span>
              <h3>Volume and delivered mail</h3>
            </div>
            <p>Last 7 active days</p>
          </div>
          <div className="dashboard-chart tall">
            <ResponsiveContainer>
              <AreaChart data={analytics.trendData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D4F3C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0D4F3C" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#676D63' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#676D63' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #D9D6CD' }} />
                <Area type="monotone" dataKey="volume" stroke="#0D4F3C" strokeWidth={3} fill="url(#volumeFill)" />
                <Line type="monotone" dataKey="delivered" stroke="#24754E" strokeWidth={3} dot={{ r: 3, fill: '#24754E' }} />
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
          <div className="dashboard-radial">
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
            <ResponsiveContainer>
              <BarChart data={analytics.providerData} margin={{ top: 8, right: 0, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#676D63' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#676D63' }} />
                <Tooltip cursor={{ fill: '#F8F8F6' }} contentStyle={{ borderRadius: 8, border: '1px solid #D9D6CD' }} />
                <Bar dataKey="value" fill="#0D4F3C" radius={[6, 6, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
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
                <i style={{ width: `${Math.min(100, Number(item.value) * 3)}%`, background: statusColors[item.name] ?? '#676D63' }} />
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
                  filteredLogs.map((log) => (
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
