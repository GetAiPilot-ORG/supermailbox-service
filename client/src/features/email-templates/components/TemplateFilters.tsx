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
      <option value="all">All Categories</option>
      <option value="confirm_email">Signup & Email Verification</option>
      <option value="ai_lifecycle_followup">AI Lifecycle Follow-up</option>
      <option value="reset_password">Password Reset & Recovery</option>
      <option value="magic_link_otp">Magic Link & OTP Login</option>
      <option value="change_email">Email Address Change</option>
      <option value="invite_user">Team & Workspace Invites</option>
      <option value="reauthentication">Security Re-Authentication</option>
      <option value="waitlist_notification">Feature Waitlist Notification</option>
      <option value="review_notification">New Review Notification</option>
      <option value="newsletter_notification">Newsletter Signup Notification</option>
      <option value="campaigns">Campaigns &amp; Remaining Templates</option>
      <option value="gap_whatsapp">WhatsApp Broadcasts & Alerts</option>
      <option value="socialpilot">SocialPilot & AutoDM</option>
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
