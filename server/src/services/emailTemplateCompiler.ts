import mjml2html from 'mjml';
import sanitizeHtml from 'sanitize-html';
import { convert } from 'html-to-text';

export type QualityIssue = {
  code: string;
  level: 'error' | 'warning' | 'pass';
  message: string;
};

export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'table', 'tbody', 'thead', 'tr', 'td', 'th']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'style'],
      img: ['src', 'alt', 'width', 'height', 'style'],
      '*': ['style', 'align', 'valign', 'width', 'height', 'bgcolor'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

export function compileMjml(mjml: string): { html: string; plainText: string; errors: string[] } {
  const result = (mjml2html as unknown as (input: string, options: Record<string, unknown>) => { html: string; errors?: Error[] })(mjml, { validationLevel: 'soft', minify: false });
  const html = sanitizeEmailHtml(result.html || '');
  return {
    html,
    plainText: convert(html, { wordwrap: 80 }),
    errors: (result.errors || []).map((error: Error) => error.message),
  };
}

export function runTemplateQualityChecks(input: {
  subject?: string | null;
  preheader?: string | null;
  mjml?: string | null;
  html?: string | null;
  plainText?: string | null;
  category?: string | null;
}): QualityIssue[] {
  const html = input.html || '';
  const mjml = input.mjml || '';
  const issues: QualityIssue[] = [];
  issues.push(input.subject?.trim() ? pass('subject', 'Subject is present.') : error('subject', 'Subject is required before sending.'));
  issues.push(input.preheader?.trim() ? pass('preheader', 'Preheader is present.') : warn('preheader', 'Add a preheader for better inbox preview.'));
  issues.push(input.plainText?.trim() ? pass('plain_text', 'Plain-text fallback is present.') : warn('plain_text', 'Plain-text fallback is missing.'));

  const needsUnsubscribe = String(input.category || '').toLowerCase() !== 'transactional';
  const hasUnsubscribe = /unsubscribe_url|unsubscribe/i.test(html + mjml);
  issues.push(!needsUnsubscribe || hasUnsubscribe ? pass('unsubscribe', 'Unsubscribe path is present.') : error('unsubscribe', 'Marketing templates need an unsubscribe link.'));
  issues.push(/<script/i.test(html + mjml) ? error('script', 'Scripts are not allowed in email content.') : pass('script', 'No scripts detected.'));
  issues.push(/<img\b(?![^>]*\balt=)/i.test(html + mjml) ? warn('image_alt', 'One or more images are missing alt text.') : pass('image_alt', 'Image alt text check passed.'));
  issues.push(/href=["']\s*(javascript:|data:)/i.test(html) ? error('unsafe_url', 'Unsafe URLs are not allowed.') : pass('unsafe_url', 'Links use allowed URL schemes.'));
  issues.push(html.length > 90000 ? warn('email_size', 'Compiled HTML is getting large for email clients.') : pass('email_size', 'Email size is within the warning threshold.'));
  issues.push(/company_address/i.test(html + mjml) ? pass('address', 'Company address placeholder is present.') : warn('address', 'Add a company address placeholder for marketing compliance.'));
  return issues;
}

const pass = (code: string, message: string): QualityIssue => ({ code, level: 'pass', message });
const warn = (code: string, message: string): QualityIssue => ({ code, level: 'warning', message });
const error = (code: string, message: string): QualityIssue => ({ code, level: 'error', message });
