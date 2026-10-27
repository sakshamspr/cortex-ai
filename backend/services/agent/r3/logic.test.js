import test from "node:test";
import assert from "node:assert/strict";
import { calculateCost, estimateTokens } from "./cost.js";
import { faithfulnessFromClaims, gateDecision, verifyResponse } from "./verify.js";

test("cost arithmetic uses token counts and configured tier prices", () => {
  assert.equal(estimateTokens("1234"), 1);
  assert.equal(calculateCost(1_000_000, 2_000_000, "economy"), 0);
});

test("faithfulness and gate decisions are deterministic", () => {
  assert.equal(faithfulnessFromClaims([{ verdict: "supported" }, { verdict: "unsupported" }]), 0.5);
  assert.equal(gateDecision(0.9), "accept");
  assert.equal(gateDecision(0.5), "escalate");
  assert.equal(gateDecision(0.1, 1), "abstain");
});

test("verifier marks evidence-overlapping claims as supported", () => {
  const result = verifyResponse({
    prompt: "What is a telescope?",
    response: "A telescope observes distant objects.",
    evidence: "A telescope is an instrument used to observe distant objects.",
    evidenceType: "rag",
  });
  assert.equal(result.claims[0].verdict, "supported");
  assert.equal(result.faithfulness, 1);
});
