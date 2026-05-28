# OneNote Mac Clone with Hidden AI

A pixel-faithful Microsoft OneNote for Mac clone. The AI is completely invisible — when the user presses Enter on a question, an LM Studio response is inserted inline as a subtle lavender note block.

## Scope

- Single-page TanStack Start app at `/` (no auth, no backend).
- All state in `localStorage`, debounced 500ms.
- LM Studio called directly from the browser (`http://localhost:1234/v1/chat/completions`).
- German UI copy where specified; chrome labels stay English to match OneNote Mac.

## Layout (3 columns under a fake macOS title bar)

```text
┌─────────────────────────────────────────────────────────────┐
│ ●●●    [traffic lights]                                     │  28px chrome
├─────────────────────────────────────────────────────────────┤
│ Home | Insert | Draw | View                                 │  28px tabs
├─────────────────────────────────────────────────────────────┤
│ [Clipboard] | [Basic Text] | [Styles] | [Tags]              │  68px ribbon
├──────────────┬──────────────────────────────────────────────┤
│ Notebook ▾   │                                              │
│ 🔍           │   Page Title (28px, weight 300)              │
│ 🟡 Idea Board│   Monday, 3 June 2019  8:36 PM               │
│ 🟠 Articles  │                                              │
│ 🟢 …         │   [TipTap editor, Calibri 14px]              │
│ 🔵 …         │                                              │
│ ── pages ─── │   [inline AI response blocks render here]    │
│ + section  + page                                           │
└──────────────┴──────────────────────────────────────────────┘
  220px sidebar          flex-1, max-width 900px content
```

## File structure

```text
src/
  routes/
    index.tsx                  # mounts <OneNoteApp />
  components/onenote/
    OneNoteApp.tsx             # top-level layout + state provider
    TitleBar.tsx               # traffic lights
    RibbonTabs.tsx             # Home/Insert/Draw/View
    Ribbon.tsx                 # the 4 groups (Clipboard, Basic Text, Styles, Tags)
    Sidebar.tsx                # notebook selector, sections, pages, add buttons
    SectionItem.tsx            # colored-tab section row + rename
    PageItem.tsx               # page row with date + preview
    Editor.tsx                 # TipTap editor + title + date + Enter interception
    AiResponseNode.tsx         # custom TipTap node for lavender response block
  lib/onenote/
    storage.ts                 # load/save notebooks to localStorage (debounced)
    seed.ts                    # first-run "Prüfungsvorbereitung" notebook
    ai.ts                      # LM Studio fetch + question detection
    types.ts                   # Notebook / Section / Page types
  styles.css                   # add OneNote color tokens
```

## Design tokens (added to `src/styles.css`)

```text
--onenote-purple: #7B2FBE        (active tab underline, + links)
--onenote-ribbon-bg: #FFFFFF
--onenote-tab-bg: #F5F5F5
--onenote-border: #D4D4D4
--onenote-sidebar-bg: #F0EFED
--onenote-page-selected: #E8E6E2
--onenote-ai-bg: #F0EEFF
--onenote-ai-border: #C4B5E8
--onenote-h1: #2E75B6
Font stack: -apple-system, "Helvetica Neue", sans-serif
```

Section colors: yellow `#F2C94C`, orange `#F2994A`, green `#27AE60`, blue `#2F80ED`, red `#EB5757` (4px left border).

## Editor & hidden AI

- TipTap with `StarterKit`, `Placeholder` ("Start typing..."), `Underline`, `Highlight`, `TextStyle`, `Color`.
- Custom node `aiResponse` (block, `content: 'inline*'`, atom=false) rendered with the lavender styling. Stored in TipTap JSON so it persists.
- Keydown handler on Enter:
  1. Read text of the current paragraph.
  2. `isQuestion(text)` = ends with `?` OR starts (case-insensitive, trimmed) with one of: `erkläre, was ist, wie, warum, zeige, fasse zusammen, erstelle, liste auf, definiere`.
  3. If yes: `preventDefault`, insert an `aiResponse` node below with placeholder `...` (animated 3-dot via CSS), call LM Studio, then replace its content with the response text. On fetch failure insert `⚠ LM Studio nicht erreichbar` (grey).
  4. Otherwise: default Enter behavior.
- LM Studio request shape exactly as specified (German system prompt, temp 0.5, max_tokens 300).

## Persistence

- `localStorage` key `onenote:v1` → `{ notebooks, activeNotebookId, activeSectionId, activePageId }`.
- Page content stored as TipTap JSON.
- Single debounced writer (500ms) on any state change.
- On first load with no data: seed notebook **Prüfungsvorbereitung** with sections Elektrotechnik, Mechanik, Mathematik, Wirtschaft, each one empty page.

## Interactions

- Click section → select; double-click name → inline rename input.
- Click page title (in editor) → contenteditable rename.
- `+ Add section` / `+ Add page` purple links at sidebar bottom.
- 150ms ease transitions on sidebar selection backgrounds.
- Cmd+Z handled by TipTap's built-in history.

## Out of scope (visual only, non-functional)

Ribbon buttons render with correct icons/labels but only the Basic Text formatting buttons (B, I, U, S, lists, alignment, highlight, color, headings) are wired to TipTap. Clipboard, Insert/Draw/View tabs, Tags, font/size dropdowns are decorative — matches "looks identical" goal without bloating scope.

## Dependencies to install

`@tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-highlight @tiptap/extension-underline @tiptap/extension-text-style @tiptap/extension-color lucide-react date-fns`

## Notes

- LM Studio runs on the user's machine; the browser will call `http://localhost:1234` directly. If the user opens the published `lovable.app` URL the call will fail (mixed content / CORS) — expected, the spec says show the grey warning. Works locally when previewing.
- No telemetry, no AI affordance anywhere in the UI — confirmed per spec.
