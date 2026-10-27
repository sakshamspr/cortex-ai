import fs from "fs";
import path from "path";

const maxUsdArg = process.argv.indexOf("--max-usd");
const maxUsd = maxUsdArg >= 0 ? Number(process.argv[maxUsdArg + 1]) : 0;
if (!Number.isFinite(maxUsd) || maxUsd < 0) {
  throw new Error("--max-usd must be a non-negative number");
}

const tracePath = path.resolve(process.env.R3_TRACE_PATH || "./traces/turns.jsonl");
const lines = fs.existsSync(tracePath)
  ? fs.readFileSync(tracePath, "utf8").split("\n").filter(Boolean)
  : [];
const traces = lines.map((line) => JSON.parse(line));
const cost = traces.reduce((sum, trace) => sum + (trace.execution?.costUsd || 0), 0);
if (cost > maxUsd) {
  throw new Error(`Evaluation cost guard reached: ${cost} > ${maxUsd}`);
}
const report = {
  traces: traces.length,
  costUsd: cost,
  configurations: ["always_strongest", "llm_router", "router_only", "verifier_only", "memory_only", "full_r3"],
  status: "trace smoke report; run eval on a labelled dataset for metrics",
};
console.log(JSON.stringify(report, null, 2));
