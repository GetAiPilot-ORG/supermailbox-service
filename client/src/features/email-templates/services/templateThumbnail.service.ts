export function getTemplateThumbnailHtml(html?: string) {
  if (!html) return '<div style="font:14px Arial;color:#667085;padding:32px;text-align:center">No preview yet</div>';
  return html;
}
