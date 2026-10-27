# CortexAI R3 Technical Handover

## 1. Research thesis

R3 turns an open-loop multi-agent system into a closed-loop system:

```text
Route → Execute → Reflect → Gate → Remember → Reward Route
```

The central claim is that one verification score should be used consistently:

1. to gate the answer;
2. to reward or penalize routing choices;
3. to decide whether memory may be written.

This invariant is implemented in the current runtime path when verification is
enabled, but the verifier itself is still a deterministic baseline.

## 2. Configuration

`backend/services/agent/r3/config.js` centralizes:

- feature flags;
- economy and strong model tiers;
- input/output prices;
- accept, abstain, and memory thresholds;
- quality, cost, and latency reward weights;
- turn cost and escalation budgets.

Prices default to zero. This is intentional: no cost-saving claim is valid
until real provider prices are configured.

## 3. TurnTrace

The Zod-validated schema records:

```text
turnId
sessionId
timestamp
query
features
routing
execution
verification
gate
memory
reward
```

Important fields:

- `features`: query length, code/url/attachment/document indicators;
- `routing`: mode, chosen arm, optional shadow arm, policy version;
- `execution`: model, estimated tokens, cost, latency;
- `verification`: evidence type, claim verdicts, faithfulness, verifier cost;
- `gate`: accept, escalate, or abstain;
- `memory`: retrieved IDs, written records, blocked writes;
- `reward`: quality minus normalized cost and latency penalties.

Each validated record is appended to the configured JSONL path.

## 4. Cost meter

The current meter uses a conservative character-based estimate:

```text
estimated tokens ≈ character count / 4
```

It then applies configured input/output prices per million tokens. This is an
instrumentation baseline, not provider-grade accounting. Provider usage
metadata should replace it before publishing cost results.

## 5. Routing

### Incumbent routing

The deterministic classifier recognizes common terms for:

- current/latest/news/search;
- coding/debugging/API/framework requests;
- PPT/presentation/slide requests;
- PDF generation requests;
- image-generation requests.

Uploaded images and PDFs have hard routing precedence to vision and PDF-RAG.
Explicit agent selections take precedence over auto routing.

### R3 policy

The policy currently stores lightweight arm statistics in a JSON file. Arms
include combinations such as:

```text
chat:economy
chat:strong
search:economy
coding:strong
```

`shadow` mode records a policy choice but keeps the incumbent route.
`live` mode uses a policy choice only when the policy arm is compatible with
the incumbent agent. Unsupported choices fall back safely.

This is an initial policy baseline, not a fully trained LinUCB or Thompson
Sampling implementation. It must not be described as a completed learned
router in a research paper.

## 6. Verification

When `R3_VERIFIER=on`, the verifier:

1. extracts short response sentences as candidate claims;
2. compares claim vocabulary with web or PDF evidence;
3. marks claims supported or unsupported;
4. computes supported claims divided by total claims;
5. chooses a gate decision from configured thresholds;
6. records the result in the trace.

For evidence-free conversation/coding responses, a weaker local confidence
proxy is used and `evidenceType` is `none`.

The verifier currently does not perform true entailment, contradiction
classification, citation span extraction, or independent-model judging.

## 7. Gate behavior

Configured thresholds:

- faithfulness >= accept threshold: `accept`;
- intermediate score with escalation budget: `escalate`;
- low score or exhausted budget: `abstain`.

The current implementation records the decision and appends a verification
note for abstention. A future implementation should perform corrective
retrieval or stronger-tier escalation rather than only recording the state.

## 8. Memory

When `R3_MEMORY=on`:

- recent episodic records can be retrieved for chat context;
- a record is written only if faithfulness meets the memory threshold;
- blocked writes increment `blockedByFilter`;
- episodic memory is bounded and expires through Redis.

The full semantic tier, consolidation job, contradiction resolution, and
similarity/importance/recency ranking remain future work.

## 9. Frontend trace panel

Assistant messages can display a collapsible “Research trace” panel with:

- chosen agent;
- chosen tier;
- latency;
- estimated cost;
- verified confidence.

The panel hides gracefully when flags are off or trace data is absent.

## 10. R3 testing

Run:

```bash
npm --prefix backend/services/agent run test:r3
```

The current suite covers:

- cost arithmetic;
- deterministic faithfulness and gate decisions;
- evidence-overlap verification;
- trace schema writing;
- invalid routing-mode rejection.

## 11. Known R3 limitations

- no labelled training or test dataset;
- no real provider token accounting;
- no independent verifier model;
- no complete escalation execution;
- no semantic memory consolidation;
- no statistically valid ablation table;
- no measured savings or quality improvement claim.
