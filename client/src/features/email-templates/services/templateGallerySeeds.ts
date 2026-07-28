import type { GalleryTemplate } from '../types/template.types';

type Seed = Pick<GalleryTemplate, 'key' | 'name' | 'category' | 'industry' | 'subject' | 'preheader' | 'featured'> & { accent: string; layout: string };

const seeds: Seed[] = [
  ['blank_template', 'Blank Template', 'Blank', 'General', 'Untitled email template', 'Start with a clean responsive MJML canvas.', '#769181', 'blank', true],
  ['saas_welcome', 'SaaS Welcome', 'Welcome', 'SaaS', 'Welcome to {{company_name}}', 'Help new users take their first useful action.', '#4f6f5b', 'hero', true],
  ['account_verification', 'Account Verification', 'Verification', 'Technology', 'Verify your account', 'Confirm identity with a clear secure call to action.', '#365c8d', 'letter'],
  ['password_reset', 'Password Reset', 'Transactional', 'Technology', 'Reset your password', 'A concise password reset template for account recovery.', '#334155', 'letter'],
  ['product_launch', 'Product Launch', 'Announcement', 'SaaS', 'Introducing our newest release', 'Announce a launch with focused benefits and one CTA.', '#715a35', 'hero', true],
  ['weekly_newsletter', 'Weekly Newsletter', 'Newsletter', 'Creator', 'This week from {{company_name}}', 'A readable editorial update with one featured story.', '#4f6f5b', 'digest', true],
  ['monthly_newsletter', 'Monthly Newsletter', 'Newsletter', 'Agency', 'Monthly update from {{company_name}}', 'Summarize product, content and community updates.', '#5e6d77', 'digest'],
  ['ecommerce_promotion', 'E-commerce Promotion', 'Promotional', 'E-commerce', 'A private offer for you', 'Promote an offer without sacrificing accessibility.', '#8a4f3d', 'commerce'],
  ['abandoned_cart', 'Abandoned Cart', 'Abandoned Cart', 'E-commerce', 'Still thinking it over?', 'Recover cart intent with product context and urgency.', '#6b5b95', 'commerce'],
  ['order_confirmation', 'Order Confirmation', 'Transactional', 'Retail', 'Order {{order_id}} confirmed', 'Confirm purchase details and next steps.', '#24754e', 'receipt'],
  ['payment_confirmation', 'Payment Confirmation', 'Payment', 'Finance', 'Payment received', 'Give customers a clean payment receipt.', '#24754e', 'receipt'],
  ['event_invitation', 'Event Invitation', 'Event Invitation', 'Technology', 'You are invited', 'Invite contacts to an event with the details up front.', '#365c8d', 'event'],
  ['webinar_reminder', 'Webinar Reminder', 'Event Invitation', 'Education', 'Reminder: webinar starts soon', 'Remind registrants and reduce no-shows.', '#4f6f5b', 'event'],
  ['customer_feedback', 'Customer Feedback', 'Feedback', 'SaaS', 'How was your experience?', 'Ask for feedback with a low-friction CTA.', '#715a35', 'letter'],
  ['re_engagement', 'Re-engagement', 'Re-engagement', 'SaaS', 'Can we help you get back on track?', 'Bring inactive users back with useful context.', '#6b5b95', 'letter'],
  ['birthday_offer', 'Birthday Offer', 'Birthday', 'Retail', 'A birthday offer for you', 'Celebrate customers with a tasteful personal offer.', '#8a4f3d', 'commerce', true],
  ['product_update', 'Product Update', 'Product Update', 'SaaS', 'Product update: {{feature_name}}', 'Explain what changed and who benefits.', '#365c8d', 'digest'],
  ['agency_followup', 'Agency Proposal Follow-up', 'Lead Nurturing', 'Agency', 'Following up on your proposal', 'Follow up after a sales conversation.', '#5e6d77', 'letter'],
  ['lead_nurturing', 'Lead Nurturing', 'Lead Nurturing', 'Technology', 'A practical next step', 'Move leads toward a useful next action.', '#4f6f5b', 'letter'],
  ['creator_newsletter', 'Creator Newsletter', 'Newsletter', 'Creator', 'New notes from {{company_name}}', 'A creator-friendly update with story and CTA.', '#715a35', 'digest'],
  ['travel_promotion', 'Travel Promotion', 'Promotional', 'Travel', 'Your next trip starts here', 'Promote packages with clear travel-safe copy.', '#365c8d', 'commerce', true],
  ['course_launch', 'Education Course Launch', 'Onboarding', 'Education', 'Enrollment is open', 'Launch a course with curriculum and next steps.', '#4f6f5b', 'hero'],
  ['real_estate_listing', 'Real Estate Listing', 'Announcement', 'Real Estate', 'New listing available', 'Showcase a property with one focused CTA.', '#715a35', 'commerce', true],
  ['festival_promotion', 'Festival Promotion', 'Holiday', 'Retail', 'Festival offer from {{company_name}}', 'Seasonal promo copy with compliant footer.', '#8a4f3d', 'commerce'],
  ['nonprofit_appeal', 'Nonprofit Appeal', 'Fundraising', 'Nonprofit', 'Your support makes this possible', 'Tell a clear story and invite a donation.', '#7c3aed', 'letter'],
  ['healthcare_checkin', 'Healthcare Check-in', 'Reminder', 'Healthcare', 'A quick check-in from {{company_name}}', 'A calm reminder for patient or client follow-up.', '#0f766e', 'letter'],
  ['restaurant_special', 'Restaurant Special', 'Promotional', 'Hospitality', 'This week at {{company_name}}', 'Promote a menu special with reservation intent.', '#b45309', 'commerce'],
  ['trial_expiry', 'Trial Expiry', 'Lifecycle', 'SaaS', 'Your trial ends soon', 'Give trial users a clear next step.', '#4338ca', 'letter'],
].map(([key, name, category, industry, subject, preheader, accent, layout, featured]) => ({ key, name, category, industry, subject, preheader, accent, layout, featured } as Seed));

