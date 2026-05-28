import type { AppState, Section, SectionColor } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

const colors: SectionColor[] = ["yellow", "orange", "green", "blue"];
const sectionNames = ["Elektrotechnik", "Mechanik", "Mathematik", "Wirtschaft"];

export function createSeedState(): AppState {
  const now = new Date().toISOString();
  const sections: Section[] = sectionNames.map((name, i) => {
    const pageId = uid();
    return {
      id: uid(),
      name,
      color: colors[i],
      pages: [
        {
          id: pageId,
          title: "Neue Seite",
          createdAt: now,
          updatedAt: now,
          content: null,
        },
      ],
    };
  });

  const notebook = {
    id: uid(),
    name: "Prüfungsvorbereitung",
    sections,
  };

  return {
    notebooks: [notebook],
    activeNotebookId: notebook.id,
    activeSectionId: sections[0].id,
    activePageId: sections[0].pages[0].id,
  };
}

export const newId = uid;
