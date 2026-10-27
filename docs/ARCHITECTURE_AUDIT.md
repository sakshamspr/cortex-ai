# CortexAI architecture audit

## Runtime services

| Service | Port | Responsibility |
|---|---:|---|
| Gateway | 8000 | CORS, security middleware, anonymous local identity, proxying |
| Chat | 8002 | Conversations and message persistence in MongoDB |
| Agent | 8003 | LangGraph routing, model calls, RAG, generated artifacts |
| Billing | 8004 | Razorpay order/payment flows and MongoDB payment records |
| Redis | 6379 / hosted Redis URL | Short-term conversation cache and rate limits |
| MongoDB | hosted/local URL | Chat, billing, and agent persistence |
| Qdrant | configured URL | Temporary PDF-RAG vector collections |

Authentication is intentionally disabled in the current local runtime. The gateway injects `anonymous-local-user` and forwards its identity to downstream services.

## Request path

1. The React/Vite frontend sends `/api/chat/*` and `/api/agent/*` requests to the gateway.
2. The gateway injects the anonymous user headers and proxies chat requests to port 8002 and agent requests to port 8003.
3. The agent controller stores the user message, invokes the compiled LangGraph, stores the assistant response and artifacts, and returns `answer`, `images`, and `artifacts`.
4. The frontend renders messages and opens generated code artifacts in the artifact panel.

## Current LangGraph nodes and edges

Nodes:

- `router`
- `chat`
- `coding`
- `search`
- `pdf`
- `ppt`
- `image`
- `vision`
- `pdf_rag`

Edges:

- `__start__ -> router`
- `router -> chat|coding|search|pdf|ppt|image|vision|pdf_rag`
- `search -> chat`
- `chat -> __end__`
- `coding -> __end__`
- `image -> __end__`
- `pdf -> __end__`
- `ppt -> __end__`
- `vision -> __end__`
- `pdf_rag -> __end__`

The router respects an explicitly selected agent, routes images to `vision`, routes PDFs to `pdf_rag`, and otherwise uses deterministic lexical routing for common requests. The current implementation no longer spends an LLM call solely to classify ordinary prompts.

## Model call inventory

| Location | Provider/model path | Purpose |
|---|---|---|
| `agents/chat.agent.js` | Groq through `getModel("chat")` | Conversation response |
| `agents/coding.agent.js` | OpenRouter through `getModel("coding")` | Code generation/review |
| `agents/search.agent.js` | Tavily search, then chat agent | Web retrieval and synthesis |
| `agents/pdf.agent.js` | Groq through `getModel("pdf")` | PDF content generation |
| `agents/ppt.agent.js` | Groq through `getModel("ppt")` | Slide outline/content generation |
| `agents/imageGen.agent.js` | Groq through `getModel("image")` | Image prompt enhancement |
| `agents/vision.agent.js` | Gemini through `getModel("vision")` | Image understanding |
| `agents/pdfRag.agent.js` | Groq through `getModel("pdf-rag")` | PDF-grounded answer |

Model instances are centralized in `services/agent/utils/model.js`. The current `getModel` fallback returns the Groq instance for chat/search/pdf/ppt/image and unknown agent keys; coding uses OpenRouter and vision uses Gemini.

## RAG flow

`pdfRag.agent.js` reads the uploaded PDF, extracts text with `pdf-parse`, splits it into 1,000-character chunks with 200-character overlap, creates a temporary Qdrant collection, retrieves five similar chunks, joins their text into a prompt, invokes the PDF-RAG model, and deletes the temporary file/collection in `finally`.

The current response returns plain text only. Retrieved chunk metadata and citation spans are not exposed yet; this is a planned Reflect phase extension.

## Redis memory and limits

`utils/memory.js` stores up to 20 conversation messages in a Redis key with a 24-hour expiry. On a cache miss, it loads history from the chat service. `config/agentRateLimit.js` uses Redis counters with 60-second expiries for per-agent request limits.

## Credits and payments

Credit deduction is currently a no-op because authentication was removed for local use. Billing still contains Razorpay order and payment verification code, but the local anonymous runtime does not call the removed Auth service. R3 cost accounting must remain separate from this legacy billing path.

## Frontend consumption

`ChatInput.jsx` creates conversations, posts multipart prompts to `/api/agent/chat`, and renders `answer`, `images`, and `artifacts`. `MessageList.jsx` loads persisted messages, while `MessageBubble.jsx` renders Markdown, images, files, and code. `ArtifactPanel.jsx` renders code artifacts and previews HTML/CSS/JS outputs.
