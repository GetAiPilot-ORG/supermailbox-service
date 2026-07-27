export const pocMergeTags = [
  { name: 'First name', value: '{{first_name}}' },
  { name: 'Company name', value: '{{company_name}}' },
  { name: 'CTA URL', value: '{{cta_url}}' },
  { name: 'Unsubscribe URL', value: '{{unsubscribe_url}}' },
];

export const reactEmailEditorDesign = {
  counters: { u_row: 7, u_column: 8, u_content_text: 7, u_content_button: 2, u_content_image: 2, u_content_divider: 1, u_content_social: 1 },
  body: {
    id: 'body',
    rows: [
      {
        id: 'logo-row',
        cells: [1],
        columns: [{ id: 'logo-col', contents: [{ id: 'logo', type: 'image', values: { src: { url: 'https://dummyimage.com/180x48/769181/ffffff&text=SuperMailBox' }, altText: 'SuperMailBox', textAlign: 'center', containerPadding: '20px' } }] }],
        values: { backgroundColor: '#ffffff' },
      },
      {
        id: 'hero-row',
        cells: [1],
        columns: [{
          id: 'hero-col',
          contents: [
            { id: 'hero-image', type: 'image', values: { src: { url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80' }, altText: 'Workspace', fullWidth: true } },
            { id: 'headline', type: 'text', values: { text: '<h1>Welcome, {{first_name}}</h1>', fontSize: '30px', lineHeight: '38px', textAlign: 'center', containerPadding: '24px 32px 6px' } },
            { id: 'paragraph', type: 'text', values: { text: '<p>Your {{company_name}} workspace is ready. Here are the next best steps.</p>', color: '#475467', textAlign: 'center', containerPadding: '0 36px 16px' } },
            { id: 'cta', type: 'button', values: { text: 'Open dashboard', href: { name: 'web', values: { href: '{{cta_url}}', target: '_blank' } }, buttonColors: { color: '#ffffff', backgroundColor: '#769181' }, borderRadius: '6px', containerPadding: '10px 10px 28px' } },
          ],
        }],
        values: { backgroundColor: '#ffffff' },
      },
      {
        id: 'features-row',
        cells: [1, 1],
        columns: [
          { id: 'feature-one', contents: [{ id: 'feature-one-text', type: 'text', values: { text: '<h3>Automate safely</h3><p>Use reusable campaign blocks with approved merge tags.</p>', containerPadding: '18px' } }] },
          { id: 'feature-two', contents: [{ id: 'feature-two-text', type: 'text', values: { text: '<h3>Measure clearly</h3><p>Keep templates versioned and ready for test sends.</p>', containerPadding: '18px' } }] },
        ],
        values: { backgroundColor: '#f6f7f5' },
      },
      { id: 'divider-row', cells: [1], columns: [{ id: 'divider-col', contents: [{ id: 'divider', type: 'divider', values: { border: { borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: '#dfe4ea' } } }] }], values: { backgroundColor: '#ffffff' } },
      { id: 'social-row', cells: [1], columns: [{ id: 'social-col', contents: [{ id: 'social', type: 'social', values: { icons: { iconType: 'circle', icons: [{ name: 'Facebook', url: 'https://facebook.com' }, { name: 'X', url: 'https://x.com' }, { name: 'LinkedIn', url: 'https://linkedin.com' }] }, textAlign: 'center' } }] }], values: { backgroundColor: '#ffffff' } },
      { id: 'footer-row', cells: [1], columns: [{ id: 'footer-col', contents: [{ id: 'footer', type: 'text', values: { text: '<p>{{company_name}} | {{company_address}}<br><a href="{{unsubscribe_url}}">Unsubscribe</a></p>', color: '#667085', fontSize: '12px', textAlign: 'center' } }] }], values: { backgroundColor: '#ffffff' } },
    ],
    values: { backgroundColor: '#eef2ef', contentWidth: '600px', fontFamily: { label: 'Arial', value: 'arial,helvetica,sans-serif' } },
  },
  schemaVersion: 17,
};

export const sampleHtml = `<!doctype html><html><body style="margin:0;background:#eef2ef;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="600" style="background:#fff"><tr><td align="center" style="padding:20px"><img src="https://dummyimage.com/180x48/769181/ffffff&text=SuperMailBox" alt="SuperMailBox"></td></tr><tr><td><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80" width="600" alt="Workspace" style="display:block;width:100%"></td></tr><tr><td align="center" style="padding:24px 32px"><h1>Welcome, {{first_name}}</h1><p>Your {{company_name}} workspace is ready.</p><a href="{{cta_url}}" style="background:#769181;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Open dashboard</a></td></tr><tr><td style="padding:18px;background:#f6f7f5"><table role="presentation" width="100%"><tr><td width="50%"><h3>Automate safely</h3><p>Use approved merge tags.</p></td><td width="50%"><h3>Measure clearly</h3><p>Keep templates versioned.</p></td></tr></table></td></tr><tr><td align="center" style="padding:18px;color:#667085;font-size:12px">{{company_name}} | {{company_address}}<br><a href="{{unsubscribe_url}}">Unsubscribe</a></td></tr></table></td></tr></table></body></html>`;
