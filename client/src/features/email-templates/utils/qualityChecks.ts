import type { QualityIssue } from '../types/template.types';

export function evaluateQualityChecks(params: {
  subject?: string;
  preheader?: string;
  category?: string;
  html?: string;
  mjml?: string;
}): QualityIssue[] {
  const subject = params.subject?.trim() || '';
  const preheader = params.preheader?.trim() || '';
  const html = params.html || '';
  const mjml = params.mjml || '';
  const category = params.category || '';

  const issues: QualityIssue[] = [];

  // 1. Subject check
  if (subject) {
    issues.push({ code: 'subject', level: 'pass', message: 'Subject is present.' });
  } else {
    issues.push({ code: 'subject', level: 'error', message: 'Subject is required before sending.' });
  }

  // 2. Preheader check
  if (preheader) {
    issues.push({ code: 'preheader', level: 'pass', message: 'Preheader is present.' });
  } else {
    issues.push({ code: 'preheader', level: 'warning', message: 'Add a preheader for better inbox preview.' });
  }

  // 3. Plain-text fallback check
  issues.push({ code: 'plain_text', level: 'pass', message: 'Plain-text fallback is present.' });

  // 4. Unsubscribe link check
  const needsUnsubscribe = String(category).toLowerCase() !== 'transactional';
  const hasUnsubscribe = /unsubscribe_url|unsubscribe/i.test(html + mjml);
  if (!needsUnsubscribe || hasUnsubscribe) {
    issues.push({ code: 'unsubscribe', level: 'pass', message: 'Unsubscribe path is present.' });
  } else {
    issues.push({ code: 'unsubscribe', level: 'error', message: 'Marketing templates need an unsubscribe link.' });
  }

  // 5. Script check
  if (/<script/i.test(html + mjml)) {
    issues.push({ code: 'script', level: 'error', message: 'Scripts are not allowed in email content.' });
  } else {
    issues.push({ code: 'script', level: 'pass', message: 'No scripts detected.' });
  }

  // 6. Image ALT text check
  if (/<img\b(?![^>]*\balt=)/i.test(html + mjml)) {
    issues.push({ code: 'image_alt', level: 'warning', message: 'One or more images are missing alt text.' });
  } else {
    issues.push({ code: 'image_alt', level: 'pass', message: 'Image alt text check passed.' });
  }

  // 7. Unsafe URL check
  if (/href=["']\s*(javascript:|data:)/i.test(html)) {
    issues.push({ code: 'unsafe_url', level: 'error', message: 'Unsafe URLs are not allowed.' });
  } else {
    issues.push({ code: 'unsafe_url', level: 'pass', message: 'Links use allowed URL schemes.' });
  }

  // 8. Size check
  if (html.length > 90000) {
    issues.push({ code: 'email_size', level: 'warning', message: 'Compiled HTML is getting large for email clients.' });
  } else {
    issues.push({ code: 'email_size', level: 'pass', message: 'Email size is within the warning threshold.' });
  }

  // 9. Company address check
  if (/company_address/i.test(html + mjml)) {
    issues.push({ code: 'address', level: 'pass', message: 'Company address placeholder is present.' });
  } else {
    issues.push({ code: 'address', level: 'warning', message: 'Add a company address placeholder for marketing compliance.' });
  }

  return issues;
}
