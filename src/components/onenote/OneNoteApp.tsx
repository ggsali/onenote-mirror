import { useEffect, useState, useCallback } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { TitleBar } from "./TitleBar";
import { RibbonTabs } from "./RibbonTabs";
import { Ribbon } from "./Ribbon";
import { Sidebar } from "./Sidebar";
import { Editor } from "./Editor";
import { loadState, saveStateDebounced } from "@/lib/onenote/storage";
import type { AppState } from "@/lib/onenote/types";

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
    return <div className="h-screen w-screen bg-white" />;
  }

  const notebook = state.notebooks.find((n) => n.id === state.activeNotebookId)!;
  const section =
    notebook.sections.find((s) => s.id === state.activeSectionId) ?? notebook.sections[0];
  const page = section.pages.find((p) => p.id === state.activePageId) ?? section.pages[0];

  const updatePage = (mut: (p: typeof page) => typeof page) => {
    setState((prev) => ({
      ...prev,
      notebooks: prev.notebooks.map((n) =>
        n.id !== prev.activeNotebookId
          ? n
          : {
              ...n,
              sections: n.sections.map((s) =>
                s.id !== section.id
                  ? s
                  : {
                      ...s,
                      pages: s.pages.map((p) => (p.id === page.id ? mut(p) : p)),
                    },
              ),
            },
      ),
    }));
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-[#222] overflow-hidden font-onenote">
      <TitleBar />
      <RibbonTabs />
      <Ribbon editor={editor} />
      <div className="flex flex-1 min-h-0">
        <Sidebar state={state} setState={setState} />
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
      </div>
    </div>
  );
}
