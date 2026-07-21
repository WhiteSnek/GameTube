import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Link,
  Code,
  Highlighter,
  Strikethrough,
} from "lucide-react";

type Props = {
  editor: Editor;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md transition-all",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-red-600 text-white shadow-sm hover:bg-red-700"
          : "text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
      )}
    >
      {children}
    </button>
  );
}

export default function EditorToolbar({ editor }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
      {/* Undo / Redo */}
      <ToolbarButton
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 size={18} />
      </ToolbarButton>

      <ToolbarButton
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 size={18} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* Headings */}
      <ToolbarButton
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        <Heading1 size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 size={18} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* Text Formatting */}
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter size={18} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* Lists */}
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={18} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* Block Elements */}
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={18} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* Link */}
      <ToolbarButton
        active={editor.isActive("link")}
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("Enter URL", previousUrl);

          if (url === null) return;

          if (url === "") {
            editor.chain().focus().unsetLink().run();
            return;
          }

          editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        <Link size={18} />
      </ToolbarButton>
    </div>
  );
}