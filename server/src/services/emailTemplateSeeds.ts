export type EmailTemplateSeed = {
  key: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  subject: string;
  preheader: string;
  featured?: boolean;
  mjml: string;
};

type SeedInput = Omit<EmailTemplateSeed, 'mjml' | 'description'> & {
  accent: string;
  layout: 'blank' | 'hero' | 'digest' | 'receipt' | 'event' | 'commerce' | 'letter';
  image?: string;
  cta: string;
};

const footer = `
  <mj-section padding="10px 24px 28px" background-color="#ffffff">
    <mj-column>
      <mj-divider border-color="#dfe4ea"></mj-divider>
      <mj-text font-size="12px" color="#667085" line-height="18px" align="center">
        {{company_name}} | {{company_address}}<br />
        <a href="{{unsubscribe_url}}" style="color:#4f6f5b;">Unsubscribe</a> | <a href="{{preferences_url}}" style="color:#4f6f5b;">Preferences</a> | {{current_year}}
      </mj-text>
    </mj-column>
  </mj-section>
`;

const blankBody = `<mj-section padding="34px 24px" background-color="#ffffff"><mj-column><mj-text font-size="28px" font-weight="700" align="center">Start with a clean canvas</mj-text><mj-text align="center" color="#667085">Drag blocks into this responsive MJML template.</mj-text><mj-button href="{{cta_url}}">Primary action</mj-button></mj-column></mj-section>`;

function body(input: SeedInput) {
  if (input.layout === 'blank') return blankBody;
  if (input.layout === 'receipt') return `<mj-section background-color="#ffffff" padding="24px"><mj-column><mj-text color="${input.accent}" font-size="12px" font-weight="700">${input.category.toUpperCase()}</mj-text><mj-text font-size="26px" font-weight="700">${input.name}</mj-text><mj-table color="#344054" font-size="14px"><tr><td>Reference</td><td align="right">{{order_id}}</td></tr><tr><td>Total</td><td align="right">{{amount}}</td></tr><tr><td>Status</td><td align="right">Confirmed</td></tr></mj-table><mj-button align="left" href="{{cta_url}}" background-color="${input.accent}">${input.cta}</mj-button></mj-column></mj-section>`;
  if (input.layout === 'digest') return `<mj-section background-color="#ffffff" padding="24px"><mj-column><mj-text color="${input.accent}" font-size="12px" font-weight="700">${input.category.toUpperCase()}</mj-text><mj-text font-size="30px" font-weight="700" line-height="36px">${input.name}</mj-text><mj-text color="#667085">${input.preheader}</mj-text></mj-column></mj-section><mj-section background-color="#ffffff" padding="0 24px 24px"><mj-column><mj-text font-size="18px" font-weight="700">Top story</mj-text><mj-text color="#475467">Use this slot for the one update readers should not miss.</mj-text></mj-column><mj-column><mj-text font-size="18px" font-weight="700">Quick note</mj-text><mj-text color="#475467">Add a smaller story, link, or roundup item.</mj-text></mj-column></mj-section>`;
  if (input.layout === 'event') return `<mj-section background-color="${input.accent}" padding="28px 24px"><mj-column><mj-text color="#ffffff" font-size="12px" font-weight="700">${input.category.toUpperCase()}</mj-text><mj-text color="#ffffff" font-size="32px" font-weight="700" line-height="38px">${input.name}</mj-text><mj-text color="#eef2ff">{{event_date}} at {{event_time}}</mj-text><mj-button href="{{cta_url}}" background-color="#ffffff" color="${input.accent}">${input.cta}</mj-button></mj-column></mj-section><mj-section background-color="#ffffff" padding="22px 24px"><mj-column><mj-text color="#475467">Hi {{first_name}}, save your seat and add the session to your calendar.</mj-text></mj-column></mj-section>`;
  if (input.layout === 'commerce') return `<mj-section background-color="#ffffff" padding="0"><mj-column><mj-image src="${input.image}" alt="${input.name}" /></mj-column></mj-section><mj-section background-color="#ffffff" padding="24px"><mj-column><mj-text color="${input.accent}" font-size="12px" font-weight="700">${input.category.toUpperCase()}</mj-text><mj-text font-size="30px" font-weight="700">${input.name}</mj-text><mj-text color="#667085">${input.preheader}</mj-text><mj-button align="left" href="{{cta_url}}" background-color="${input.accent}">${input.cta}</mj-button></mj-column></mj-section>`;
  if (input.layout === 'letter') return `<mj-section background-color="#ffffff" padding="28px 30px"><mj-column><mj-text font-size="16px" color="#475467">Hi {{first_name}},</mj-text><mj-text font-size="28px" font-weight="700" line-height="34px">${input.name}</mj-text><mj-text color="#475467">${input.preheader}</mj-text><mj-text color="#475467">Add the specific context here, then close with one action that feels useful.</mj-text><mj-button align="left" href="{{cta_url}}" background-color="${input.accent}">${input.cta}</mj-button></mj-column></mj-section>`;
  return `<mj-section background-color="#ffffff" padding="0"><mj-column><mj-image src="${input.image}" alt="${input.name}" /></mj-column></mj-section><mj-section background-color="#ffffff" padding="26px 24px"><mj-column><mj-text color="${input.accent}" align="center" font-size="12px" font-weight="700">${input.category.toUpperCase()}</mj-text><mj-text align="center" font-size="32px" font-weight="700" line-height="38px">${input.name}</mj-text><mj-text align="center" color="#667085">${input.preheader}</mj-text><mj-button href="{{cta_url}}" background-color="${input.accent}">${input.cta}</mj-button></mj-column></mj-section>`;
}

