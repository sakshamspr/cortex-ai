# CortexAI Screenshot Inventory

## Fresh captures

The current frontend was captured locally from the running Vite application on
27 October 2026 using installed Chrome through Playwright:

| File | Viewport | Description |
|---|---:|---|
| `screenshots/fresh/research-studio-desktop.png` | 1440 × 900 | Desktop Research Studio empty state, guided actions, agent controls, and composer |
| `screenshots/fresh/research-studio-mobile.png` | 390 × 844 | Mobile-width responsive layout with collapsed navigation and wrapped action controls |

These are real captures of the current code, not mockups. They intentionally
show the empty workspace because it is the safest state for documentation and
does not expose user conversations, uploaded documents, generated artifacts,
or credentials.

## Existing workflow captures

The repository also contains representative screenshots under `screenshots/`:

- `coding_agent.png`
- `web_search_agent.png`
- `ppt_agent.png`
- `image_agent.png`
- `razorpay_billing.png`

Those older captures document individual workflows and may show the previous
dark visual theme. The `screenshots/fresh/` files are the authoritative visual
reference for the current Research Studio styling.

## Capture procedure

From the repository root, with the frontend running:

```bash
mkdir -p screenshots/fresh
playwright screenshot --channel chrome \
  --viewport-size="1440,900" \
  --wait-for-timeout=3000 \
  http://127.0.0.1:5173 \
  screenshots/fresh/research-studio-desktop.png

playwright screenshot --channel chrome \
  --viewport-size="390,844" \
  --wait-for-timeout=3000 \
  http://127.0.0.1:5173 \
  screenshots/fresh/research-studio-mobile.png
```

Do not capture authenticated user data, API keys, private documents, payment
details, or unredacted trace files.
