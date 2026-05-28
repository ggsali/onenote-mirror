import type { JSONContent } from "@tiptap/react";

export type SectionColor = "yellow" | "orange" | "green" | "blue" | "red" | "purple";

export interface Page {
  id: string;
  title: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  content: JSONContent | null;
}

export interface Section {
  id: string;
  name: string;
  color: SectionColor;
  pages: Page[];
}

export interface Notebook {
  id: string;
  name: string;
  sections: Section[];
}

export interface AppState {
  notebooks: Notebook[];
  activeNotebookId: string;
  activeSectionId: string;
  activePageId: string;
}
