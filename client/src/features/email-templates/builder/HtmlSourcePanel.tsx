import React, { useState, useCallback } from 'react';
import { Code2, Copy, Check, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

const VOID_TAGS = new Set([
  'area','base','br','col','embed','hr','img','input',
  'link','meta','param','source','track','wbr',
]);

// Tags whose raw text content must NOT be reformatted
const RAW_CONTENT_TAGS = new Set(['style', 'script', 'pre', 'textarea']);

/**
 * Token-stream HTML pretty-printer.
 * Splits the document into: comments, tags, and text nodes,
 * then rebuilds with correct 2-space indentation.
 */
function prettyHtml(raw: string): string {
  if (!raw) return '';
  try {
    const INDENT = '  ';
    // Match: HTML comments | tags | text between tags
    const TOKEN_RE = /<!--[\s\S]*?-->|<[^>]+>|[^<]+/g;
    const tokens = raw.match(TOKEN_RE) ?? [];

    let level = 0;
    let inRawTag = '';   // when non-empty, we're inside <style>/<script>/etc.
    const lines: string[] = [];

    const pad = () => INDENT.repeat(Math.max(0, level));

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      // ── Inside a raw-content block (style/script) ──────────────────────
      if (inRawTag) {
        const closeRe = new RegExp(`^<\\/${inRawTag}`, 'i');
        if (closeRe.test(tok.trim())) {
          level = Math.max(0, level - 1);
          lines.push(pad() + tok.trim());
          inRawTag = '';
        } else {
          // Preserve raw content lines as-is but trim common indent
          const rawLines = tok.split(/\r?\n/);
          for (const rl of rawLines) {
            if (rl.trim()) lines.push(pad() + rl.trim());
          }
        }
        continue;
      }

      const trimmed = tok.trim();
      if (!trimmed) continue;

      // ── HTML comment ───────────────────────────────────────────────────
      if (trimmed.startsWith('<!--')) {
        lines.push(pad() + trimmed);
        continue;
      }

      // ── DOCTYPE ────────────────────────────────────────────────────────
      if (/^<!doctype/i.test(trimmed)) {
        lines.push(pad() + trimmed);
        continue;
      }

      // ── Closing tag ────────────────────────────────────────────────────
      if (trimmed.startsWith('</')) {
        level = Math.max(0, level - 1);
        lines.push(pad() + trimmed);
        continue;
      }

      // ── Self-closing or void tag ───────────────────────────────────────
      const tagName = (trimmed.match(/^<([a-z][a-z0-9-]*)/i) ?? [])[1]?.toLowerCase() ?? '';
      const isSelfClose = trimmed.endsWith('/>') || VOID_TAGS.has(tagName);

      if (trimmed.startsWith('<') && isSelfClose) {
        lines.push(pad() + trimmed);
        continue;
      }

      // ── Opening tag that may contain its close on the same token ───────
      if (trimmed.startsWith('<')) {
        // Check if the SAME token already has its closing tag (e.g. <title>text</title>)
        const inlineClose = new RegExp(`</${tagName}>\\s*$`, 'i');
        if (inlineClose.test(trimmed)) {
          lines.push(pad() + trimmed);
        } else {
          lines.push(pad() + trimmed);
          level++;
          if (RAW_CONTENT_TAGS.has(tagName)) {
            inRawTag = tagName;
          }
        }
        continue;
      }

      // ── Text node ──────────────────────────────────────────────────────
      const textLines = trimmed.split(/\r?\n/);
      for (const tl of textLines) {
        const t = tl.trim();
        if (t) lines.push(pad() + t);
      }
    }

    return lines.join('\n');
  } catch {
    return raw; // If anything goes wrong, show raw
  }
}


type Props = {
  getHtml: () => Promise<string>;
};

export const HtmlSourcePanel: React.FC<Props> = ({ getHtml }) => {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await getHtml();
      setHtml(prettyHtml(raw));
    } finally {
      setLoading(false);
    }
  }, [getHtml]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !html) await load();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="html-source-panel">
      {/* ── Header ── */}
      <button
        type="button"
        className="html-source-header"
        onClick={handleToggle}
        aria-expanded={open}
      >
        <span className="html-source-title">
          <Code2 size={14} />
          HTML Source
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* ── Content ── */}
      {open && (
        <div className="html-source-body">
          <div className="html-source-toolbar">
            <span className="html-source-lines">
              {html ? `${html.split('\n').length} lines` : '—'}
            </span>
            <button
              type="button"
              className="html-source-btn"
              onClick={load}
              title="Refresh"
              disabled={loading}
            >
              <RefreshCw size={12} className={loading ? 'spin' : ''} />
            </button>
            <button
              type="button"
              className="html-source-btn"
              onClick={handleCopy}
              title="Copy to clipboard"
              disabled={!html}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <pre className="html-source-pre">
            <code>{html || (loading ? 'Loading…' : 'Click refresh to load.')}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
