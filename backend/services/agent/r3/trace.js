import fs from "fs";
import path from "path";
import { z } from "zod";

const claimSchema = z.object({
  text: z.string(),
  verdict: z.enum(["supported", "unsupported", "contradicted"]),
  evidenceIds: z.array(z.string()),
});

export const turnTraceSchema = z.object({
  turnId: z.string(),
  sessionId: z.string(),
  ts: z.string(),
  query: z.string(),
  features: z.object({
    length: z.number().int().nonnegative(),
    hasCode: z.boolean(),
    hasUrl: z.boolean(),
    hasAttachment: z.boolean(),
    docLoaded: z.boolean(),
    embeddingRef: z.string().optional(),
  }),
  routing: z.object({
    mode: z.enum(["off", "shadow", "live"]),
    chosen: z.object({ agent: z.string(), tier: z.string() }),
    shadowChosen: z
      .object({ agent: z.string(), tier: z.string() })
      .optional(),
    policyVersion: z.string(),
    explore: z.boolean(),
    armScores: z.record(z.string(), z.number()).optional(),
  }),
  execution: z.object({
    model: z.string(),
    tokensIn: z.number().int().nonnegative(),
    tokensOut: z.number().int().nonnegative(),
    costUsd: z.number().nonnegative(),
    latencyMs: z.number().nonnegative(),
  }),
  verification: z
    .object({
      evidenceType: z.enum(["rag", "web", "none"]),
      claims: z.array(claimSchema),
      faithfulness: z.number().min(0).max(1),
      verifierModel: z.string(),
      costUsd: z.number().nonnegative(),
    })
    .optional(),
  gate: z
    .object({
      decision: z.enum(["accept", "escalate", "abstain"]),
      escalations: z.number().int().nonnegative(),
    })
    .optional(),
  memory: z
    .object({
      retrievedIds: z.array(z.string()),
      written: z.array(
        z.object({
          id: z.string(),
          tier: z.enum(["episodic", "semantic"]),
        }),
      ),
      blockedByFilter: z.number().int().nonnegative(),
    })
    .optional(),
  reward: z.number().optional(),
});

const defaultTracePath = path.resolve(
  process.env.R3_TRACE_PATH || "./traces/turns.jsonl",
);

export const writeTurnTrace = (trace, filePath = defaultTracePath) => {
  const validated = turnTraceSchema.parse(trace);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(validated)}\n`, "utf8");
  return validated;
};
