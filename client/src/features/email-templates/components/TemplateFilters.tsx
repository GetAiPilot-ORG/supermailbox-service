import React from 'react';
import { Search } from 'lucide-react';

type Props = {
  search: string;
  category: string;
  industry?: string;
  status?: string;
  onChange: (patch: Record<string, string>) => void;
  gallery?: boolean;
};

export const TemplateFilters: React.FC<Props> = ({ search, category, industry = 'all', status = 'all', onChange, gallery }) => (
  <div className="template-filter-bar">
    <label className="search-shell template-search">
      <Search size={17} />
      <input value={search} onChange={(event) => onChange({ search: event.target.value })} placeholder="Search templates" />
    </label>
    <select className="ui-input" value={category} onChange={(event) => onChange({ category: event.target.value })} aria-label="Category filter">
      <option value="all">All types</option>
      <option value="Newsletter">Newsletter</option>
      <option value="Promotional">Promotional</option>
      <option value="Welcome">Welcome</option>
      <option value="Transactional">Transactional</option>
      <option value="Verification">Verification</option>
      <option value="Payment">Payment</option>
      <option value="Lead Nurturing">Lead Nurturing</option>
    </select>
    <select className="ui-input" value={industry} onChange={(event) => onChange({ industry: event.target.value })} aria-label="Industry filter">
      <option value="all">All industries</option>
      <option value="SaaS">SaaS</option>
      <option value="E-commerce">E-commerce</option>
      <option value="Education">Education</option>
      <option value="Finance">Finance</option>
      <option value="Travel">Travel</option>
      <option value="Agency">Agency</option>
      <option value="Creator">Creator</option>
    </select>
    {gallery ? (
      <select className="ui-input" value="all" onChange={() => undefined} aria-label="Gallery scope filter" disabled>
        <option value="all">All templates</option>
      </select>
    ) : (
      <select className="ui-input" value={status} onChange={(event) => onChange({ status: event.target.value })} aria-label="Status filter">
        <option value="all">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    )}
  </div>
);