function previewHtml(template: Seed) {
  const side = template.layout === 'receipt' ? '<table style="width:100%;border-collapse:collapse;color:#344054"><tr><td>Reference</td><td align="right">{{order_id}}</td></tr><tr><td>Total</td><td align="right">{{amount}}</td></tr></table>' : '';
  const columns = template.layout === 'digest' ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px"><div><b>Top story</b><p>One primary update.</p></div><div><b>Quick note</b><p>One supporting link.</p></div></div>' : '';
  return `<div style="font-family:Arial,sans-serif;width:600px;margin:0 auto;background:#eef2ef;padding:24px"><div style="background:#fff;border:1px solid #dfe4ea;border-radius:8px;overflow:hidden"><div style="height:${template.layout === 'commerce' || template.layout === 'hero' ? '86px' : '10px'};background:${template.accent}"></div><div style="padding:26px"><div style="color:${template.accent};font-size:12px;font-weight:700;text-transform:uppercase">${template.category}</div><h1 style="color:#25302a;font-size:28px;line-height:34px;margin:12px 0">${template.name}</h1><p style="color:#667085;font-size:15px;line-height:24px">${template.preheader}</p>${side}${columns}<a href="#" style="display:inline-block;background:${template.accent};color:#fff;text-decoration:none;border-radius:6px;padding:12px 18px;font-weight:700;margin-top:12px">Primary action</a></div></div></div>`;
}

function mjml(template: Seed) {
  return `<mjml><mj-head><mj-title>${template.subject}</mj-title><mj-preview>${template.preheader}</mj-preview></mj-head><mj-body background-color="#eef2ef"><mj-section background-color="#ffffff" padding="28px"><mj-column><mj-text color="${template.accent}" font-size="12px" font-weight="700">${template.category.toUpperCase()}</mj-text><mj-text font-size="28px" font-weight="700">${template.name}</mj-text><mj-text color="#667085">${template.preheader}</mj-text><mj-button href="{{cta_url}}" background-color="${template.accent}">Primary action</mj-button><mj-divider border-color="#dfe4ea" /><mj-text font-size="12px" color="#667085">{{company_address}} | <a href="{{unsubscribe_url}}">Unsubscribe</a></mj-text></mj-column></mj-section></mj-body></mjml>`;
}

export const localGalleryTemplates: GalleryTemplate[] = seeds.map((template) => ({
  id: template.key,
  key: template.key,
  name: template.name,
  description: `${template.category} template for ${template.industry}.`,
  subject: template.subject,
  preheader: template.preheader,
  category: template.category,
  industry: template.industry,
  mjmlContent: mjml(template),
  compiledHtml: previewHtml(template),
  isSystemTemplate: true,
  featured: Boolean(template.featured),
  responsive: true,
  creator: 'SuperMailBox',
}));

export function filterLocalGallery(params: URLSearchParams) {
  const search = (params.get('search') || '').toLowerCase().trim();
  const category = params.get('category') || 'all';
  const industry = params.get('industry') || 'all';

  return localGalleryTemplates
    .filter((template) => !search || `${template.name} ${template.category} ${template.industry}`.toLowerCase().includes(search))
    .filter((template) => category === 'all' || template.category.toLowerCase() === category.toLowerCase())
    .filter((template) => industry === 'all' || template.industry.toLowerCase() === industry.toLowerCase());
}
