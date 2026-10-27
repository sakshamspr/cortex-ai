# CortexAI R3 paper outline

1. **Problem:** open-loop agent systems spend a full model call on routing and
   have no consistent groundedness or memory-write control.
2. **Method:** Route selects an agent/tier, Reflect computes a faithfulness
   score and gate decision, and Remember writes only verified turns.
3. **Evaluation:** compare incumbent and R3 configurations on a labelled,
   licensed dataset with fixed seeds, cost guards, latency, faithfulness, and
   abstention reporting.
4. **Limitations:** the current implementation's verifier and token meter are
   deterministic approximations; measured claims are **TBD (run eval)**.
5. **Reproducibility:** use `npm --prefix backend/services/agent run test:r3`
   and `npm --prefix backend/services/agent run eval:r3 -- --max-usd 0`.
