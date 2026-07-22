"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import EditorToolbar from "./EditorToolbar";

type Props = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({
  value,
  placeholder,
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,

      Underline,

      Highlight,

      Link.configure({
        openOnClick: false,
      }),

      Placeholder.configure({
        placeholder: placeholder,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      TaskList,

      TaskItem.configure({
        nested: true,
      }),

      CharacterCount,
    ],

    content: value,

    immediatelyRender: false,

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <>
      <EditorToolbar editor={editor} />

      <EditorContent
        editor={editor}
        className="gametube-editor"
      />
    </>
  );
}