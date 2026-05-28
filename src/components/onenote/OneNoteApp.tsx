import { useEffect, useState, useCallback } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { TitleBar } from "./TitleBar";
import { RibbonTabs } from "./RibbonTabs";
import { Ribbon } from "./Ribbon";
import { Sidebar } from "./Sidebar";
import { Editor } from "./Editor";
import { loadState, saveStateDebounced } from "@/lib/onenote/storage";
import { allSections, findSection } from "@/lib/onenote/types";
import type { AppState, Section, Page } from "@/lib/onenote/types";

export function OneNoteApp() {
  const [state, setStateRaw] = useState<AppState | null>(null);
  const [editor, setEditor] = useState<TiptapEditor | null>(null);

  useEffect(() => {
    setStateRaw(loadState());
  }, []);

  useEffect(() => {
    if (state) saveStateDebounced(state);
  }, [state]);

  const setState = useCallback((updater: (s: AppState) => AppState) => {
    setStateRaw((prev) => (prev ? updater(prev) : prev));
  }, []);

  if (!state) {
    return <div className="h-screen w-screen bg-[#1E1E1E]" />;
  }

  const notebook = state.notebooks.find((n) => n.id === state.activeNotebookId)!;
  const sections = allSections(notebook);
  const section: Section | undefined =
    findSection(notebook, state.activeSectionId) ?? sections[0];
  const page: Page | undefined =
    section?.pages.find((p) => p.id === state.activePageId) ?? section?.pages[0];

  const updatePage = (mut: (p: Page) => Page) => {
    if (!section || !page) return;
    setState((prev) => ({
      ...prev,
      notebooks: prev.notebooks.map((n) => {
        if (n.id !== prev.activeNotebookId) return n;
        return {
          ...n,
          items: n.items.map((it) => {
            if (it.type === "section") {
              if (it.id !== section.id) return it;
              return { ...it, pages: it.pages.map((p) => (p.id === page.id ? mut(p) : p)) };
            }
            return {
              ...it,
              children: it.children.map((s) =>
                s.id !== section.id
                  ? s
                  : { ...s, pages: s.pages.map((p) => (p.id === page.id ? mut(p) : p)) },
              ),
            };
          }),
        };
      }),
    }));
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1E1E1E] text-[#D4D4D4] overflow-hidden font-onenote">
      <TitleBar />
      <RibbonTabs />
      <Ribbon editor={editor} />
      <div className="flex flex-1 min-h-0">
        <Sidebar state={state} setState={setState} />
        {page && (
          <Editor
            key={page.id}
            page={page}
            onChangeTitle={(title) =>
              updatePage((p) => ({ ...p, title, updatedAt: new Date().toISOString() }))
            }
            onChangeContent={(content: JSONContent) =>
              updatePage((p) => ({ ...p, content, updatedAt: new Date().toISOString() }))
            }
            onEditorReady={setEditor}
          />
        )}
      </div>
    </div>
  );
}
