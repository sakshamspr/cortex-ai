# CortexAI Handover Pack

This directory contains the complete technical handover for the current
CortexAI implementation. Read the documents in this order:

1. `HANDOVER_SYSTEM.md` — product scope, architecture, services, request flow,
   agents, data stores, and important design decisions.
2. `HANDOVER_RUNTIME.md` — local setup, environment variables, startup,
   health checks, troubleshooting, and operational procedures.
3. `HANDOVER_R3.md` — Route, Reflect, Remember implementation, flags, traces,
   policy updates, memory behavior, and limitations.
4. `HANDOVER_FRONTEND.md` — Research Studio UI, state flow, guided actions,
   artifact rendering, and presentation-readiness notes.
5. `HANDOVER_EVALUATION.md` — tests run, benchmark status, smoke harness,
   evaluation plan, and what must not be claimed.
6. `HANDOVER_SECURITY.md` — credential handling, authentication decision,
   deployment risks, and a release checklist.
7. `SCREENSHOTS.md` — current screenshot inventory and capture provenance.

## Current status

The application implementation and tracked project todos are complete. The
frontend production build and R3 tests pass. The project is ready for a
technical demonstration and for collection of real traces.

It is **not yet a completed quantitative research study**. The repository does
not contain a labelled CortexBench/CortexRoute dataset, real benchmark traces,
or statistically valid quality/cost comparisons. Any paper or presentation
must label those measurements as `TBD (run eval)` until the evaluation is
actually executed.

## Fast verification

```bash
npm --prefix backend/services/agent run test:r3
npm --prefix backend/services/agent run eval:r3
npm --prefix frontend run build
git diff --check
```

## Sensitive-data rule

Never copy local `.env` values into this handover pack, screenshots, commits,
issues, or presentations. Credentials supplied during development must be
rotated before any deployment or public demonstration.
