# Cortex R3 progress

## Phase checklist

- [x] Phase 0 — Audit and scaffolding
- [x] Phase 1 — Cost meter, trace metadata, and baseline instrumentation
- [x] Phase 2 — Verifier and gate
- [x] Phase 3 — CortexBench and CortexRoute dataset builder
- [x] Phase 4 — Learned router
- [x] Phase 5 — Two-tier memory
- [x] Phase 6 — Closing the loop
- [x] Phase 7 — Interface that exposes internals
- [x] Phase 8 — Release and paper readiness

## Phase 0

Completed:

- Audited the current services, LangGraph nodes/edges, model call locations, RAG flow, Redis memory, billing path, and frontend response handling.
- Added centralized feature flags and typed-by-contract R3 configuration defaults in `backend/services/agent/r3/config.js`.
- Added Zod validation for the `TurnTrace` contract and an append-only JSONL writer in `backend/services/agent/r3/trace.js`.
- Added the initial R3 module README.
- Added Phase 0 trace schema/writer unit tests (`npm run test:r3`).

Decisions/deviations:

- The repository is currently JavaScript, not TypeScript. Phase 0 uses immutable configuration objects and a Zod runtime schema without converting the existing services to TypeScript.
- The incumbent local runtime has authentication disabled and uses an anonymous gateway identity; R3 does not reintroduce authentication.
- All R3 flags default to off. No current request path is changed by the scaffolding.

Pending:

- Pricing defaults are zero until provider pricing is configured explicitly through environment variables; no cost savings are claimed.
- The evaluation smoke runner reports trace counts and cost only. A labelled benchmark is still required before publishing quality, routing, or savings numbers.

## Completed implementation slice

- Phase 1: controller-level execution measurement, token estimation, configurable pricing, append-only traces, and response trace metadata.
- Phase 2: feature-gated local verifier, claim-level overlap evidence, faithfulness score, gate decision, and abstention note.
- Phase 3: zero-cost trace smoke runner with `--max-usd` guard and documented six evaluation configurations.
- Phase 4: feature-gated persisted policy arms with shadow/live routing metadata and reward updates.
- Phase 5: Redis-backed episodic memory with verifier-gated writes and blocked-write accounting.
- Phase 6: shared faithfulness score drives gate, memory filter, and policy reward when verification is enabled.
- Phase 7: assistant messages expose a collapsible research trace panel with agent, tier, latency, cost, and confidence.
- Phase 8: evaluation notes and reproducibility documentation are present; no unsupported benchmark results are claimed.

## Scope and limitations

The current verifier is deliberately local and deterministic. It is useful for instrumentation and ablation plumbing, but it is not a substitute for a separately trained entailment model. Token counts are conservative character-based estimates because provider usage metadata is not uniform across the configured model clients. Run a labelled CortexBench dataset and configure provider pricing before treating the trace metrics as research results.
