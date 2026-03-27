"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TiptapEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapEditor({
  value = "",
  onChange,
  placeholder = "Start typing...",
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm min-h-[120px] max-w-none focus:outline-none p-3",
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div
      className={`rounded-md border border-input bg-background text-sm ${className ?? ""}`}
    >
      {editor && (
        <div className="flex flex-wrap gap-1 border-b border-input p-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded px-2 py-1 text-xs font-bold ${
              editor.isActive("bold") ? "bg-accent" : "hover:bg-accent"
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded px-2 py-1 text-xs italic ${
              editor.isActive("italic") ? "bg-accent" : "hover:bg-accent"
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded px-2 py-1 text-xs line-through ${
              editor.isActive("strike") ? "bg-accent" : "hover:bg-accent"
            }`}
          >
            S
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`rounded px-2 py-1 text-xs ${
              editor.isActive("heading", { level: 2 })
                ? "bg-accent"
                : "hover:bg-accent"
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded px-2 py-1 text-xs ${
              editor.isActive("bulletList") ? "bg-accent" : "hover:bg-accent"
            }`}
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded px-2 py-1 text-xs ${
              editor.isActive("orderedList") ? "bg-accent" : "hover:bg-accent"
            }`}
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`rounded px-2 py-1 text-xs ${
              editor.isActive("blockquote") ? "bg-accent" : "hover:bg-accent"
            }`}
          >
            ❝
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHardBreak().run()}
            className="rounded px-2 py-1 text-xs hover:bg-accent"
          >
            ↵
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="rounded px-2 py-1 text-xs hover:bg-accent disabled:opacity-40"
          >
            ↩
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="rounded px-2 py-1 text-xs hover:bg-accent disabled:opacity-40"
          >
            ↪
          </button>
        </div>
      )}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}
