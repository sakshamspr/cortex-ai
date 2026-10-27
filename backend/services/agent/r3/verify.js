import { R3_CONFIG } from "./config.js";

const words = (value = "") =>
  new Set(
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3),
  );

export const faithfulnessFromClaims = (claims) => {
  if (!claims.length) return 0;
  return claims.filter((claim) => claim.verdict === "supported").length / claims.length;
};

export const verifyResponse = ({ prompt, response, evidence = "", evidenceType = "none" }) => {
  const responseSentences = String(response || "")
    .split(/[.!?]\s+/)
    .map((text) => text.trim())
    .filter(Boolean)
    .slice(0, 12);
  const evidenceWords = words(evidence);
  const claims = responseSentences.map((text, index) => {
    const claimWords = words(text);
    const overlap = [...claimWords].filter((word) => evidenceWords.has(word)).length;
    const ratio = claimWords.size ? overlap / claimWords.size : 0;
    return {
      text,
      verdict:
        evidenceType === "none"
          ? "supported"
          : ratio >= 0.18
            ? "supported"
            : "unsupported",
      evidenceIds: evidenceType === "none" ? [] : [`evidence-${index + 1}`],
    };
  });
  const faithfulness =
    evidenceType === "none"
      ? responseSentences.length
        ? Math.min(1, 0.65 + Math.min(String(prompt || "").length, 160) / 1600)
        : 0
      : faithfulnessFromClaims(claims);
  return {
    evidenceType,
    claims,
    faithfulness,
    verifierModel: "local-overlap-v1",
    costUsd: 0,
  };
};

export const gateDecision = (faithfulness, escalations = 0) => {
  if (faithfulness >= R3_CONFIG.thresholds.accept) return "accept";
  if (faithfulness >= R3_CONFIG.thresholds.abstain && escalations < R3_CONFIG.budgets.maxEscalations) {
    return "escalate";
  }
  return "abstain";
};
