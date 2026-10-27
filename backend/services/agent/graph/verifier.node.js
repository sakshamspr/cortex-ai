import { R3_CONFIG } from "../r3/config.js";
import { gateDecision, verifyResponse } from "../r3/verify.js";
import { rememberTurn, retrieveMemory } from "../r3/memory.js";

export const verifierNode = async (state) => {
  if (R3_CONFIG.flags.verifier !== "on") return state;
  const evidence =
    state.searchResults?.results
      ?.map((item) => `${item.title || ""} ${item.content || ""}`)
      .join("\n") ||
    state.pdfContext ||
    state.docs?.map((doc) => doc.pageContent).join("\n") ||
    "";
  const evidenceType = state.searchResults ? "web" : state.pdfContext || state.docs ? "rag" : "none";
  const verification = verifyResponse({
    prompt: state.prompt,
    response: state.response,
    evidence,
    evidenceType,
  });
  const decision = gateDecision(verification.faithfulness);
  const retrieved = await retrieveMemory(state.conversationId);
  const memory = await rememberTurn({
    conversationId: state.conversationId,
    prompt: state.prompt,
    response: state.response,
    faithfulness: verification.faithfulness,
  });
  return {
    ...state,
    verification,
    gate: { decision, escalations: 0 },
    memory: { retrievedIds: retrieved.map((item) => item.id), ...memory },
    response:
      decision === "abstain"
        ? `${state.response}\n\n> Verification note: the available evidence was not sufficient to confidently support this answer.`
        : state.response,
  };
};
