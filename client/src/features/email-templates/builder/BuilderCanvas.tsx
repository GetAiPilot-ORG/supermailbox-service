import React, { useRef } from 'react';
import EmailEditor, { type EditorRef } from 'react-email-editor';
import { ReactEmailEditorAdapter, designFromHtml, formatHtmlInProject } from './adapters/ReactEmailEditorAdapter';
import type { EmailEditorAdapter } from './adapters/EmailEditorAdapter';
import type { PreviewDevice } from '../types/template.types';


type Props = {
  mjml: string;
  html?: string;
  name: string;
  project?: unknown;
  device?: PreviewDevice;
  canvasWidth?: number;          // custom pixel width override (e.g. 360, 480, 600)
  socialProfiles?: any[];
  onReady: (adapter: EmailEditorAdapter) => void;
  onChange: () => void;
  onSelect: (component: unknown) => void;
  onRequestImageUpload?: (done: (data: { url: string }) => void, file?: File) => void;
};

const isUnlayerDesign = (value: unknown): value is { body: unknown } => Boolean(value && typeof value === 'object' && 'body' in value);

function injectUnlayerEditorCSS() {
  function processDoc(doc: Document) {
    if (!doc || !doc.head) return;

    try {
      let style = doc.getElementById('__gap-unlayer-style') as HTMLStyleElement | null;
      if (!style) {
        style = doc.createElement('style');
        style.id = '__gap-unlayer-style';
        doc.head.appendChild(style);
      }
      style.textContent = `
        /* Modern Sleek Custom Scrollbars inside all Unlayer documents & sub-iframes */
        *,
        *::before,
        *::after,
        html,
        body,
        div,
        section,
        aside,
        nav,
        main,
        article,
        form,
        textarea,
        ul,
        ol,
        p,
        iframe,
        fieldset,
        code,
        pre {
          /* Reset scrollbar-width for Chrome/Safari/Edge so ::-webkit-scrollbar works */
          scrollbar-width: auto !important;
        }

        @supports (-moz-appearance: none) {
          *, *::before, *::after, html, body, div, section, aside, nav, main, article, form, textarea, ul, ol, p, iframe, fieldset, code, pre {
            scrollbar-width: thin !important;
            scrollbar-color: rgba(140, 145, 155, 0.45) transparent !important;
          }
        }

        /* Prevent horizontal scrollbar in the Unlayer canvas */
        html, body {
          overflow-x: hidden !important;
        }

        /* Bruteforce hide any horizontal webkit scrollbar */
        *::-webkit-scrollbar:horizontal {
          display: none !important;
          height: 0 !important;
        }

        html *::-webkit-scrollbar,
        body *::-webkit-scrollbar,
        [class*="blockbuilder"] *::-webkit-scrollbar,
        [class*="unlayer"] *::-webkit-scrollbar,
        *::-webkit-scrollbar,
        ::-webkit-scrollbar {
          width: 6px !important;
          height: 6px !important;
        }

        html *::-webkit-scrollbar-track,
        body *::-webkit-scrollbar-track,
        [class*="blockbuilder"] *::-webkit-scrollbar-track,
        [class*="unlayer"] *::-webkit-scrollbar-track,
        *::-webkit-scrollbar-track,
        ::-webkit-scrollbar-track {
          background: transparent !important;
          border-radius: 9999px !important;
        }

        html *::-webkit-scrollbar-thumb,
        body *::-webkit-scrollbar-thumb,
        [class*="blockbuilder"] *::-webkit-scrollbar-thumb,
        [class*="unlayer"] *::-webkit-scrollbar-thumb,
        *::-webkit-scrollbar-thumb,
        ::-webkit-scrollbar-thumb {
          background-color: rgba(140, 145, 155, 0.45) !important;
          border-radius: 9999px !important;
          border: 1px solid transparent !important;
          background-clip: padding-box !important;
          transition: background-color 0.2s ease !important;
        }

        *::-webkit-scrollbar-thumb:hover,
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(100, 110, 125, 0.75) !important;
        }

        *::-webkit-scrollbar-thumb:active,
        ::-webkit-scrollbar-thumb:active {
          background-color: rgba(80, 90, 105, 0.9) !important;
        }

        *::-webkit-scrollbar-corner,
        ::-webkit-scrollbar-corner {
          background: transparent !important;
        }

        *::-webkit-scrollbar-button,
        ::-webkit-scrollbar-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        .blockbuilder-code-editor textarea,
        [class*="code"] textarea {
          font-family: 'Menlo', 'Consolas', 'Fira Code', 'Courier New', monospace !important;
          font-size: 12.5px !important;
          line-height: 1.75 !important;
          white-space: pre !important;
          tab-size: 2 !important;
          word-break: normal !important;
          word-wrap: normal !important;
          overflow-wrap: normal !important;
          overflow-x: auto !important;
          overflow-y: auto !important;
          background: #1e1e2e !important;
          color: #cdd6f4 !important;
          caret-color: #f5c2e7 !important;
          padding: 14px !important;
          border-radius: 6px !important;
          border: 1px solid #313244 !important;
          resize: vertical !important;
          letter-spacing: 0.01em !important;
        }

        /* ── Hide Unlayer's internal top header bar ───────────────────── */
        /* Unlayer renders: body > [app root] > [header] > [canvas area]   */
        /* The header is the first significant child — hide it by position  */

        /* Arco/Unlayer known class names */
        .blockbuilder-header,
        #blockbuilder-header,
        [class*="blockbuilder-header"],
        [class*="unlayer-header"],

        /* Generic device-switch selectors */
        [class*="device-switch"],
        [class*="device_switch"],
        [class*="device-selector"],
        [class*="device_selector"],
        [class*="device-toggle"],
        [class*="device-button"],
        [class*="device-btn"],
        [class*="preview-device"],
        [class*="preview_device"],
        [class*="mode-toggle"],
        .blockbuilder-header-device,
        .blockbuilder-header-tabs,
        .blockbuilder-device-switch,
        .blockbuilder-device-selector,
        button[title*="desktop"],
        button[title*="mobile"],
        button[title*="tablet"],
        button[aria-label*="desktop"],
        button[aria-label*="mobile"],
        [data-device],
        .fa-desktop,
        .fa-laptop,
        .fa-mobile {
          display: none !important;
        }
      `;

      // ── Inject JS to robustly & permanently hide Unlayer's top header ───
      if (!doc.getElementById('__gap-hide-unlayer-header')) {
        const script = doc.createElement('script');
        script.id = '__gap-hide-unlayer-header';
        script.textContent = `
          (function() {
            var hiddenEl = null;

            function hideBar(root) {
              // Walk shallow divs at the top of the page
              var candidates = (root || document).querySelectorAll(
                'body > div, body > div > div, body > header'
              );
              for (var i = 0; i < candidates.length; i++) {
                var el = candidates[i];
                var rect = el.getBoundingClientRect();
                // A header-like container: full-width, short height, at top
                if (rect.top >= 0 && rect.top < 15 && rect.height > 20 && rect.height < 90 && rect.width > 200) {
                  var svgCount = el.querySelectorAll('svg').length;
                  var btnCount = el.querySelectorAll('button').length;
                  if (svgCount >= 1 || btnCount >= 1) {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('height', '0', 'important');
                    el.style.setProperty('overflow', 'hidden', 'important');
                    hiddenEl = el;
                    return true;
                  }
                }
              }
              return false;
            }

            // Run on load
            hideBar();
            setTimeout(hideBar, 200);
            setTimeout(hideBar, 600);
            setTimeout(hideBar, 1500);

            // Use MutationObserver to re-hide if Unlayer re-renders the bar
            var observer = new MutationObserver(function() {
              if (hiddenEl && hiddenEl.style.display !== 'none') {
                hiddenEl.style.setProperty('display', 'none', 'important');
              }
              hideBar();
            });
            observer.observe(document.body || document.documentElement, {
              childList: true,
              subtree: true,
            });
          })();
        `;
        doc.head.appendChild(script);
      }

      // ── Inject JS formatter (once) ─────────────────────────────────────────
      if (!doc.getElementById('__gap-unlayer-fmt')) {
        const script = doc.createElement('script');
        script.id = '__gap-unlayer-fmt';
        script.textContent = `
(function () {
  /* ── Minimal HTML formatter for Unlayer block code textarea ── */
  function formatHtml(raw) {
    if (!raw || !raw.includes('<')) return raw;

    var INDENT = '  ';
    var VOID = { area:1,base:1,br:1,col:1,embed:1,hr:1,img:1,input:1,
                 link:1,meta:1,param:1,source:1,track:1,wbr:1 };

    // tokenise: comments | tags | text
    var tokens = raw.match(/<!--[\\s\\S]*?-->|<[^>]+>|[^<]+/g) || [];
    var level = 0, lines = [];

    function pad() { var s=''; for(var i=0;i<level;i++) s+=INDENT; return s; }

    tokens.forEach(function(tok) {
      var t = tok.trim();
      if (!t) return;

      if (/^<!--/.test(t)) { lines.push(pad()+t); return; }
      if (/^<!doctype/i.test(t)) { lines.push(pad()+t); return; }

      if (/^<\\//.test(t)) {                      // closing tag
        level = Math.max(0, level - 1);
        lines.push(pad()+t);
        return;
      }

      var tagName = (t.match(/^<([a-z][a-z0-9-]*)/i)||[])[1]||'';
      tagName = tagName.toLowerCase();
      var isSelf = /\\/>$/.test(t) || VOID[tagName];

      if (t.charAt(0) === '<') {
        // Check if open+close on same token: <title>text</title>
        var inlineClose = new RegExp('</' + tagName + '>\\\\s*$','i');
        lines.push(pad()+t);
        if (!isSelf && !inlineClose.test(t)) level++;
        return;
      }

      // text node — skip pure whitespace
      var tls = t.split(/\\r?\\n/);
      tls.forEach(function(l){ var c=l.trim(); if(c) lines.push(pad()+c); });
    });

    // collapse runs of 2+ blank lines to 1
    return lines.join('\\n').replace(/\\n([ \\t]*\\n){2,}/g, '\\n\\n');
  }

  function applyFormat(ta) {
    if (!ta || ta._gapDone) return;
    if (!ta.value || !ta.value.includes('<')) return;
    ta._gapDone = true;
    var formatted = formatHtml(ta.value);
    if (formatted && formatted !== ta.value) {
      // Set value without firing React controlled-component events that
      // would overwrite with the unformatted version
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype, 'value'
      ).set.call(ta, formatted);
    }
  }

  function scanAll() {
    document.querySelectorAll('textarea').forEach(function(ta) {
      setTimeout(function(){ applyFormat(ta); }, 120);
    });
  }

  // Watch for new textareas being mounted (user clicks different block)
  var obs = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (!node || node.nodeType !== 1) return;
        var tas = node.tagName === 'TEXTAREA'
          ? [node]
          : Array.from(node.querySelectorAll ? node.querySelectorAll('textarea') : []);
        tas.forEach(function(ta) { setTimeout(function(){ ta._gapDone=false; applyFormat(ta); }, 120); });
      });
    });
  });

  var root = document.body || document.documentElement;
  obs.observe(root, { childList: true, subtree: true });
  scanAll();
})();
        `;
        doc.head.appendChild(script);
      }

      // ── Inject JS link color picker for Menu items (once) ──────────────────
      if (!doc.getElementById('__gap-unlayer-link-colors')) {
        const script = doc.createElement('script');
        script.id = '__gap-unlayer-link-colors';
        script.textContent = `
(function () {
  var PALETTE = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0284c7', '#ec4899'];

  function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').trim();
  }

  function setReactInputValue(input, val) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value') ||
               Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    if (desc && desc.set) {
      desc.set.call(input, val);
    } else {
      input.value = val;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function scanAndEnhanceMenuCards() {
    var docs = [document];
    try {
      var iframes = document.querySelectorAll('iframe');
      iframes.forEach(function(f) {
        try {
          var d = f.contentDocument || f.contentWindow?.document;
          if (d) docs.push(d);
        } catch (_) {}
      });
    } catch (_) {}

    docs.forEach(function(doc) {
      var allInputs = Array.from(doc.querySelectorAll('input[type="text"], textarea, input:not([type])'));
      allInputs.forEach(function(inp) {
        var parent = inp.parentElement;
        if (!parent) return;

        var labelText = '';
        if (inp.previousElementSibling) labelText = inp.previousElementSibling.textContent || '';
        if (!labelText && inp.parentElement) {
          var sib = inp.parentElement.previousElementSibling;
          if (sib) labelText = sib.textContent || '';
        }
        if (!labelText && inp.parentElement) labelText = inp.parentElement.textContent || '';

        var isLabelInput = /label/i.test(labelText) && !/url|target|action/i.test(labelText);
        if (!isLabelInput) {
          var val = inp.value || '';
          if (val && !val.startsWith('http') && !val.startsWith('mailto') && (val.includes('GAP') || val.length > 1)) {
            var pCard = inp.closest('div[class*="item"], div[class*="card"], div[class*="field"], .blockbuilder-widget, div');
            if (pCard && /url|target|open website/i.test(pCard.textContent || '')) {
              isLabelInput = true;
            }
          }
        }

        if (!isLabelInput) return;

        var card = inp.closest('div[class*="item"], div[class*="card"], div[class*="field"], .blockbuilder-widget, div');
        var depth = 0;
        while (card && depth < 6) {
          var t = (card.textContent || '').toLowerCase();
          if ((t.includes('url') || t.includes('target') || t.includes('open website')) && card.querySelectorAll('input').length >= 1) {
            break;
          }
          card = card.parentElement;
          depth++;
        }

        if (!card || card._gapColorInjected) return;
        card._gapColorInjected = true;

        var currentColor = '#2563eb';
        var match = (inp.value || '').match(/color:\s*([^;"'\s]+)/i);
        if (match && match[1]) {
          var c = match[1].trim();
          if (c.startsWith('#') && c.length === 7) currentColor = c;
        }

        var colorRow = doc.createElement('div');
        colorRow.className = 'gap-color-row';
        colorRow.style.cssText = 'display:flex; align-items:center; margin-top:6px; margin-bottom:4px; border:1px solid #d9d9d9; border-radius:4px; overflow:hidden; background:#ffffff; font-family:sans-serif; width:100%; box-sizing:border-box;';

        var labelBox = doc.createElement('div');
        labelBox.style.cssText = 'background:#f5f5f5; border-right:1px solid #d9d9d9; padding:6px 12px; font-size:12px; font-weight:600; color:#555555; min-width:54px; text-align:center; display:flex; align-items:center; justify-content:center; user-select:none; box-sizing:border-box;';
        labelBox.textContent = 'Color';

        var controlsBox = doc.createElement('div');
        controlsBox.style.cssText = 'flex:1; display:flex; align-items:center; gap:6px; padding:4px 8px; flex-wrap:nowrap; overflow-x:auto;';

        var colorPicker = doc.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = currentColor;
        colorPicker.title = 'Choose custom color for this link';
        colorPicker.style.cssText = 'width:32px; height:26px; border:1px solid #cccccc; border-radius:4px; padding:0; cursor:pointer; background:none; flex-shrink:0;';

        function applyColor(hex) {
          colorPicker.value = hex;
          var plainText = stripHtml(inp.value);
          if (!plainText) return;
          var newHtml = '<span style="color: ' + hex + ';">' + plainText + '</span>';
          setReactInputValue(inp, newHtml);
        }

        colorPicker.addEventListener('change', function(e) { applyColor(e.target.value); });
        colorPicker.addEventListener('input', function(e) { applyColor(e.target.value); });

        controlsBox.appendChild(colorPicker);

        PALETTE.forEach(function(hex) {
          var dot = doc.createElement('button');
          dot.type = 'button';
          dot.title = 'Set color to ' + hex;
          dot.style.cssText = 'width:16px; height:16px; border-radius:50%; background-color:' + hex + '; border:1px solid rgba(0,0,0,0.2); cursor:pointer; padding:0; flex-shrink:0; transition:transform 0.1s ease;';
          dot.onmouseover = function() { dot.style.transform = 'scale(1.25)'; };
          dot.onmouseout = function() { dot.style.transform = 'scale(1)'; };
          dot.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            applyColor(hex);
          });
          controlsBox.appendChild(dot);
        });

        colorRow.appendChild(labelBox);
        colorRow.appendChild(controlsBox);

        card.appendChild(colorRow);
    });
  }

  function autoFillSocialInputs() {
    var socialMap = window.__GAP_SAVED_SOCIAL_MAP;
    if (!socialMap || Object.keys(socialMap).length === 0) return;

    var docs = [document];
    try {
      var iframes = document.querySelectorAll('iframe');
      iframes.forEach(function(f) {
        try {
          var d = f.contentDocument || f.contentWindow?.document;
          if (d) docs.push(d);
        } catch (_) {}
      });
    } catch (_) {}

    docs.forEach(function(d) {
      var allInputs = Array.from(d.querySelectorAll('input[type="text"], input[type="url"], input:not([type])'));
      allInputs.forEach(function(inp) {
        var card = inp.closest('div[class*="item"], div[class*="card"], div[class*="field"], .blockbuilder-widget, div');
        if (!card) return;

        var cardText = (card.textContent || '').toLowerCase();
        
        var platformKey = null;
        ['instagram', 'facebook', 'twitter', 'x', 'linkedin', 'youtube', 'whatsapp', 'pinterest', 'github', 'tiktok'].forEach(function(p) {
          if (cardText.includes(p)) platformKey = p;
        });

        if (!platformKey) return;
        var savedUrl = socialMap[platformKey];
        if (!savedUrl) return;

        var currentVal = (inp.value || '').trim();
        var isGeneric = !currentVal || /^(https?:\/\/)?(www\.)?(facebook|instagram|twitter|x|linkedin|youtube|pinterest|whatsapp|github|tiktok)\.com\/?$/i.test(currentVal);

        if (isGeneric && currentVal !== savedUrl) {
          setReactInputValue(inp, savedUrl);

          if (!inp._gapSocialBadge && inp.parentElement) {
            inp._gapSocialBadge = true;
            var badge = d.createElement('div');
            badge.style.cssText = 'font-size:10.5px; color:#059669; font-weight:600; margin-top:3px; display:flex; align-items:center; gap:4px;';
            badge.innerHTML = '✨ Auto-filled from Brand Assets';
            inp.parentElement.appendChild(badge);
          }
        }
      });
    });
  }

  function runAllScans() {
    scanAndEnhanceMenuCards();
    autoFillSocialInputs();
  }

  var obs = new MutationObserver(runAllScans);
  obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
  runAllScans();
  setInterval(runAllScans, 600);
})();
        `;
        doc.head.appendChild(script);
      }
    } catch (_) { }

    // Recursively process nested sub-iframes inside this document
    try {
      const nestedIframes = doc.querySelectorAll<HTMLIFrameElement>('iframe');
      for (const nested of Array.from(nestedIframes)) {
        const nestedDoc = nested.contentDocument ?? nested.contentWindow?.document;
        if (nestedDoc) processDoc(nestedDoc);
      }
    } catch (_) { }
  }

  try {
    processDoc(document);
    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
    for (const iframe of Array.from(iframes)) {
      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (doc) processDoc(doc);
    }
  } catch (_) { }
}

