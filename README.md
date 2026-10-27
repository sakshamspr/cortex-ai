# CortexAI Research Studio

**CortexAI** is a multi-agent research workspace for turning source material
into grounded answers and presentable academic outputs.

> **Turn sources into insight.**

Upload a chapter or PDF, explore its evidence, ask questions, search for
supporting sources, and create research briefs, presentations, questionnaires,
assignments, PDFs, and other artifacts from one workspace.

## What is new

### Research Studio interface

- Warm editorial visual system with paper/ivory surfaces, charcoal typography,
  terracotta accents, sage support tones, and responsive layouts.
- Research-focused empty state instead of a generic blank chatbot.
- Guided actions for research briefs, presentations, questionnaires, and
  assignments.
- Artifact panel for generated files and previews.
- Responsive desktop and mobile layouts.

### Cost-aware routing

Common prompts are classified locally before the specialist agent runs. This
avoids spending an additional model call only to classify routine requests.

The router recognizes conversation, web search, coding, PPT, PDF, image,
vision, and PDF-RAG workflows. Explicit agent selection and uploaded-file
routing take priority.

### R3 research loop

CortexAI now includes a feature-gated **Route, Reflect, Remember** layer:

1. **Route** selects an appropriate agent and model tier.
2. **Reflect** evaluates answer claims against available evidence.
3. **Remember** stores only turns that pass the verification threshold.

The same faithfulness score is reused as:

- the answer gate;
- the routing reward;
- the memory write filter.

All R3 features default to off for backward compatibility.

### Traceability and observability

When enabled, each turn can record:

- selected agent and tier;
- routing mode and policy version;
- estimated input/output tokens;
- estimated cost and latency;
- claim-level verification;
- faithfulness score;
- accept/escalate/abstain decision;
- memory retrieval and write status;
- routing reward.

Assistant messages expose a collapsible **Research trace** panel with the most
important metadata.

### Document-to-output workflow

The PDF-RAG workflow extracts and chunks uploaded documents, retrieves relevant
passages with Qdrant, and generates a response constrained to the uploaded
source. Existing generation agents can produce:

- PowerPoint presentations;
- PDF documents;
- coding artifacts;
- images;
- research summaries and study material.

## Product architecture

```text
React + Vite Research Studio
              │
              ▼
       Express API Gateway
              │
    ┌─────────┼─────────┬─────────┐
    ▼         ▼         ▼         ▼
  Chat      Agent     Billing   Redis
 Service   Service    Service   Memory
              │
              ▼
        LangGraph Supervisor
              │
 ┌────────────┼─────────────────────────────┐
 ▼            ▼             ▼               ▼
Chat       Coding        Search          PDF-RAG
PPT        PDF           Image           Vision
              │
              ▼
       MongoDB • Qdrant • S3
```

### Services

| Service | Port | Responsibility |
|---|---:|---|
| Gateway | 8000 | CORS, security middleware, anonymous local identity, proxying |
| Chat | 8002 | Conversations and message persistence |
| Agent | 8003 | Routing, model calls, RAG, verification, artifacts |
| Billing | 8004 | Razorpay order and payment flows |
| Frontend | 5173 | Vite development server |

Authentication is intentionally disabled in the local demo runtime. The
gateway supplies an anonymous local identity. This is not production
authentication.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Redux Toolkit, Framer Motion |
| Backend | Node.js, Express, microservices |
| Orchestration | LangChain, LangGraph |
| Data | MongoDB, Redis, Qdrant |
| Models/providers | Groq, Google Gemini, OpenRouter, Tavily |
| Artifacts | PDFKit, PPTXGenJS, S3-compatible storage |
| Contracts | Zod runtime validation |

## Repository structure

```text
frontend/                 React/Vite application
backend/gateway/          API gateway
backend/services/chat/    Conversation persistence
backend/services/agent/   LangGraph agents and R3 runtime
backend/services/billing/ Payment flows
backend/shared/           Shared backend utilities
docs/                     Architecture, handover, research documentation
eval/                     Evaluation smoke harness
screenshots/fresh/        Current UI screenshots
```

