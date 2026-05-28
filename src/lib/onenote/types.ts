import type { JSONContent } from "@tiptap/react";

export interface Page {
  id: string;
  title: string;
  content: JSONContent | null;
  updatedAt: string;
}

export interface Section {
  type: "section";
  id: string;
  name: string;
  color: string; // hex
  pages: Page[];
}

export interface Group {
  type: "group";
  id: string;
  name: string;
  isExpanded: boolean;
  children: Section[];
}

export type Item = Section | Group;

export interface Notebook {
  id: string;
  name: string;
  items: Item[];
}

export interface AppState {
  notebooks: Notebook[];
  activeNotebookId: string;
  activeSectionId: string;
  activePageId: string;
}

export const SECTION_COLORS = [
  "#e8c03a",
  "#f08030",
  "#48a848",
  "#9050c8",
  "#2878e0",
  "#18a8c0",
  "#c83030",
  "#d01878",
  "#68a830",
  "#1850a8",
];

export function randomColor(): string {
  return SECTION_COLORS[Math.floor(Math.random() * SECTION_COLORS.length)];
}

export function allSections(notebook: Notebook): Section[] {
  const out: Section[] = [];
  for (const item of notebook.items) {
    if (item.type === "section") out.push(item);
    else out.push(...item.children);
  }
  return out;
}

export function findSection(notebook: Notebook, id: string): Section | undefined {
  return allSections(notebook).find((s) => s.id === id);
}
