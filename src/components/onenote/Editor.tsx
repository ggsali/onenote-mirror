import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { AiResponse } from "./AiResponseNode";
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
        Placeholder.configure({ placeholder: "Start typing..." }),
        AiResponse,
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

          event.preventDefault();
          // Insert AI response block after the current paragraph
          const endPos = $from.end();
          editor
            ?.chain()
            .focus()
            .insertContentAt(endPos + 1, {
              type: "aiResponse",
              attrs: { state: "loading" },
              content: [{ type: "text", text: "…" }],
            })
            .run();

          // Find inserted node position and stream-ish
          const question = text;
          const responsePos = endPos + 1;
          askLmStudio(question)
            .then((answer) => {
              replaceAiBlock(editor, responsePos, answer, "ready");
            })
            .catch(() => {
              replaceAiBlock(
                editor,
                responsePos,
                "⚠ LM Studio nicht erreichbar",
                "error",
              );
            });
          return true;
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
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[900px] mx-auto pt-10 pb-32 px-[60px]">
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChangeTitle(e.currentTarget.innerText.trim() || "Untitled page")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLDivElement).blur();
              editor?.commands.focus("start");
            }
          }}
          className="text-[28px] font-light text-[#1a1a1a] outline-none leading-tight"
        />
        <div className="text-[12px] text-[#888] mt-2 mb-6">
          {format(new Date(page.updatedAt), "EEEE, d MMMM yyyy  h:mm a")}
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function replaceAiBlock(
  editor: TiptapEditor | null,
  pos: number,
  text: string,
  state: "ready" | "error",
) {
  if (!editor) return;
  // Find the aiResponse node at or near pos
  const doc = editor.state.doc;
  let nodePos: number | null = null;
  let nodeSize = 0;
  doc.descendants((node, p) => {
    if (node.type.name === "aiResponse" && nodePos === null && p >= pos - 2) {
      nodePos = p;
      nodeSize = node.nodeSize;
      return false;
    }
    return undefined;
  });
  if (nodePos === null) return;
  editor
    .chain()
    .focus()
    .deleteRange({ from: nodePos, to: nodePos + nodeSize })
    .insertContentAt(nodePos, {
      type: "aiResponse",
      attrs: { state },
      content: text
        .split("\n")
        .filter(Boolean)
        .flatMap((line, i) =>
          i === 0
            ? [{ type: "text", text: line }]
            : [{ type: "hardBreak" }, { type: "text", text: line }],
        ),
    })
    .run();
}