## Screenshots

### Current Research Studio — desktop

![Research Studio desktop](screenshots/fresh/research-studio-desktop.png)

### Current Research Studio — mobile

![Research Studio mobile](screenshots/fresh/research-studio-mobile.png)

These screenshots were captured from the current local build and show the
present visual direction without exposing private conversations, documents, or
credentials. Capture details are documented in
[`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md).

## Run locally

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- Qdrant for PDF-RAG
- Model-provider credentials
- S3-compatible storage for generated artifacts

### Install

```bash
cd backend
npm run build

cd ../frontend
npm install
```

### Configure

Copy the templates:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Fill provider and database values locally. Never commit `.env` files.

Backend values include:

```env
FRONTEND_URL=http://localhost:5173
CHAT_SERVICE=http://localhost:8002
AGENT_SERVICE=http://localhost:8003
BILLING_SERVICE=http://localhost:8004
REDIS_URL=...
MONGODB_URL=...
GOOGLE_API_KEY=...
GROQ_API_KEY=...
OPENROUTER_API_KEY=...
TAVILY_API_KEY=...
QDRANT_URL=...
QDRANT_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_BUCKET_NAME=...
```

Frontend values:

```env
VITE_SERVER_URL=http://localhost:8000
VITE_RAZORPAY_KEY=...
```

### Start

Terminal 1:

```bash
cd backend
npm start
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## R3 configuration

```env
R3_ROUTER=off
R3_VERIFIER=off
R3_MEMORY=off
```

Recommended demonstration order:

1. Start with all flags off.
2. Use `R3_ROUTER=shadow` to observe policy decisions safely.
3. Enable `R3_VERIFIER=on` to expose claim and gate metadata.
4. Enable `R3_MEMORY=on` after confirming Redis connectivity.
5. Use `R3_ROUTER=live` only after reviewing traces.

Traces are written to `traces/turns.jsonl` and policy state to
`traces/policy.json` when the corresponding features are used.

## Validation

```bash
npm --prefix backend/services/agent run test:r3
npm --prefix backend/services/agent run eval:r3
npm --prefix frontend run build
git diff --check
```

Current verified checks:

- 5 R3 unit tests pass;
- frontend production build passes;
- supervisor graph compiles;
- backend syntax checks pass;
- zero-cost evaluation smoke harness passes.

The repository does not yet contain a labelled benchmark dataset or real
trace corpus. Routing accuracy, quality, latency, cost savings, and ablation
results are therefore **TBD (run eval)** and must not be presented as
measured results.

## Deployment

The frontend is compatible with Vercel:

```bash
vercel login
vercel --cwd frontend --prod
```

Configure `VITE_SERVER_URL` in Vercel to a deployed backend gateway. Vercel
hosts the frontend only; the Node services, MongoDB, Redis, Qdrant, and object
storage must be hosted separately.

The maintained source repository is
[github.com/sakshamspr/cortex-ai](https://github.com/sakshamspr/cortex-ai).

## Documentation

- [`docs/HANDOVER_INDEX.md`](docs/HANDOVER_INDEX.md) — complete technical handover
- [`docs/HANDOVER_SYSTEM.md`](docs/HANDOVER_SYSTEM.md) — architecture and services
- [`docs/HANDOVER_RUNTIME.md`](docs/HANDOVER_RUNTIME.md) — setup and operations
- [`docs/HANDOVER_R3.md`](docs/HANDOVER_R3.md) — R3 implementation
- [`docs/HANDOVER_FRONTEND.md`](docs/HANDOVER_FRONTEND.md) — frontend behavior
- [`docs/HANDOVER_EVALUATION.md`](docs/HANDOVER_EVALUATION.md) — benchmark status
- [`docs/HANDOVER_SECURITY.md`](docs/HANDOVER_SECURITY.md) — security checklist
- [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md) — screenshot provenance

## Security

Never commit credentials, local environment files, private documents, or raw
traces. Development credentials previously used for this project should be
rotated before any public deployment. See
[`docs/HANDOVER_SECURITY.md`](docs/HANDOVER_SECURITY.md).
