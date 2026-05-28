import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { isQuestion, askLmStudio } from "@/lib/onenote/ai";
import type { Page } from "@/lib/onenote/types";
import type { JSONContent } from "@tiptap/react";

interface Props {
  page: Page;
  onChangeTitle: (title: string) => void;
  onChangeContent: (content: JSONContent) => void;
  onEditorReady: (editor: TiptapEditor | null) => void;
}

export function Editor({ page, onChangeTitle, onChangeContent, onEditorReady }: Props) {
  const titleRef = useRef<HTMLDivElement>(null);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        Highlight.configure({ multicolor: true }),
        TextStyle,
        Color,
        Placeholder.configure({ placeholder: "" }),
      ],
      content: page.content ?? { type: "doc", content: [{ type: "paragraph" }] },
      editorProps: {
        attributes: {
          class: "onenote-prose focus:outline-none min-h-[400px]",
        },
        handleKeyDown: (view, event) => {
          if (event.key !== "Enter" || event.shiftKey) return false;
          const { state } = view;
          const { $from } = state.selection;
          const para = $from.parent;
          if (para.type.name !== "paragraph") return false;
          const text = para.textContent;
          if (!isQuestion(text)) return false;

          // Allow default Enter (new paragraph). Fire AI silently in background.
          const question = text;
          askLmStudio(question)
            .then((answer) => {
              if (!editor) return;
              const lines = answer.split("\n").filter((l) => l.trim().length > 0);
              const nodes = lines.map((line) => ({
                type: "paragraph",
                content: [{ type: "text", text: line }],
              }));
              const insertAt = editor.state.selection.from;
              editor.chain().focus().insertContentAt(insertAt, nodes).run();
            })
            .catch(() => {
              // Silent failure — AI is invisible.
            });
          return false;
        },
      },
      onUpdate: ({ editor }) => {
        onChangeContent(editor.getJSON());
      },
    },
    [page.id],
  );

  useEffect(() => {
    onEditorReady(editor);
    return () => onEditorReady(null);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (titleRef.current && titleRef.current.innerText !== page.title) {
      titleRef.current.innerText = page.title;
    }
  }, [page.id, page.title]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E1E1E]">
      <div className="max-w-[900px] mx-auto pt-10 pb-32 px-[60px]">
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChangeTitle(e.currentTarget.innerText.trim() || "Neue Seite")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLDivElement).blur();
              editor?.commands.focus("start");
            }
          }}
          className="text-[26px] font-light text-[#E8E8E8] outline-none leading-tight"
        />
        <div className="text-[12px] text-[#555] mt-2 mb-6">
          {format(new Date(page.updatedAt), "EEEE, d MMMM yyyy  h:mm a")}
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
