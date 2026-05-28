import { createFileRoute } from "@tanstack/react-router";
import { OneNoteApp } from "@/components/onenote/OneNoteApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OneNote" },
      { name: "description", content: "Microsoft OneNote for Mac" },
    ],
  }),
  component: Index,
});

function Index() {
  return <OneNoteApp />;
}
