import React, { useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  Link,
  List,
  ListOrdered,
  Palette,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from 'lucide-react';

interface RichTextToolbarProps {
  editor: Editor | null;
}

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
];

const MERGE_TAGS = [
  { label: 'Insert Merge Tag...', value: '' },
  { label: 'First Name', value: '{{first_name}}' },
  { label: 'Last Name', value: '{{last_name}}' },
  { label: 'Email Address', value: '{{email}}' },
  { label: 'Company Name', value: '{{company_name}}' },
  { label: 'Current Year', value: '{{current_year}}' },
  { label: 'Support Email', value: '{{brand.support_email}}' },
  { label: 'Unsubscribe Link', value: '{{brand.unsubscribe_url}}' },
];

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) return null;

  const handleInsertMergeTag = (tag: string) => {
    if (tag) {
      editor.chain().focus().insertContent(tag).run();
    }
  };

  const handleSetLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2px',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        padding: '4px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        marginBottom: '6px',
        zIndex: 50,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Font Family */}
      <select
        onChange={(e) => {
          if (e.target.value) {
            editor.chain().focus().setFontFamily(e.target.value).run();
          } else {
            editor.chain().focus().unsetFontFamily().run();
          }
        }}
        style={{
          fontSize: '11px',
          padding: '3px 6px',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          outline: 'none',
          background: '#ffffff',
          cursor: 'pointer',
        }}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Merge Tag Dropdown */}
      <select
        value=""
        onChange={(e) => {
          handleInsertMergeTag(e.target.value);
        }}
        style={{
          fontSize: '11px',
          padding: '3px 6px',
          borderRadius: '4px',
          border: '1px solid #bfdbfe',
          outline: 'none',
          background: '#eff6ff',
          color: '#2563eb',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {MERGE_TAGS.map((tag) => (
          <option key={tag.label} value={tag.value}>
            {tag.label}
          </option>
        ))}
      </select>

      <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 4px' }} />

      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive('bold') ? '#eff6ff' : 'transparent',
          color: editor.isActive('bold') ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Bold"
      >
        <Bold size={14} />
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive('italic') ? '#eff6ff' : 'transparent',
          color: editor.isActive('italic') ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Italic"
      >
        <Italic size={14} />
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive('underline') ? '#eff6ff' : 'transparent',
          color: editor.isActive('underline') ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Underline"
      >
        <Underline size={14} />
      </button>

      {/* Strikethrough */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive('strike') ? '#eff6ff' : 'transparent',
          color: editor.isActive('strike') ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </button>

      <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 4px' }} />

      {/* Alignments */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive({ textAlign: 'left' }) ? '#eff6ff' : 'transparent',
          color: editor.isActive({ textAlign: 'left' }) ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Align Left"
      >
        <AlignLeft size={14} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive({ textAlign: 'center' }) ? '#eff6ff' : 'transparent',
          color: editor.isActive({ textAlign: 'center' }) ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Align Center"
      >
        <AlignCenter size={14} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive({ textAlign: 'right' }) ? '#eff6ff' : 'transparent',
          color: editor.isActive({ textAlign: 'right' }) ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Align Right"
      >
        <AlignRight size={14} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive({ textAlign: 'justify' }) ? '#eff6ff' : 'transparent',
          color: editor.isActive({ textAlign: 'justify' }) ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Justify"
      >
        <AlignJustify size={14} />
      </button>

      <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 4px' }} />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive('bulletList') ? '#eff6ff' : 'transparent',
          color: editor.isActive('bulletList') ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Bullet List"
      >
        <List size={14} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: editor.isActive('orderedList') ? '#eff6ff' : 'transparent',
          color: editor.isActive('orderedList') ? '#2563eb' : '#475569',
          cursor: 'pointer',
        }}
        title="Numbered List"
      >
        <ListOrdered size={14} />
      </button>

      <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 4px' }} />

      {/* Text Color */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{
            padding: '4px',
            border: 'none',
            borderRadius: '4px',
            background: 'transparent',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Text Color"
        >
          <Palette size={14} />
        </button>
        {showColorPicker && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 100,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '6px',
              borderRadius: '6px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <input
              type="color"
              onChange={(e) => {
                editor.chain().focus().setColor(e.target.value).run();
                setShowColorPicker(false);
              }}
              style={{ cursor: 'pointer', width: '32px', height: '32px', border: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Highlight Color */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
          style={{
            padding: '4px',
            border: 'none',
            borderRadius: '4px',
            background: editor.isActive('highlight') ? '#fef08a' : 'transparent',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Highlight"
        >
          <Highlighter size={14} />
        </button>
        {showHighlightPicker && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 100,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '6px',
              borderRadius: '6px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <input
              type="color"
              defaultValue="#fef08a"
              onChange={(e) => {
                editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
                setShowHighlightPicker(false);
              }}
              style={{ cursor: 'pointer', width: '32px', height: '32px', border: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Link */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => {
            setLinkUrl(editor.getAttributes('link').href || '');
            setShowLinkInput(!showLinkInput);
          }}
          style={{
            padding: '4px',
            border: 'none',
            borderRadius: '4px',
            background: editor.isActive('link') ? '#eff6ff' : 'transparent',
            color: editor.isActive('link') ? '#2563eb' : '#475569',
            cursor: 'pointer',
          }}
          title="Insert Link"
        >
          <Link size={14} />
        </button>
        {showLinkInput && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 100,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px',
              borderRadius: '6px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              gap: '4px',
              minWidth: '220px',
            }}
          >
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              style={{
                fontSize: '12px',
                padding: '4px 6px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                flex: 1,
              }}
            />
            <button
              type="button"
              onClick={handleSetLink}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Clear Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        style={{
          padding: '4px',
          border: 'none',
          borderRadius: '4px',
          background: 'transparent',
          color: '#475569',
          cursor: 'pointer',
        }}
        title="Clear Formatting"
      >
        <RemoveFormatting size={14} />
      </button>
    </div>
  );
};
