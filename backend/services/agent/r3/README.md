# R3 scaffolding

This directory contains the feature-flagged Route, Reflect, Remember runtime,
configuration, trace schema, verifier, policy, and memory helpers.

Phase 0 keeps all flags off, so the incumbent graph and model behavior are unchanged. Later phases add instrumentation, verification, learned routing, and memory behind the existing flags:

- `R3_ROUTER=off|shadow|live`
- `R3_VERIFIER=off|on`
- `R3_MEMORY=off|on`

`writeTurnTrace` validates append-only JSONL records with Zod before writing them.
The controller writes traces to `traces/turns.jsonl`. When verification is
enabled, one faithfulness score is reused by the gate, policy reward, and
memory write filter. Token counts and verification are deterministic
instrumentation baselines, not published benchmark results.
