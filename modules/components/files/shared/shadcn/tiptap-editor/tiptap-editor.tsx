"use client";

import { cn } from "@/lib/utils";
import Blockquote from "@tiptap/extension-blockquote";
import HardBreak from "@tiptap/extension-hard-break";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table/cell";
import { TableHeader } from "@tiptap/extension-table/header";
import { TableRow } from "@tiptap/extension-table/row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./editor-menu-bar";

type EditorProps = {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
  className?: string;
};

export default function TiptapEditor({
  content,
  onChange,
  editable = true,
  className,
}: EditorProps) {
  const editor = useEditor({
    editable,
    content,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
        link: false,
        underline: false,
        blockquote: false,
        horizontalRule: false,
        hardBreak: false,
        codeBlock: false,
        code: false,
      }),

      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "w-full table-auto border border-border" },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border border-border bg-muted text-foreground font-semibold px-2 py-1",
        },
      }),
      TableCell.configure({
        HTMLAttributes: { class: "border border-border px-2 py-1 text-sm" },
      }),

      TextAlign.configure({ types: ["heading", "paragraph"] }),

      Highlight,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-primary underline" },
      }),

      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-border pl-4 italic text-muted-foreground",
        },
      }),
      HorizontalRule,
      HardBreak,
    ],
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[200px]",
          className,
        ),
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    autofocus: true,
  });

  return (
    <>
      <div className="sticky top-1 z-50 backdrop-blur-sm shadow-md">
        {editable && <MenuBar editor={editor} />}
      </div>
      <EditorContent className="focus:border-primary" editor={editor} />
    </>
  );
}