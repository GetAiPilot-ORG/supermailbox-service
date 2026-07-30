export function getTemplateThumbnailHtml(html?: string) {
  if (!html) return '<div style="font:14px Arial;color:#667085;padding:32px;text-align:center">No preview yet</div>';
  
  let result = html;
  if (!result.includes('name="viewport"')) {
    if (result.includes('<head>')) {
      result = result.replace('<head>', '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    } else {
      result = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${result}</body></html>`;
    }
  }
  return result;
}
