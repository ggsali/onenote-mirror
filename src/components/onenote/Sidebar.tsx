import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, LayoutGrid, Search, Clock } from "lucide-react";
import type { AppState, Notebook, Section, Group, Page } from "@/lib/onenote/types";
import { allSections, findSection, randomColor } from "@/lib/onenote/types";
import { newId } from "@/lib/onenote/seed";
import { format } from "date-fns";

interface Props {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
}

export function Sidebar({ state, setState }: Props) {
  const notebook =
    state.notebooks.find((n) => n.id === state.activeNotebookId) ?? state.notebooks[0];
  const activeSection =
    findSection(notebook, state.activeSectionId) ?? allSections(notebook)[0];

  return (
    <div className="flex shrink-0 select-none">
      <IconRail />
      <SectionsPanel notebook={notebook} state={state} setState={setState} />
      <PagesPanel section={activeSection} state={state} setState={setState} />
    </div>
  );
}

// ---------- Icon Rail ----------

function IconRail() {
  const [active, setActive] = useState<"sections" | "search" | "recent">("sections");
  const Item = ({
    id,
    Icon,
  }: {
    id: "sections" | "search" | "recent";
    Icon: React.ComponentType<{ className?: string }>;
  }) => {
    const isActive = active === id;
    return (
      <button
        onClick={() => setActive(id)}
        className="flex items-center justify-center w-10 h-10"
      >
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
            isActive ? "bg-[#5B2D8E] text-white" : "text-[#555] hover:text-[#999]"
          }`}
        >
          <Icon className="w-5 h-5" />
        </span>
      </button>
    );
  };
  return (
    <div className="w-10 bg-[#1a1a1a] border-r border-[#111] flex flex-col items-center pt-2 gap-1">
      <Item id="sections" Icon={LayoutGrid} />
      <Item id="search" Icon={Search} />
      <Item id="recent" Icon={Clock} />
    </div>
  );
}

// ---------- Sections Panel ----------

function NotebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="10" height="12" rx="1" fill="#7B2FBE" />
      <rect x="11" y="3" width="3" height="10" rx="0.5" fill="#5B2D8E" />
      <rect x="3.5" y="4" width="6.5" height="0.8" fill="#fff" opacity="0.6" />
      <rect x="3.5" y="6" width="6.5" height="0.8" fill="#fff" opacity="0.4" />
      <rect x="3.5" y="8" width="6.5" height="0.8" fill="#fff" opacity="0.4" />
    </svg>
  );
}

function SectionsPanel({
  notebook,
  state,
  setState,
}: {
  notebook: Notebook;
  state: AppState;
  setState: Props["setState"];
}) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!addOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!addRef.current?.contains(e.target as Node)) setAddOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [addOpen]);

  const selectSection = (s: Section) => {
    setState((prev) => ({
      ...prev,
      activeSectionId: s.id,
      activePageId: s.pages[0]?.id ?? "",
    }));
  };

  const rename = (id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      notebooks: prev.notebooks.map((n) =>
        n.id !== prev.activeNotebookId
          ? n
          : {
              ...n,
              items: n.items.map((it) => {
                if (it.id === id) return { ...it, name };
                if (it.type === "group") {
                  return {
                    ...it,
                    children: it.children.map((s) => (s.id === id ? { ...s, name } : s)),
                  };
                }
                return it;
              }),
            },
      ),
    }));
  };

  const toggleGroup = (id: string) => {
    setState((prev) => ({
      ...prev,
      notebooks: prev.notebooks.map((n) =>
        n.id !== prev.activeNotebookId
          ? n
          : {
              ...n,
              items: n.items.map((it) =>
                it.type === "group" && it.id === id
                  ? { ...it, isExpanded: !it.isExpanded }
                  : it,
              ),
            },
      ),
    }));
  };

  const addSection = () => {
    setAddOpen(false);
    const sectionId = newId();
    const pageId = newId();
    const newSection: Section = {
      type: "section",
      id: sectionId,
      name: "Neuer Abschnitt",
      color: randomColor(),
      pages: [
        {
          id: pageId,
          title: "Neue Seite",
          updatedAt: new Date().toISOString(),
          content: null,
        },
      ],
    };
    setState((prev) => ({
      ...prev,
      notebooks: prev.notebooks.map((n) =>
        n.id !== prev.activeNotebookId ? n : { ...n, items: [...n.items, newSection] },
      ),
      activeSectionId: sectionId,
      activePageId: pageId,
    }));
    setRenamingId(sectionId);
  };

  const addGroup = () => {
    setAddOpen(false);
    const groupId = newId();
    const sectionId = newId();
    const pageId = newId();
    const newGroup: Group = {
      type: "group",
      id: groupId,
      name: "Neue Abschnittsgruppe",
      isExpanded: true,
      children: [
        {
          type: "section",
          id: sectionId,
          name: "Neuer Abschnitt",
          color: randomColor(),
          pages: [
            {
              id: pageId,
              title: "Neue Seite",
              updatedAt: new Date().toISOString(),
              content: null,
            },
          ],
        },
      ],
    };
    setState((prev) => ({
      ...prev,
      notebooks: prev.notebooks.map((n) =>
        n.id !== prev.activeNotebookId ? n : { ...n, items: [...n.items, newGroup] },
      ),
      activeSectionId: sectionId,
      activePageId: pageId,
    }));
    setRenamingId(groupId);
  };

  const renderSectionRow = (s: Section, indented: boolean) => {
    const selected = s.id === state.activeSectionId;
    const isRenaming = renamingId === s.id;
    return (
      <div
        key={s.id}
        onClick={() => !isRenaming && selectSection(s)}
        onDoubleClick={() => setRenamingId(s.id)}
        className={`flex items-center h-7 pr-2 cursor-default transition-colors duration-150 ${
          selected ? "bg-[#2d2d2d] text-[#e8e8e8]" : "text-[#a8a8a8] hover:bg-[#252525]"
        }`}
        style={{ paddingLeft: indented ? 20 : 9 }}
      >
        <span
          className="shrink-0"
          style={{
            width: 4,
            height: 20,
            borderRadius: 3,
            backgroundColor: s.color,
          }}
        />
        {isRenaming ? (
          <input
            autoFocus
            defaultValue={s.name}
            onBlur={(e) => {
              rename(s.id, e.target.value.trim() || s.name);
              setRenamingId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setRenamingId(null);
            }}
            className="flex-1 ml-2 px-1 text-[12px] bg-[#1c1c1c] border border-[#5B2D8E] text-[#e8e8e8] outline-none"
          />
        ) : (
          <span
            className="flex-1 ml-2 truncate text-[12px]"
            style={{ letterSpacing: "-0.2px" }}
          >
            {s.name}
          </span>
        )}
      </div>
    );
  };

  const renderGroup = (g: Group) => {
    const isRenaming = renamingId === g.id;
    return (
      <div key={g.id}>
        <div
          onClick={() => !isRenaming && toggleGroup(g.id)}
          onDoubleClick={() => setRenamingId(g.id)}
          className="flex items-center h-7 pl-2 pr-2 cursor-default text-[#a8a8a8] hover:bg-[#252525]"
        >
          <ChevronRight
            className="w-2.5 h-2.5 text-[#777] transition-transform duration-150 shrink-0"
            style={{ transform: g.isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
          />
          {isRenaming ? (
            <input
              autoFocus
              defaultValue={g.name}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                rename(g.id, e.target.value.trim() || g.name);
                setRenamingId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setRenamingId(null);
              }}
              className="flex-1 ml-2 px-1 text-[12px] bg-[#1c1c1c] border border-[#5B2D8E] text-[#e8e8e8] outline-none"
            />
          ) : (
            <span
              className="flex-1 ml-2 truncate text-[12px]"
              style={{ letterSpacing: "-0.2px" }}
            >
              {g.name}
            </span>
          )}
        </div>
        <div
          className="overflow-hidden transition-[max-height] duration-200 ease"
          style={{ maxHeight: g.isExpanded ? g.children.length * 28 + 4 : 0 }}
        >
          {g.children.map((c) => renderSectionRow(c, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-[160px] bg-[#1c1c1c] border-r border-[#111] flex flex-col">
      {/* Notebook header */}
      <button className="flex items-center h-9 px-2 gap-2 hover:bg-[#252525] border-b border-[#282828]">
        <NotebookIcon />
        <span
          className="flex-1 text-left truncate text-[12px] text-[#d4d4d4]"
          style={{ letterSpacing: "-0.2px" }}
        >
          {notebook.name}
        </span>
        <ChevronDown className="w-3 h-3 text-[#555]" />
      </button>

      {/* Items */}
      <div className="flex-1 overflow-y-auto py-1">
        {notebook.items.map((it) =>
          it.type === "section" ? renderSectionRow(it, false) : renderGroup(it),
        )}
      </div>

      {/* Footer */}
      <div
        ref={addRef}
        className="relative flex items-center justify-between h-[34px] px-3 border-t border-[#282828]"
      >
        <button
          onClick={addSection}
          className="text-[11px] text-[#5a5a5a] hover:text-[#a8a8a8]"
        >
          Add section
        </button>
        <button
          onClick={() => setAddOpen((v) => !v)}
          className="text-[#5a5a5a] hover:text-[#a8a8a8] text-[11px] px-1"
        >
          ▾
        </button>
        {addOpen && (
          <div className="absolute right-2 bottom-[36px] w-[170px] bg-[#2a2a2a] border border-[#3a3a3a] rounded shadow-lg z-10">
            <button
              onClick={addSection}
              className="block w-full text-left text-[12px] text-[#ccc] px-3 py-[7px] hover:bg-[#383838]"
            >
              New Section
            </button>
            <button
              onClick={addGroup}
              className="block w-full text-left text-[12px] text-[#ccc] px-3 py-[7px] hover:bg-[#383838]"
            >
              New Section Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Pages Panel ----------

function PagesPanel({
  section,
  state,
  setState,
}: {
  section: Section | undefined;
  state: AppState;
  setState: Props["setState"];
}) {
  const addPage = () => {
    if (!section) return;
    const pageId = newId();
    const page: Page = {
      id: pageId,
      title: "Neue Seite",
      updatedAt: new Date().toISOString(),
      content: null,
    };
    setState((prev) => ({
      ...prev,
      notebooks: prev.notebooks.map((n) => {
        if (n.id !== prev.activeNotebookId) return n;
        return {
          ...n,
          items: n.items.map((it) => {
            if (it.type === "section" && it.id === section.id) {
              return { ...it, pages: [...it.pages, page] };
            }
            if (it.type === "group") {
              return {
                ...it,
                children: it.children.map((s) =>
                  s.id === section.id ? { ...s, pages: [...s.pages, page] } : s,
                ),
              };
            }
            return it;
          }),
        };
      }),
      activePageId: pageId,
    }));
  };

  const selectPage = (id: string) => {
    setState((prev) => ({ ...prev, activePageId: id }));
  };

  return (
    <div className="w-[200px] bg-[#242424] border-r border-[#1a1a1a] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {section?.pages.map((p) => {
          const selected = p.id === state.activePageId;
          const preview = extractPreview(p.content);
          return (
            <div
              key={p.id}
              onClick={() => selectPage(p.id)}
              className={`flex items-start gap-2 px-2 py-[7px] border-b border-[#1c1c1c] cursor-default transition-colors duration-150 ${
                selected ? "bg-[#2c2c2c]" : "hover:bg-[#2a2a2a]"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[12px] truncate ${
                    selected ? "text-[#e0e0e0]" : "text-[#c0c0c0]"
                  }`}
                  style={{ letterSpacing: "-0.2px" }}
                >
                  {p.title || "Untitled"}
                </div>
                <div className="text-[11px] text-[#5a5a5a] truncate mt-[2px]">
                  {preview || format(new Date(p.updatedAt), "d MMM")}
                </div>
              </div>
              <div className="w-[42px] h-[30px] bg-[#1a1a1a] border border-[#303030] rounded-[2px] shrink-0 flex flex-col justify-center gap-[3px] px-[4px]">
                <div className="h-[2px] bg-[#333] rounded-sm" />
                <div className="h-[2px] bg-[#333] rounded-sm w-3/4" />
                <div className="h-[2px] bg-[#333] rounded-sm w-2/3" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center h-[34px] px-3 border-t border-[#282828]">
        <button
          onClick={addPage}
          className="text-[11px] text-[#5a5a5a] hover:text-[#a8a8a8]"
        >
          Add page
        </button>
      </div>
    </div>
  );
}

function extractPreview(content: Page["content"]): string {
  if (!content) return "";
  const parts: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { text?: string; content?: unknown[] };
    if (n.text) parts.push(n.text);
    if (Array.isArray(n.content)) n.content.forEach(walk);
  };
  walk(content);
  return parts.join(" ").slice(0, 80);
}
