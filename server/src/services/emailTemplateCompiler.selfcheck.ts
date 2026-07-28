import assert from 'node:assert/strict';
import { compileMjml, runTemplateQualityChecks } from './emailTemplateCompiler.js';

const compiled = compileMjml(`<mjml><mj-body><mj-section><mj-column><mj-text>Hello {{first_name}}</mj-text><mj-image src="https://example.com/a.png" alt="Example" /></mj-column></mj-section></mj-body></mjml>`);

assert.ok(compiled.html.includes('Hello {{first_name}}'));
assert.ok(compiled.plainText.includes('Hello'));
assert.equal(compiled.errors.length, 0);

const quality = runTemplateQualityChecks({
  subject: 'Hello',
  preheader: 'Preview',
  mjml: '{{unsubscribe_url}} {{company_address}}',
  html: compiled.html,
  plainText: compiled.plainText,
  category: 'marketing',
});

assert.equal(quality.some((issue) => issue.level === 'error'), false);

console.log('emailTemplateCompiler self-check passed');