const makeTemplate = (input: SeedInput): EmailTemplateSeed => ({
  ...input,
  description: `${input.category} email for ${input.industry} teams with editable MJML sections.`,
  featured: input.featured || ['saas_welcome', 'weekly_newsletter', 'product_launch', 'blank_template'].includes(input.key),
  mjml: `<mjml><mj-head><mj-title>${input.subject}</mj-title><mj-preview>${input.preheader}</mj-preview><mj-attributes><mj-all font-family="Arial, Helvetica, sans-serif"></mj-all><mj-text color="#25302a" font-size="15px" line-height="24px"></mj-text><mj-button border-radius="6px" font-weight="700"></mj-button></mj-attributes></mj-head><mj-body background-color="#eef2ef">${body(input)}${footer}</mj-body></mjml>`,
});

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=960&q=80`;

export const blankMjml = makeTemplate({ key: 'blank_template', name: 'Blank Template', category: 'Blank', industry: 'General', subject: 'Untitled email template', preheader: 'Start with a clean responsive MJML canvas.', accent: '#769181', layout: 'blank', cta: 'Start Editing' }).mjml;

export const systemTemplateSeeds: EmailTemplateSeed[] = [
  makeTemplate({ key: 'blank_template', name: 'Blank Template', category: 'Blank', industry: 'General', subject: 'Untitled email template', preheader: 'Start with a clean responsive MJML canvas.', accent: '#769181', layout: 'blank', cta: 'Start Editing' }),
  makeTemplate({ key: 'saas_welcome', name: 'SaaS Welcome', category: 'Welcome', industry: 'SaaS', subject: 'Welcome to {{company_name}}', preheader: 'Help new users take their first useful action.', accent: '#4f6f5b', layout: 'hero', image: img('photo-1497366754035-f200968a6e72'), cta: 'Open Dashboard' }),
  makeTemplate({ key: 'account_verification', name: 'Account Verification', category: 'Verification', industry: 'Technology', subject: 'Verify your account', preheader: 'Confirm identity with a clear secure call to action.', accent: '#365c8d', layout: 'letter', cta: 'Verify Account' }),
  makeTemplate({ key: 'password_reset', name: 'Password Reset', category: 'Transactional', industry: 'Technology', subject: 'Reset your password', preheader: 'A concise password reset template for account recovery.', accent: '#334155', layout: 'letter', cta: 'Reset Password' }),
  makeTemplate({ key: 'product_launch', name: 'Product Launch', category: 'Announcement', industry: 'SaaS', subject: 'Introducing our newest release', preheader: 'Announce a launch with focused benefits and one CTA.', accent: '#715a35', layout: 'hero', image: img('photo-1451187580459-43490279c0fa'), cta: 'Explore Release' }),
  makeTemplate({ key: 'weekly_newsletter', name: 'Weekly Newsletter', category: 'Newsletter', industry: 'Creator', subject: 'This week from {{company_name}}', preheader: 'A readable editorial update with one featured story.', accent: '#4f6f5b', layout: 'digest', cta: 'Read More' }),
  makeTemplate({ key: 'monthly_newsletter', name: 'Monthly Newsletter', category: 'Newsletter', industry: 'Agency', subject: 'Monthly update from {{company_name}}', preheader: 'Summarize product, content and community updates.', accent: '#5e6d77', layout: 'digest', cta: 'View Updates' }),
  makeTemplate({ key: 'ecommerce_promotion', name: 'E-commerce Promotion', category: 'Promotional', industry: 'E-commerce', subject: 'A private offer for you', preheader: 'Promote an offer without sacrificing accessibility.', accent: '#8a4f3d', layout: 'commerce', image: img('photo-1441986300917-64674bd600d8'), cta: 'Shop Now' }),
  makeTemplate({ key: 'abandoned_cart', name: 'Abandoned Cart', category: 'Abandoned Cart', industry: 'E-commerce', subject: 'Still thinking it over?', preheader: 'Recover cart intent with product context and urgency.', accent: '#6b5b95', layout: 'commerce', image: img('photo-1556742049-0cfed4f6a45d'), cta: 'Return To Cart' }),
  makeTemplate({ key: 'order_confirmation', name: 'Order Confirmation', category: 'Transactional', industry: 'Retail', subject: 'Order {{order_id}} confirmed', preheader: 'Confirm purchase details and next steps.', accent: '#24754e', layout: 'receipt', cta: 'View Order' }),
  makeTemplate({ key: 'payment_confirmation', name: 'Payment Confirmation', category: 'Payment', industry: 'Finance', subject: 'Payment received', preheader: 'Give customers a clean payment receipt.', accent: '#24754e', layout: 'receipt', cta: 'Download Receipt' }),
  makeTemplate({ key: 'event_invitation', name: 'Event Invitation', category: 'Event Invitation', industry: 'Technology', subject: 'You are invited', preheader: 'Invite contacts to an event with the details up front.', accent: '#365c8d', layout: 'event', cta: 'Reserve Seat' }),
  makeTemplate({ key: 'webinar_reminder', name: 'Webinar Reminder', category: 'Event Invitation', industry: 'Education', subject: 'Reminder: webinar starts soon', preheader: 'Remind registrants and reduce no-shows.', accent: '#4f6f5b', layout: 'event', cta: 'Join Webinar' }),
  makeTemplate({ key: 'customer_feedback', name: 'Customer Feedback', category: 'Feedback', industry: 'SaaS', subject: 'How was your experience?', preheader: 'Ask for feedback with a low-friction CTA.', accent: '#715a35', layout: 'letter', cta: 'Share Feedback' }),
  makeTemplate({ key: 're_engagement', name: 'Re-engagement', category: 'Re-engagement', industry: 'SaaS', subject: 'Can we help you get back on track?', preheader: 'Bring inactive users back with useful context.', accent: '#6b5b95', layout: 'letter', cta: 'Resume Setup' }),
  makeTemplate({ key: 'birthday_offer', name: 'Birthday Offer', category: 'Birthday', industry: 'Retail', subject: 'A birthday offer for you', preheader: 'Celebrate customers with a tasteful personal offer.', accent: '#8a4f3d', layout: 'commerce', image: img('photo-1513151233558-d860c5398176'), cta: 'Claim Offer' }),
  makeTemplate({ key: 'product_update', name: 'Product Update', category: 'Product Update', industry: 'SaaS', subject: 'Product update: {{feature_name}}', preheader: 'Explain what changed and who benefits.', accent: '#365c8d', layout: 'digest', cta: 'See What Changed' }),
  makeTemplate({ key: 'agency_followup', name: 'Agency Proposal Follow-up', category: 'Lead Nurturing', industry: 'Agency', subject: 'Following up on your proposal', preheader: 'Follow up after a sales conversation.', accent: '#5e6d77', layout: 'letter', cta: 'Review Proposal' }),
  makeTemplate({ key: 'lead_nurturing', name: 'Lead Nurturing', category: 'Lead Nurturing', industry: 'Technology', subject: 'A practical next step', preheader: 'Move leads toward a useful next action.', accent: '#4f6f5b', layout: 'letter', cta: 'Book A Call' }),
  makeTemplate({ key: 'creator_newsletter', name: 'Creator Newsletter', category: 'Newsletter', industry: 'Creator', subject: 'New notes from {{company_name}}', preheader: 'A creator-friendly update with story and CTA.', accent: '#715a35', layout: 'digest', cta: 'Read The Note' }),
  makeTemplate({ key: 'travel_promotion', name: 'Travel Promotion', category: 'Promotional', industry: 'Travel', subject: 'Your next trip starts here', preheader: 'Promote packages with clear travel-safe copy.', accent: '#365c8d', layout: 'commerce', image: img('photo-1507525428034-b723cf961d3e'), cta: 'Browse Trips' }),
  makeTemplate({ key: 'course_launch', name: 'Education Course Launch', category: 'Onboarding', industry: 'Education', subject: 'Enrollment is open', preheader: 'Launch a course with curriculum and next steps.', accent: '#4f6f5b', layout: 'hero', image: img('photo-1522202176988-66273c2fd55f'), cta: 'Enroll Now' }),
  makeTemplate({ key: 'real_estate_listing', name: 'Real Estate Listing', category: 'Announcement', industry: 'Real Estate', subject: 'New listing available', preheader: 'Showcase a property with one focused CTA.', accent: '#715a35', layout: 'commerce', image: img('photo-1560518883-ce09059eeffa'), cta: 'View Listing' }),
  makeTemplate({ key: 'festival_promotion', name: 'Festival Promotion', category: 'Holiday', industry: 'Retail', subject: 'Festival offer from {{company_name}}', preheader: 'Seasonal promo copy with compliant footer.', accent: '#8a4f3d', layout: 'commerce', image: img('photo-1512909006721-3d6018887383'), cta: 'Explore Offer' }),
  makeTemplate({ key: 'nonprofit_appeal', name: 'Nonprofit Appeal', category: 'Fundraising', industry: 'Nonprofit', subject: 'Your support makes this possible', preheader: 'Tell a clear story and invite a donation.', accent: '#7c3aed', layout: 'letter', cta: 'Donate Now' }),
  makeTemplate({ key: 'healthcare_checkin', name: 'Healthcare Check-in', category: 'Reminder', industry: 'Healthcare', subject: 'A quick check-in from {{company_name}}', preheader: 'A calm reminder for patient or client follow-up.', accent: '#0f766e', layout: 'letter', cta: 'Confirm Details' }),
  makeTemplate({ key: 'restaurant_special', name: 'Restaurant Special', category: 'Promotional', industry: 'Hospitality', subject: 'This week at {{company_name}}', preheader: 'Promote a menu special with reservation intent.', accent: '#b45309', layout: 'commerce', image: img('photo-1414235077428-338989a2e8c0'), cta: 'Reserve Table' }),
  makeTemplate({ key: 'trial_expiry', name: 'Trial Expiry', category: 'Lifecycle', industry: 'SaaS', subject: 'Your trial ends soon', preheader: 'Give trial users a clear next step.', accent: '#4338ca', layout: 'letter', cta: 'Review Options' }),
];
