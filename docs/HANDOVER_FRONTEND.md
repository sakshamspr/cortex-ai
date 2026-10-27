# CortexAI Frontend Handover

## 1. Frontend stack

- React 19
- Vite
- Tailwind CSS
- Redux Toolkit
- Framer Motion
- React Markdown and remark GFM
- Monaco/editor and artifact preview components
- Lucide and React Icons

## 2. Main shell

`frontend/src/pages/Home.jsx` composes:

- `Sidebar`
- `ChatArea`
- `ArtifactPanel`

The visual direction is a warm editorial research workspace:

- ivory/paper background;
- charcoal text;
- muted terracotta accent;
- sage support tones;
- restrained borders and shadows;
- serif display typography for research headings;
- no inherited black chat canvas.

## 3. Main components

| Component | Responsibility |
|---|---|
| `Sidebar.jsx` | Conversations, navigation, workspace identity |
| `Navbar.jsx` | Current workspace/header controls |
| `ChatArea.jsx` | Main composition of navbar, messages, alerts, input |
| `MessageList.jsx` | Load/render messages and loading indicator |
| `MessageBubble.jsx` | Markdown, code, images, files, trace panel |
| `ChatInput.jsx` | Prompt entry, agent choice, file upload, guided actions |
| `ArtifactPanel.jsx` | Generated artifact preview and download surface |
| `AiBanner.jsx` | User-facing errors and alerts |
| `BillingDrawer.jsx` | Legacy billing display and controls |

## 4. Guided research actions

The composer includes prompts for:

- research brief;
- presentation outline;
- study questionnaire;
- assignment generation;
- source summarization;
- supporting-source search.

These are prompt presets over existing agent routes, not separate backend
services. This keeps the code change small while making the project visibly
useful as a college research tool.

## 5. Message flow

1. User submits prompt and optional file.
2. The user message is optimistically added to Redux state.
3. `sendPrompt` posts multipart form data to the agent endpoint.
4. The response is added with `answer`, `images`, `artifacts`, and optional
   `trace`.
5. Artifacts are dispatched to the artifact panel.
6. Persisted messages are reloaded when a conversation is selected.

## 6. Trace display

The assistant bubble uses a native `<details>` panel. It currently shows:

- agent;
- tier;
- latency;
- cost;
- confidence when verification exists.

It does not yet show clickable citation chips, highlighted PDF pages, or a
full memory browser because the backend does not expose structured citation
spans or a permanent semantic memory collection.

## 7. Build and presentation checks

```bash
npm --prefix frontend run build
```

For a live demonstration:

1. use a wide desktop browser;
2. start with the empty-state research actions;
3. upload a short public-domain PDF;
4. demonstrate a grounded question;
5. demonstrate PPT or questionnaire generation;
6. expand the research trace panel;
7. explain that current quantitative benchmark values are not fabricated.

## 8. Frontend limitations

- Some legacy lint issues may exist outside the changed surface.
- The main bundle reports a size warning; the build still succeeds.
- The UI displays estimates when the backend only has estimated token/cost
  values.
- A presentation mode, evidence drawer, and export bundle are future
  enhancements.
