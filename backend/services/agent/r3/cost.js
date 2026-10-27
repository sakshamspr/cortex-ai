import { R3_CONFIG } from "./config.js";

export const estimateTokens = (value = "") =>
  Math.max(0, Math.ceil(String(value).length / 4));

export const calculateCost = (tokensIn, tokensOut, tier = "economy") => {
  const prices = R3_CONFIG.tiers[tier] || R3_CONFIG.tiers.economy;
  return (
    (tokensIn / 1_000_000) * prices.pricePerMillionInput +
    (tokensOut / 1_000_000) * prices.pricePerMillionOutput
  );
};

export const measureExecution = ({
  prompt,
  response,
  tier = "economy",
  model = R3_CONFIG.tiers[tier]?.model || "unknown",
  startedAt,
}) => {
  const tokensIn = estimateTokens(prompt);
  const tokensOut = estimateTokens(response);
  return {
    model,
    tokensIn,
    tokensOut,
    costUsd: calculateCost(tokensIn, tokensOut, tier),
    latencyMs: Math.max(0, Date.now() - startedAt),
  };
};
