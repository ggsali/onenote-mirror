import { Node, mergeAttributes } from "@tiptap/core";

export const AiResponse = Node.create({
  name: "aiResponse",
  group: "block",
  content: "inline*",
  defining: true,
  addAttributes() {
    return {
      state: {
        default: "ready", // 'loading' | 'ready' | 'error'
        parseHTML: (el) => el.getAttribute("data-state") || "ready",
        renderHTML: (attrs) => ({ "data-state": attrs.state }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-ai-response]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-ai-response": "true", class: "ai-response-block" }),
      0,
    ];
  },
});