export const BuilderCanvas: React.FC<Props> = ({ html, name, project, device = 'desktop', canvasWidth, socialProfiles = [], onReady, onChange, onSelect, onRequestImageUpload }) => {
  const editorRef = useRef<EditorRef>(null);

  const savedSocialMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (socialProfiles || []).forEach((sp: any) => {
      if (sp.platform && sp.url) {
        const key = sp.platform.toLowerCase().replace(/[^a-z0-9]/g, '');
        map[key] = sp.url;
      }
    });
    return map;
  }, [socialProfiles]);

  const activeSocialIcons = React.useMemo(() => {
    const userIcons = (socialProfiles || []).map((sp: any) => {
      const platformRaw = (sp.platform || '').toLowerCase().trim();
      let name = platformRaw.replace(/[^a-z0-9]/g, '');
      if (name === 'x') name = 'twitter';
      return {
        name,
        url: sp.url || `https://${name}.com/`,
      };
    }).filter((icon: any) => Boolean(icon.name && icon.url));

    if (userIcons.length > 0) {
      return userIcons;
    }

    return [
      { name: 'instagram', url: 'https://instagram.com/' },
      { name: 'facebook', url: 'https://facebook.com/' },
    ];
  }, [socialProfiles]);

  // Determine whether we're in a constrained viewport (mobile, tablet, or custom width)
  const effectiveWidth = canvasWidth ?? (device === 'mobile' ? 320 : device === 'tablet' ? 480 : undefined);
  const isMobileView = effectiveWidth !== undefined;

  React.useEffect(() => {
    injectUnlayerEditorCSS();
    const interval = setInterval(injectUnlayerEditorCSS, 400);
    const timeout = setTimeout(() => clearInterval(interval), 3500);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  React.useEffect(() => {
    const targetWidth = canvasWidth ?? (device === 'mobile' ? 320 : device === 'tablet' ? 480 : 600);
    function applyIframeCanvasWidth() {
      try {
        const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
        for (const iframe of Array.from(iframes)) {
          const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
          if (!doc || !doc.head) continue;

          let style = doc.getElementById('__gap-canvas-width-style') as HTMLStyleElement | null;
          if (!style) {
            style = doc.createElement('style');
            style.id = '__gap-canvas-width-style';
            doc.head.appendChild(style);
          }

          style.textContent = `
            .blockbuilder-page,
            .blockbuilder-layer,
            .blockbuilder-content,
            .blockbuilder-page-container,
            .blockbuilder-workspace-canvas,
            .u_body,
            [class*="page-container"],
            [class*="content-container"],
            [class*="body-container"] {
              max-width: ${targetWidth}px !important;
              width: ${targetWidth}px !important;
              margin-left: auto !important;
              margin-right: auto !important;
              transition: width 0.2s ease, max-width 0.2s ease !important;
            }
          `;
        }
      } catch (_) { }
    }

    applyIframeCanvasWidth();
    const timer = setTimeout(applyIframeCanvasWidth, 300);
    return () => clearTimeout(timer);
  }, [canvasWidth, device]);

  const unlayerCustomScrollbarCSS = `
    *, *::before, *::after, html, body, div, section, main, article, aside, textarea,
    .blockbuilder-workspace-canvas, .blockbuilder-layer, .blockbuilder-content,
    .blockbuilder-page, .blockbuilder-page-container, [class*="workspace"],
    [class*="builder"], [class*="content"], [class*="layer"], [class*="panel"] {
      /* Reset scrollbar-width for Chrome/Safari/Edge so ::-webkit-scrollbar works */
      scrollbar-width: auto !important;
    }

    @supports (-moz-appearance: none) {
      *, *::before, *::after, html, body, div, section, main, article, aside, textarea,
      .blockbuilder-workspace-canvas, .blockbuilder-layer, .blockbuilder-content,
      .blockbuilder-page, .blockbuilder-page-container, [class*="workspace"],
      [class*="builder"], [class*="content"], [class*="layer"], [class*="panel"] {
        scrollbar-width: thin !important;
        scrollbar-color: rgba(140, 145, 155, 0.45) transparent !important;
      }
    }

    html *::-webkit-scrollbar,
    body *::-webkit-scrollbar,
    [class*="blockbuilder"] *::-webkit-scrollbar,
    [class*="unlayer"] *::-webkit-scrollbar,
    *::-webkit-scrollbar,
    ::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
    }

    html *::-webkit-scrollbar-track,
    body *::-webkit-scrollbar-track,
    [class*="blockbuilder"] *::-webkit-scrollbar-track,
    [class*="unlayer"] *::-webkit-scrollbar-track,
    *::-webkit-scrollbar-track,
    ::-webkit-scrollbar-track {
      background: transparent !important;
      border-radius: 9999px !important;
    }

    html *::-webkit-scrollbar-thumb,
    body *::-webkit-scrollbar-thumb,
    [class*="blockbuilder"] *::-webkit-scrollbar-thumb,
    [class*="unlayer"] *::-webkit-scrollbar-thumb,
    *::-webkit-scrollbar-thumb,
    ::-webkit-scrollbar-thumb {
      background-color: rgba(140, 145, 155, 0.45) !important;
      border-radius: 9999px !important;
      border: 1px solid transparent !important;
      background-clip: padding-box !important;
    }

    *::-webkit-scrollbar-thumb:hover,
    ::-webkit-scrollbar-thumb:hover {
      background-color: rgba(100, 110, 125, 0.75) !important;
    }

    *::-webkit-scrollbar-thumb:active,
    ::-webkit-scrollbar-thumb:active {
      background-color: rgba(80, 90, 105, 0.9) !important;
    }

    *::-webkit-scrollbar-button,
    ::-webkit-scrollbar-button {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }

    *::-webkit-scrollbar-corner,
    ::-webkit-scrollbar-corner {
      background: transparent !important;
    }

    .blockbuilder-dropzone,
    .unlayer-dropzone,
    .blockbuilder-preview-bar,
    .blockbuilder-device-switch,
    .blockbuilder-header-device,
    .blockbuilder-header-tabs,
    [class*="preview-bar"],
    [class*="device-switch"],
    [class*="device-selector"],
    [class*="device-toggle"],
    [class*="device-button"],
    [class*="device-btn"],
    [class*="device-icon"],
    [class*="preview-device"],
    [data-device] {
      display: none !important;
    }
  `;

  const customCssDataUri = 'data:text/css;charset=utf-8,' + encodeURIComponent(unlayerCustomScrollbarCSS);

  return (
    <div className="builder-canvas-shell" style={{ position: 'relative', height: '100%', flex: 1, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className={`canvas-viewport-wrapper${isMobileView ? ' canvas-viewport-wrapper--constrained' : ''}`} style={{ flex: 1, overflow: 'hidden', marginTop: '-44px', paddingTop: '44px' }}>
        <EmailEditor
          ref={editorRef}
          minHeight="100%"
          options={{
            displayMode: 'email',
            appearance: {
              theme: 'light',
              panels: {
                tools: {
                  dock: 'right',
                },
              },
            },
            features: {
              userUploads: false,
              preview: false,
            },
            customCSS: [
              customCssDataUri,
              unlayerCustomScrollbarCSS,
            ],
            mergeTags: {
              first_name: { name: 'First name', value: '{{first_name}}' },
              company_name: { name: 'Company name', value: '{{company_name}}' },
              cta_url: { name: 'CTA URL', value: '{{cta_url}}' },
              unsubscribe_url: { name: 'Unsubscribe URL', value: '{{unsubscribe_url}}' },
              social_instagram: { name: 'Instagram URL', value: '{{brand.social.instagram}}' },
              social_facebook: { name: 'Facebook URL', value: '{{brand.social.facebook}}' },
              social_linkedin: { name: 'LinkedIn URL', value: '{{brand.social.linkedin}}' },
              social_twitter: { name: 'X / Twitter URL', value: '{{brand.social.twitter}}' },
              social_youtube: { name: 'YouTube URL', value: '{{brand.social.youtube}}' },
              support_email: { name: 'Support Email', value: '{{brand.support_email}}' },
            },
            tools: {
              image: {
                properties: {
                  src: {
                    value: {
                      url: '',
                    }
                  }
                }
              },
              social: {
                properties: {
                  icons: {
                    value: {
                      iconType: 'circle',
                      icons: activeSocialIcons,
                    }
                  }
                }
              }
            }
          }}
          onLoad={(editor) => {
            if (onRequestImageUpload) {
              editor.registerCallback('selectImage', (data: any, done: (val: { url: string }) => void) => {
                onRequestImageUpload(done);
              });
              editor.registerCallback('image', (file: any, done: (val: { url: string }) => void) => {
                onRequestImageUpload(done);
              });
            }
          }}
          onReady={(editor) => {
            try { (window as any).__GAP_SAVED_SOCIAL_MAP = savedSocialMap; } catch (_) {}
            const adapter = new ReactEmailEditorAdapter(editor);
            const loadedDesign = isUnlayerDesign(project)
              ? formatHtmlInProject(project, savedSocialMap)
              : designFromHtml(html || '', name);
            editor.loadDesign(loadedDesign as never);
            (editor as any).addEventListener?.('design:updated', onChange);

            // Inject code-editor styles into the Unlayer iframe UI panels
            // Retry a few times to handle async iframe load timing
            injectUnlayerEditorCSS();
            setTimeout(injectUnlayerEditorCSS, 500);
            setTimeout(injectUnlayerEditorCSS, 1500);

            if (onRequestImageUpload) {
              editor.registerCallback('selectImage', (data: any, done: (val: { url: string }) => void) => {
                onRequestImageUpload(done);
              });
              editor.registerCallback('image', (file: any, done: (val: { url: string }) => void) => {
                onRequestImageUpload(done);
              });
            }

            onReady(adapter);
            onSelect(null);

            // — Wire up Unlayer block selection —
            // Unlayer fires 'element:selected' when the user clicks a block
            try {
              (editor as any).addEventListener('element:selected', (data: any) => {
                onSelect(data?.values ?? data ?? {});
              });
              // Also fire on design:updated to keep selected in sync
              (editor as any).addEventListener('element:deselected', () => {
                onSelect(null);
              });
            } catch (_) {}
          }}
        />
      </div>
    </div>
  );
};



