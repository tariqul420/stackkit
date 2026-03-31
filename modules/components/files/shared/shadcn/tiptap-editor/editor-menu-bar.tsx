"use client";

import type { Editor } from "@tiptap/core";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold as BoldIcon,
    Columns,
    Columns3,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic as ItalicIcon,
    Link as LinkIcon,
    List,
    ListOrdered,
    ListPlus,
    ListX,
    Quote,
    Redo,
    Strikethrough as StrikeIcon,
    Table as TableIcon,
    Type,
    Underline as UnderlineIcon,
    Undo,
} from "lucide-react";
import { Toggle } from "../ui/toggle";

import "@tiptap/extension-blockquote";
import "@tiptap/extension-bold";
import "@tiptap/extension-bullet-list";
import "@tiptap/extension-code";
import "@tiptap/extension-heading";
import "@tiptap/extension-highlight";
import "@tiptap/extension-history";
import "@tiptap/extension-horizontal-rule";
import "@tiptap/extension-italic";
import "@tiptap/extension-link";
import "@tiptap/extension-list-item";
import "@tiptap/extension-ordered-list";
import "@tiptap/extension-strike";
import "@tiptap/extension-table";
import "@tiptap/extension-table/cell";
import "@tiptap/extension-table/header";
import "@tiptap/extension-table/row";
import "@tiptap/extension-text-align";
import "@tiptap/extension-underline";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const opts = [
    // Headings
    {
      icon: <Heading1 className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
    },

    // Marks
    {
      icon: <BoldIcon className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
    },
    {
      icon: <ItalicIcon className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
    },
    {
      icon: <UnderlineIcon className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleUnderline().run(),
      pressed: editor.isActive("underline"),
    },
    {
      icon: <StrikeIcon className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleStrike().run(),
      pressed: editor.isActive("strike"),
    },
    {
      icon: <Highlighter className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleHighlight().run(),
      pressed: editor.isActive("highlight"),
    },

    // Link
    {
      icon: <LinkIcon className="h-4 w-4" />,
      action: () => {
        if (editor.isActive("link")) {
          editor.chain().focus().unsetLink().run();
          return;
        }
        const url =
          typeof window !== "undefined" ? window.prompt("Enter URL") : null;
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
      pressed: editor.isActive("link"),
    },

    // Blockquote / HR
    {
      icon: <Quote className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      pressed: editor.isActive("blockquote"),
    },
    {
      icon: <Type className="h-4 w-4" />,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      pressed: false,
    },

    // Align
    {
      icon: <AlignLeft className="h-4 w-4" />,
      action: () => editor.chain().focus().setTextAlign("left").run(),
      pressed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="h-4 w-4" />,
      action: () => editor.chain().focus().setTextAlign("center").run(),
      pressed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="h-4 w-4" />,
      action: () => editor.chain().focus().setTextAlign("right").run(),
      pressed: editor.isActive({ textAlign: "right" }),
    },

    // Lists
    {
      icon: <List className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
    },

    // Table controls
    {
      icon: <TableIcon className="h-4 w-4" />,
      action: () =>
        editor.isActive("table")
          ? editor.chain().focus().deleteTable().run()
          : editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 2, withHeaderRow: true })
              .run(),
      pressed: editor.isActive("table"),
    },
    {
      icon: <ListPlus className="h-4 w-4" />,
      action: () => editor.chain().focus().addRowAfter().run(),
      pressed: false,
    },
    {
      icon: <Columns className="h-4 w-4" />,
      action: () => editor.chain().focus().addColumnAfter().run(),
      pressed: false,
    },
    {
      icon: <ListX className="h-4 w-4" />,
      action: () => editor.chain().focus().deleteRow().run(),
      pressed: false,
    },
    {
      icon: <Columns3 className="h-4 w-4" />,
      action: () => editor.chain().focus().deleteColumn().run(),
      pressed: false,
    },

    // History
    {
      icon: <Undo className="h-4 w-4" />,
      action: () => editor.chain().focus().undo().run(),
      pressed: false,
    },
    {
      icon: <Redo className="h-4 w-4" />,
      action: () => editor.chain().focus().redo().run(),
      pressed: false,
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-border p-1">
      {opts.map((o, i) => (
        <Toggle
          key={i as number}
          pressed={o.pressed}
          onPressedChange={() => o.action()}
          aria-pressed={o.pressed}
          className="data-[state=on]:bg-primary/10"
        >
          {o.icon}
        </Toggle>
      ))}
    </div>
  );
}