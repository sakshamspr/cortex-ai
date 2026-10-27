# CortexAI System Handover

## 1. Product identity

CortexAI is a multi-agent research workspace. Its intended presentation is not
just “a chatbot”; it is a source-to-output environment where a user can upload
academic material, ask questions, search for supporting information, and
produce structured learning artifacts.

The product narrative is:

> Turn sources into insight.

The research contribution is the R3 loop:

- **Route** — choose an appropriate agent and model tier.
- **Reflect** — inspect answer groundedness and make a gate decision.
- **Remember** — retain only verified information.

The original multi-agent behavior remains available. R3 behavior is additive
and controlled by environment flags.

## 2. Repository layout

| Path | Responsibility |
|---|---|
| `frontend/` | React/Vite single-page application |
| `backend/gateway/` | Public HTTP entry point and proxy |
| `backend/services/chat/` | Conversation and message persistence |
| `backend/services/agent/` | LangGraph orchestration and model agents |
| `backend/services/billing/` | Razorpay order/payment flows |
| `backend/services/auth/` | Legacy authentication service files; not started locally |
| `backend/shared/` | Shared Redis and other backend utilities |
| `docs/` | Architecture, R3 progress, handover, and research documentation |
| `eval/` | Zero-cost trace smoke harness and evaluation notes |
| `traces/` | Runtime JSONL traces when R3 requests are executed |

## 3. Service topology

| Component | Port | Purpose |
|---|---:|---|
| Gateway | 8000 | CORS, security middleware, anonymous identity, proxying |
| Chat service | 8002 | Conversations and messages in MongoDB |
| Agent service | 8003 | Routing, model calls, RAG, generated outputs |
| Billing service | 8004 | Razorpay flows and payment records |
| Frontend | 5173 | Vite development server |
| Redis | 6379 or hosted URL | Short-term memory, rate limits, R3 episodic memory |
| MongoDB | configured URL | Chat and billing persistence |
| Qdrant | configured URL | Temporary PDF-RAG collections |
| S3-compatible storage | configured values | Generated artifact hosting |

Authentication is intentionally disabled for the local runtime. The gateway
injects an anonymous identity:

```text
userId: anonymous-local-user
email: local@cortex-ai.test
```

Do not treat this mode as production authentication.

## 4. Request lifecycle

### 4.1 Frontend to gateway

The frontend uses the gateway URL configured in `frontend/.env`. It sends:

- conversation requests through `/api/chat/...`;
- agent requests through `/api/agent/chat`;
- billing requests through the billing proxy where applicable.

The gateway forwards requests to internal services and adds the local
anonymous identity headers.

### 4.2 Agent controller

`backend/services/agent/controllers/agent.controller.js`:

1. Reads `prompt`, `conversationId`, `agent`, and optional uploaded file.
2. Stores the user message in Redis-backed short-term memory.
3. Persists the user message through the chat service.
4. Invokes the compiled LangGraph.
5. Computes execution metadata for the turn.
6. Optionally writes verification, gate, memory, and reward fields.
7. Writes a validated JSONL trace.
8. Stores the assistant response and artifacts.
9. Returns `answer`, `images`, `artifacts`, and `trace`.

### 4.3 Graph

Current logical graph:

```text
START
  ↓
router
  ├── chat ───────┐
  ├── coding ─────┤
  ├── search → chat
  ├── pdf ────────┤
  ├── ppt ────────┤
  ├── image ──────┤
  ├── vision ──── ┤
  └── pdf_rag ────┘
                  ↓
               verifier
                  ↓
                 END
```

The verifier node is a no-op when `R3_VERIFIER=off`, so the incumbent behavior
is preserved by default.

## 5. Agents

### Conversation agent

Uses Redis conversation history and the configured chat model. It can also
receive web search context and verified R3 memory context.

### Coding agent

Uses the OpenRouter model path and returns Markdown/code-oriented answers. The
frontend renders code blocks and supports an artifact preview workflow for
generated files.

### Search agent

Uses Tavily to retrieve current web results. The search node passes results to
the chat agent for synthesis.

### PDF generation agent

Uses an LLM to create content, PDFKit to generate a document, and configured
object storage helpers to upload the generated file.

### PPT generation agent

Uses an LLM to create slide content and PPTXGenJS to produce a downloadable
PowerPoint artifact.

### Image agent

Uses the configured image-generation path and returns generated image assets.

### Vision agent

Reads an uploaded image and sends a multimodal request to the Gemini model
path.

### PDF-RAG agent

1. Reads the uploaded PDF.
2. Extracts text with `pdf-parse`.
3. Splits text into chunks of approximately 1,000 characters with overlap.
4. Creates a temporary Qdrant collection.
5. Retrieves the five most relevant chunks.
6. Sends the context and question to the PDF-RAG model.
7. Deletes the uploaded file and temporary collection in cleanup.

The response is instructed to answer only from the uploaded PDF. Structured
page-level citations are not yet exposed in the API.

## 6. Data stores

### Redis

The existing short-term memory stores up to 20 messages per conversation with
a 24-hour expiry. Rate-limit counters also use Redis.

When R3 memory is enabled, verified episodic records are stored under a
separate `r3:episodic:<conversationId>` key, with a bounded list and expiry.

### MongoDB

The chat service stores conversations and messages. Assistant messages may
include a mixed `trace` field containing the R3 metadata returned by the agent
service.

### Qdrant

PDF-RAG uses temporary collections. The current implementation does not
maintain a permanent document collection or a semantic R3 memory collection.

### Object storage

PDF, PPT, image, and other generated artifacts may be uploaded to configured
S3-compatible storage and returned through download URLs.

## 7. Compatibility decisions

- Existing endpoints are retained.
- R3 adds response fields instead of replacing `answer`, `images`, or
  `artifacts`.
- All R3 flags default to off.
- Authentication was not reintroduced after being removed for local use.
- Payment code remains present, but local credit deduction is a no-op.
- The repository remains JavaScript; Zod provides runtime contracts without a
  TypeScript migration.
