import type { AppState, Notebook, Section } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

const SEED_SECTIONS: Array<{ name: string; color: string }> = [
  { name: "Elektrotechnik", color: "#e8c03a" },
  { name: "Mechanik", color: "#f08030" },
  { name: "Mathematik", color: "#48a848" },
  { name: "Wirtschaft", color: "#2878e0" },
];

export function createSeedState(): AppState {
  const now = new Date().toISOString();
  const sections: Section[] = SEED_SECTIONS.map(({ name, color }) => ({
    type: "section",
    id: uid(),
    name,
    color,
    pages: [
      {
        id: uid(),
        title: "Neue Seite",
        updatedAt: now,
        content: null,
      },
    ],
  }));

  const notebook: Notebook = {
    id: uid(),
    name: "Prüfungsvorbereitung",
    items: sections,
  };

  return {
    notebooks: [notebook],
    activeNotebookId: notebook.id,
    activeSectionId: sections[0].id,
    activePageId: sections[0].pages[0].id,
  };
}

export const newId = uid;
