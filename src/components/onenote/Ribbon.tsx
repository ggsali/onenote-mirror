import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  IndentDecrease,
  IndentIncrease,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  ClipboardPaste,
  Scissors,
  Copy,
  Paintbrush,
  CheckSquare,
  Star,
  Subscript,
  Superscript,
} from "lucide-react";

interface Props {
  editor: Editor | null;
}

function Sep() {
  return <div className="w-px h-full bg-[#D4D4D4] mx-1" />;
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-[#666] text-center pt-1 select-none">{children}</div>
  );
}

function MiniBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick?: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex items-center justify-center w-[22px] h-[22px] rounded-sm text-[#333] hover:bg-[#E5E5E5] ${
        active ? "bg-[#D9D9D9]" : ""
      }`}
    >
      {children}
    </button>
  );
}

export function Ribbon({ editor }: Props) {
  return (
    <div className="flex h-[68px] bg-white border-b border-[#D4D4D4] text-[11px] text-[#333] select-none">
      {/* Clipboard */}
      <div className="flex flex-col px-2 pt-1">
        <div className="flex gap-2 flex-1">
          <button
            onMouseDown={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-between w-[46px] py-1 hover:bg-[#F0F0F0] rounded-sm"
          >
            <ClipboardPaste className="w-5 h-5 text-[#7B2FBE]" />
            <span className="text-[10px] leading-none mt-1">Paste</span>
          </button>
          <div className="flex flex-col gap-[2px] justify-center">
            <button className="flex items-center gap-1 px-1 h-[18px] hover:bg-[#F0F0F0] rounded-sm">
              <Scissors className="w-3 h-3" /> <span className="text-[10px]">Cut</span>
            </button>
            <button className="flex items-center gap-1 px-1 h-[18px] hover:bg-[#F0F0F0] rounded-sm">
              <Copy className="w-3 h-3" /> <span className="text-[10px]">Copy</span>
            </button>
            <button className="flex items-center gap-1 px-1 h-[18px] hover:bg-[#F0F0F0] rounded-sm">
              <Paintbrush className="w-3 h-3" /> <span className="text-[10px]">Format</span>
            </button>
          </div>
        </div>
        <GroupLabel>Clipboard</GroupLabel>
      </div>

      <Sep />

      {/* Basic Text */}
      <div className="flex flex-col px-2 pt-1 min-w-[440px]">
        <div className="flex flex-col gap-1 flex-1 justify-center">
          <div className="flex items-center gap-1">
            <select
              className="h-[20px] text-[11px] border border-[#C8C8C8] bg-white px-1 w-[140px]"
              defaultValue="Verdana"
            >
              <option>Verdana</option>
              <option>Calibri</option>
              <option>Helvetica</option>
              <option>Times New Roman</option>
            </select>
            <select
              className="h-[20px] text-[11px] border border-[#C8C8C8] bg-white px-1 w-[50px]"
              defaultValue="12"
            >
              {[9, 10, 11, 12, 14, 16, 18, 24, 36].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <Sep />
            <MiniBtn
              title="Bullet list"
              active={editor?.isActive("bulletList")}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn
              title="Numbered list"
              active={editor?.isActive("orderedList")}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn title="Decrease indent">
              <IndentDecrease className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn title="Increase indent">
              <IndentIncrease className="w-3.5 h-3.5" />
            </MiniBtn>
            <Sep />
            <MiniBtn title="Align left">
              <AlignLeft className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn title="Align center">
              <AlignCenter className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn title="Align right">
              <AlignRight className="w-3.5 h-3.5" />
            </MiniBtn>
          </div>
          <div className="flex items-center gap-[2px]">
            <MiniBtn
              title="Bold"
              active={editor?.isActive("bold")}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn
              title="Italic"
              active={editor?.isActive("italic")}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn
              title="Underline"
              active={editor?.isActive("underline")}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn
              title="Strikethrough"
              active={editor?.isActive("strike")}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn title="Subscript">
              <Subscript className="w-3.5 h-3.5" />
            </MiniBtn>
            <MiniBtn title="Superscript">
              <Superscript className="w-3.5 h-3.5" />
            </MiniBtn>
            <Sep />
            <div className="flex flex-col items-center">
              <MiniBtn
                title="Highlight"
                active={editor?.isActive("highlight")}
                onClick={() => editor?.chain().focus().toggleHighlight({ color: "#FFF59D" }).run()}
              >
                <Highlighter className="w-3.5 h-3.5" />
              </MiniBtn>
              <div className="w-4 h-[3px] bg-[#FFF59D]" />
            </div>
            <div className="flex flex-col items-center">
              <MiniBtn
                title="Font color"
                onClick={() => editor?.chain().focus().setColor("#C00000").run()}
              >
                <span className="text-[12px] font-serif leading-none">A</span>
              </MiniBtn>
              <div className="w-4 h-[3px] bg-[#C00000]" />
            </div>
          </div>
        </div>
        <GroupLabel>Basic Text</GroupLabel>
      </div>

      <Sep />

      {/* Styles */}
      <div className="flex flex-col px-2 pt-1">
        <div className="flex flex-col gap-1 flex-1 justify-center">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className="border border-[#C8C8C8] px-3 py-[2px] text-[12px] text-[#2E75B6] bg-white hover:bg-[#F0F0F0] min-w-[120px] text-left"
          >
            Heading 1
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className="border border-[#C8C8C8] px-3 py-[2px] text-[11px] text-[#2E75B6] bg-white hover:bg-[#F0F0F0] min-w-[120px] text-left"
          >
            Heading 2
          </button>
        </div>
        <GroupLabel>Styles</GroupLabel>
      </div>

      <Sep />

      {/* Tags */}
      <div className="flex flex-col px-2 pt-1">
        <div className="flex gap-2 flex-1 items-center">
          <button className="flex flex-col items-center justify-center w-[46px] py-1 hover:bg-[#F0F0F0] rounded-sm">
            <CheckSquare className="w-5 h-5 text-[#5B7FBE]" />
            <span className="text-[10px] mt-[2px]">To Do</span>
          </button>
          <button className="flex flex-col items-center justify-center w-[46px] py-1 hover:bg-[#F0F0F0] rounded-sm">
            <Star className="w-5 h-5 text-[#E8B53A]" />
            <span className="text-[10px] mt-[2px]">Important</span>
          </button>
        </div>
        <GroupLabel>Tags</GroupLabel>
      </div>
    </div>
  );
}
