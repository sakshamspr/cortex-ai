import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { turnTraceSchema, writeTurnTrace } from "./trace.js";

const sampleTrace = {
  turnId: "turn-1",
  sessionId: "session-1",
  ts: new Date().toISOString(),
  query: "Explain the result.",
  features: {
    length: 20,
    hasCode: false,
    hasUrl: false,
    hasAttachment: false,
    docLoaded: false,
  },
  routing: {
    mode: "off",
    chosen: { agent: "chat", tier: "economy" },
    policyVersion: "incumbent",
    explore: false,
  },
  execution: {
    model: "test-model",
    tokensIn: 4,
    tokensOut: 8,
    costUsd: 0,
    latencyMs: 12,
  },
};

test("validates and writes one append-only trace line", () => {
  const filePath = path.join(os.tmpdir(), `cortex-r3-${Date.now()}.jsonl`);

  try {
    const written = writeTurnTrace(sampleTrace, filePath);
    assert.deepEqual(written, turnTraceSchema.parse(sampleTrace));
    assert.equal(fs.readFileSync(filePath, "utf8").trim(), JSON.stringify(written));
  } finally {
    fs.rmSync(filePath, { force: true });
  }
});

test("rejects invalid routing modes", () => {
  assert.throws(() =>
    turnTraceSchema.parse({
      ...sampleTrace,
      routing: { ...sampleTrace.routing, mode: "invalid" },
    }),
  );
});
