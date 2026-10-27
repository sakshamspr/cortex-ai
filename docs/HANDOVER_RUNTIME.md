# CortexAI Runtime and Operations Handover

## 1. Prerequisites

- Node.js 18 or newer.
- npm.
- MongoDB connection.
- Redis connection.
- Qdrant URL and API key for PDF-RAG.
- Model/provider credentials required by the agents.
- S3-compatible storage values for generated artifacts.
- Razorpay values only if billing flows are demonstrated.

Do not use the credentials previously pasted into chat as permanent secrets.
Rotate them before sharing the project or deploying it.

## 2. Environment files

Use two ignored files:

- repository root: `.env`
- frontend: `frontend/.env`

Use `.env.example` and `frontend/.env.example` as templates. Never commit
actual values.

### Backend variables

Core runtime:

```env
PORT=8000
FRONTEND_URL=http://localhost:5173
CHAT_SERVICE=http://localhost:8002
AGENT_SERVICE=http://localhost:8003
BILLING_SERVICE=http://localhost:8004
REDIS_URL=...
MONGODB_URL=...
```

Provider values:

```env
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
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### Frontend variables

```env
VITE_SERVER_URL=http://localhost:8000
VITE_RAZORPAY_KEY=...
```

## 3. Installation

```bash
cd backend
npm run build

cd ../frontend
npm install
```

The backend installer installs dependencies for the gateway and services.

## 4. Startup

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

The backend launcher loads the repository-root `.env` and starts gateway,
chat, agent, and billing services. It intentionally does not start the Auth
service.

## 5. Health and smoke checks

Check the gateway:

```bash
curl -i http://localhost:8000/
```

Check the frontend:

```bash
curl -I http://localhost:5173/
```

Run code-level validation:

```bash
npm --prefix backend/services/agent run test:r3
npm --prefix backend/services/agent run eval:r3
npm --prefix frontend run build
git diff --check
```

## 6. R3 environment flags

```env
R3_ROUTER=off
R3_VERIFIER=off
R3_MEMORY=off
```

Safe demonstration sequence:

1. Start with all flags off.
2. Set `R3_ROUTER=shadow` to observe policy choices without changing routing.
3. Set `R3_VERIFIER=on` to expose verification and gate metadata.
4. Set `R3_MEMORY=on` only after Redis connectivity is confirmed.
5. Set `R3_ROUTER=live` only after inspecting traces and policy behavior.

Optional R3 configuration:

```env
R3_TRACE_PATH=./traces/turns.jsonl
R3_POLICY_PATH=./traces/policy.json
R3_MODEL_ECONOMY=...
R3_MODEL_STRONG=...
R3_PRICE_ECONOMY_INPUT=0
R3_PRICE_ECONOMY_OUTPUT=0
R3_PRICE_STRONG_INPUT=0
R3_PRICE_STRONG_OUTPUT=0
R3_TAU_ACCEPT=0.8
R3_TAU_ABSTAIN=0.45
R3_TAU_MEMORY=0.8
R3_MAX_TURN_USD=0.05
R3_MAX_ESCALATIONS=1
```

## 7. Common failures

### “Something went wrong” during chat

Check:

1. Gateway is running on port 8000.
2. Agent service is running on port 8003.
3. `GROQ_API_KEY` is valid and the configured model is available.
4. Redis is reachable.
5. MongoDB is reachable.
6. Browser network logs for the failing request.
7. Agent-service logs for provider or rate-limit errors.

The gateway avoids forwarding undefined identity headers. If a custom proxy
change reintroduces undefined headers, requests may fail before reaching the
agent service.

### PDF-RAG failure

Check:

- uploaded file is a valid PDF;
- Qdrant URL and API key are complete;
- the temporary collection can be created and deleted;
- the local temporary directory is writable;
- the selected model provider is available.

### Frontend is blank

Check:

- `VITE_SERVER_URL` points to the gateway;
- the Vite server is running;
- browser console errors;
- frontend build output;
- CORS and gateway logs.

### Generated files do not open

Check AWS/S3 configuration, bucket permissions, region, and generated artifact
URLs. Billing is not required for local anonymous chat, but storage is required
for some artifact workflows.

## 8. Operational cleanup

Runtime-generated files include:

- `traces/turns.jsonl`
- `traces/policy.json`
- service temporary upload files

Do not commit trace files containing user prompts or responses. Remove only
known generated files after confirming they are not needed for evaluation.
