# CortexAI Evaluation and Benchmark Handover

## 1. What has actually been run

The following checks passed in the current repository:

| Check | Result |
|---|---|
| R3 unit suite | 5 passed, 0 failed |
| Frontend production build | Passed |
| LangGraph supervisor import/compile | Passed |
| Modified backend syntax checks | Passed |
| Evaluation smoke harness | Passed |
| Git whitespace validation | Passed |

The smoke harness reported:

```text
traces: 0
costUsd: 0
```

This means no runtime trace records were present when the smoke harness ran.
It does **not** mean the model achieved zero cost or perfect quality.

## 2. Available commands

```bash
npm --prefix backend/services/agent run test:r3
npm --prefix backend/services/agent run eval:r3
npm --prefix frontend run build
```

The smoke harness reads `traces/turns.jsonl` or `R3_TRACE_PATH`, sums recorded
execution costs, and enforces a `--max-usd` guard.

## 3. Metrics not currently available

Do not claim any of the following as measured results:

- routing accuracy;
- macro-F1;
- cost reduction percentage;
- quality loss percentage;
- p95 latency;
- RAGAS faithfulness;
- answer relevance;
- context relevance;
- abstention quality;
- memory recall;
- confidence intervals;
- six-configuration ablation results.

All are `TBD (run eval)` until a labelled dataset and real traces exist.

## 4. Proposed benchmark configurations

The evaluation plan includes:

1. `always_strongest`
2. `llm_router`
3. `router_only`
4. `verifier_only`
5. `memory_only`
6. `full_r3`

Each configuration should use the same fixed query split and record:

- chosen arm;
- model;
- input/output tokens;
- cost;
- latency;
- answer;
- evidence;
- faithfulness;
- gate decision;
- abstention;
- memory writes.

## 5. Dataset requirements

A real CortexRoute/CortexBench dataset must document:

- source datasets and licences;
- generated-query prompt and model;
- difficulty controls;
- agent-category distribution;
- document sources and licences;
- train/dev/test split seeds;
- candidate-arm execution procedure;
- judge model and prompt;
- label rule;
- exclusion and quality-control rules.

No released dataset is currently included in this repository.

## 6. Correct benchmark procedure

1. Rotate all development credentials.
2. Configure actual provider prices.
3. Create a small labelled smoke dataset.
4. Run all configurations with a strict `--max-usd` limit.
5. Cache model calls by model, prompt, and parameters.
6. Record traces and raw outputs.
7. Compare generated answers against hand labels and independent judging.
8. Run at least three fixed seeds for the final report.
9. Bootstrap confidence intervals.
10. Generate `docs/RESULTS.md` from the script; never hand-type results.

## 7. Research integrity rules

- Never convert a passing unit test into a model-quality claim.
- Never convert zero recorded trace cost into a cost-saving claim.
- Never use the same model for generation, verification, and judging without
  documenting the bias.
- Clearly separate evidence-grounded agents from evidence-free agents.
- Report negative or inconclusive results.
