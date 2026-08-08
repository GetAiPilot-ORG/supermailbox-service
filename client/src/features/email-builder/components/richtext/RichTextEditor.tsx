import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import { RichTextToolbar } from './RichTextToolbar';

interface RichTextEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onUpdate,
  style,
}) => {
  const timerRef = useRef<number | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily,
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        onUpdate(html);
      }, 50);
    },
  });

  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      <style>{`
        .ProseMirror {
          outline: none !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          color: inherit !important;
          text-align: inherit !important;
          line-height: inherit !important;
          font-family: inherit !important;
        }
        .ProseMirror p {
          margin: 0 !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          color: inherit !important;
          text-align: inherit !important;
          line-height: inherit !important;
          font-family: inherit !important;
        }
      `}</style>
      {editor && editor.isFocused && <RichTextToolbar editor={editor} />}
      <EditorContent editor={editor} style={{ width: '100%', ...style }} />
    </div>
  );
};
