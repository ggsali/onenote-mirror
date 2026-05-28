import { useState } from "react";
import { ChevronDown, Search, BookOpen, Pencil } from "lucide-react";
import type { AppState, Notebook, Section, SectionColor } from "@/lib/onenote/types";
import { newId } from "@/lib/onenote/seed";
import { format } from "date-fns";

const COLOR_MAP: Record<SectionColor, string> = {
  yellow: "#F2C94C",
  orange: "#F2994A",
  green: "#27AE60",
  blue: "#2F80ED",
  red: "#EB5757",
  purple: "#7B2FBE",
};

const NEXT_COLORS: SectionColor[] = ["yellow", "orange", "green", "blue", "red", "purple"];

interface Props {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
}

export function Sidebar({ state, setState }: Props) {
  const notebook =
    state.notebooks.find((n) => n.id === state.activeNotebookId) ?? state.notebooks[0];
  const activeSection =
    notebook.sections.find((s) => s.id === state.activeSectionId) ?? notebook.sections[0];

  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null);

  const selectSection = (s: Section) => {
    setState((prev) => ({
      ...prev,
      activeSectionId: s.id,
      activePageId: s.pages[0]?.id ?? "",
    }));
  };

  const selectPage = (pageId: string) => {
    setState((prev) => ({ ...prev, activePageId: pageId }));
  };

  const addSection = () => {
    setState((prev) => {
      const nb = prev.notebooks.find((n) => n.id === prev.activeNotebookId)!;
      const color = NEXT_COLORS[nb.sections.length % NEXT_COLORS.length];
      const pageId = newId();
      const newSection: Section = {
        id: newId(),
        name: "New Section",
        color,
        pages: [
          {
            id: pageId,
            title: "Untitled page",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: null,
          },
        ],
      };
      return {
        ...prev,
        notebooks: prev.notebooks.map((n) =>
          n.id === nb.id ? { ...n, sections: [...n.sections, newSection] } : n,
        ),
        activeSectionId: newSection.id,
        activePageId: pageId,
      };
    });
  };

  const addPage = () => {
    setState((prev) => {
      const pageId = newId();
      return {
        ...prev,
        notebooks: prev.notebooks.map((n) =>
          n.id !== prev.activeNotebookId
            ? n
            : {
                ...n,
                sections: n.sections.map((s) =>
                  s.id !== prev.activeSectionId
                    ? s
                    : {
                        ...s,
                        pages: [
                          ...s.pages,
                          {
                            id: pageId,
                            title: "Untitled page",
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            content: null,
                          },
                        ],
                      },
                ),
              },
        ),
        activePageId: pageId,
      };
    });
  };

  const renameSection = (id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      notebooks: prev.notebooks.map((n) =>
        n.id !== prev.activeNotebookId
          ? n
          : {
              ...n,
              sections: n.sections.map((s) => (s.id === id ? { ...s, name } : s)),
            },
      ),
    }));
  };

  return (
    <aside className="w-[220px] shrink-0 bg-[#F0EFED] border-r border-[#D4D4D4] flex flex-col text-[12px] text-[#222]">
      {/* Notebook selector */}
      <button className="flex items-center gap-2 px-3 h-9 hover:bg-[#E6E5E2] text-left">
        <BookOpen className="w-4 h-4 text-[#2F80ED]" />
        <span className="flex-1 truncate font-medium">{notebook.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
      </button>
      <button className="flex items-center px-3 h-7 hover:bg-[#E6E5E2] text-left text-[#666]">
        <Search className="w-3.5 h-3.5" />
      </button>

      {/* Sections */}
      <div className="border-t border-[#D4D4D4] py-1">
        {notebook.sections.map((s) => {
          const selected = s.id === state.activeSectionId;
          const isRenaming = renamingSectionId === s.id;
          return (
            <div
              key={s.id}
              onClick={() => !isRenaming && selectSection(s)}
              onDoubleClick={() => setRenamingSectionId(s.id)}
              className={`group flex items-center h-[26px] pr-2 cursor-default transition-colors duration-150 ${
                selected ? "bg-white font-semibold" : "hover:bg-[#E6E5E2]"
              }`}
              style={{ borderLeft: `4px solid ${COLOR_MAP[s.color]}` }}
            >
              {isRenaming ? (
                <input
                  autoFocus
                  defaultValue={s.name}
                  onBlur={(e) => {
                    renameSection(s.id, e.target.value.trim() || s.name);
                    setRenamingSectionId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") setRenamingSectionId(null);
                  }}
                  className="flex-1 ml-2 px-1 text-[12px] bg-white border border-[#7B2FBE] outline-none"
                />
              ) : (
                <>
                  <span className="flex-1 ml-2 truncate">{s.name}</span>
                  <Pencil
                    className="w-3 h-3 text-[#888] opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingSectionId(s.id);
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Pages */}
      <div className="flex-1 overflow-y-auto border-t border-[#D4D4D4] py-1">
        {activeSection?.pages.map((p) => {
          const selected = p.id === state.activePageId;
          const preview = extractPreview(p.content);
          return (
            <div
              key={p.id}
              onClick={() => selectPage(p.id)}
              className={`px-3 py-1.5 cursor-default transition-colors duration-150 border-l-2 ${
                selected
                  ? "bg-[#E8E6E2] border-[#7B2FBE]"
                  : "border-transparent hover:bg-[#E6E5E2]"
              }`}
            >
              <div className="text-[12px] text-[#1a1a1a] truncate">{p.title || "Untitled"}</div>
              <div className="text-[10px] text-[#888] mt-[1px]">
                {format(new Date(p.updatedAt), "d MMM yyyy")}
              </div>
              {preview && (
                <div className="text-[11px] text-[#888] mt-[2px] line-clamp-2 leading-tight">
                  {preview}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 h-8 border-t border-[#D4D4D4] bg-[#EAE8E5]">
        <button
          onClick={addSection}
          className="text-[11px] text-[#7B2FBE] hover:underline"
        >
          + Add section
        </button>
        <button onClick={addPage} className="text-[11px] text-[#7B2FBE] hover:underline">
          + Add page
        </button>
      </div>
    </aside>
  );
}

function extractPreview(content: Notebook["sections"][number]["pages"][number]["content"]): string {
  if (!content) return "";
  const parts: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (node.text) parts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(content);
  return parts.join(" ").slice(0, 80);
}
