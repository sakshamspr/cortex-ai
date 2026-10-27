import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const routerMode = process.env.R3_ROUTER;

/**
 * Central R3 configuration. Defaults preserve the incumbent runtime.
 */
export const R3_CONFIG = Object.freeze({
  flags: Object.freeze({
    router:
      routerMode === "shadow" || routerMode === "live" ? routerMode : "off",
    verifier: process.env.R3_VERIFIER === "on" ? "on" : "off",
    memory: process.env.R3_MEMORY === "on" ? "on" : "off",
  }),
  tiers: Object.freeze({
    economy: Object.freeze({
      model: process.env.R3_MODEL_ECONOMY || "openai/gpt-oss-20b",
      pricePerMillionInput: parseNumber(
        process.env.R3_PRICE_ECONOMY_INPUT,
        0,
      ),
      pricePerMillionOutput: parseNumber(
        process.env.R3_PRICE_ECONOMY_OUTPUT,
        0,
      ),
    }),
    strong: Object.freeze({
      model: process.env.R3_MODEL_STRONG || "deepseek/deepseek-chat",
      pricePerMillionInput: parseNumber(process.env.R3_PRICE_STRONG_INPUT, 0),
      pricePerMillionOutput: parseNumber(process.env.R3_PRICE_STRONG_OUTPUT, 0),
    }),
  }),
  thresholds: Object.freeze({
    accept: parseNumber(process.env.R3_TAU_ACCEPT, 0.8),
    abstain: parseNumber(process.env.R3_TAU_ABSTAIN, 0.45),
    memory: parseNumber(process.env.R3_TAU_MEMORY, 0.8),
  }),
  reward: Object.freeze({
    qualityWeight: parseNumber(process.env.R3_REWARD_QUALITY_WEIGHT, 1),
    costWeight: parseNumber(process.env.R3_REWARD_COST_WEIGHT, 0.25),
    latencyWeight: parseNumber(process.env.R3_REWARD_LATENCY_WEIGHT, 0.1),
    referenceCostUsd: parseNumber(process.env.R3_REFERENCE_COST_USD, 0.01),
    referenceLatencyMs: parseNumber(process.env.R3_REFERENCE_LATENCY_MS, 5000),
  }),
  budgets: Object.freeze({
    maxTurnUsd: parseNumber(process.env.R3_MAX_TURN_USD, 0.05),
    maxEscalations: parseNumber(process.env.R3_MAX_ESCALATIONS, 1),
  }),
});
