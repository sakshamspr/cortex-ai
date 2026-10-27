# CortexBench / CortexRoute

The evaluation surface is intentionally local and reproducible. `R3_MAX_USD`
and the script-level `--max-usd` guard must be set before adding paid model
calls. No benchmark result is committed by default.

The production R3 loop emits one JSONL trace per turn in `traces/turns.jsonl`.
Those traces are the input for later replay and reporting. The current
baseline is the incumbent deterministic router; model pricing is configured
through `R3_PRICE_*` environment variables and defaults to zero until measured
prices are supplied.
