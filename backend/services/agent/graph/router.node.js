const ROUTABLE_AGENTS = new Set([
  "chat",
  "search",
  "coding",
  "pdf",
  "ppt",
  "image",
]);
import { R3_CONFIG } from "../r3/config.js";
import { choosePolicyArm } from "../r3/policy.js";

const containsAny = (prompt, terms) =>
  terms.some((term) => prompt.includes(term));

// Route common requests without spending a model call on classification.
export const classifyPrompt = (prompt = "") => {
  const normalized = prompt.toLowerCase().trim();

  if (!normalized) return "chat";

  if (
    containsAny(normalized, [
      "current",
      "latest",
      "today",
      "recent",
      "news",
      "live",
      "what is happening",
      "search the web",
      "look up",
    ])
  ) {
    return "search";
  }

  if (
    containsAny(normalized, [
      "write code",
      "code",
      "debug",
      "bug",
      "function",
      "api",
      "react",
      "javascript",
      "python",
      "typescript",
      "html",
      "css",
      "build an app",
      "build a website",
      "refactor",
    ])
  ) {
    return "coding";
  }

  if (
    containsAny(normalized, [
      "powerpoint",
      "presentation",
      "slides",
      "slide deck",
      "ppt",
    ])
  ) {
    return "ppt";
  }

  if (
    containsAny(normalized, [
      "generate a pdf",
      "create a pdf",
      "make a pdf",
      "pdf document",
    ])
  ) {
    return "pdf";
  }

  if (
    containsAny(normalized, [
      "generate an image",
      "create an image",
      "make an image",
      "draw",
      "illustration",
      "artwork",
    ])
  ) {
    return "image";
  }

  return "chat";
};

// Determines the best specialized agent to handle the user's request
export const routerNode = async (state) => {
  const requestedAgent = state.agent && state.agent !== "auto" ? state.agent : null;
  // If the user manually selected an agent, respect that choice
  if (requestedAgent) {
    return {
      ...state,

      agent: requestedAgent,
      routing: {
        mode: R3_CONFIG.flags.router,
        chosen: { agent: requestedAgent, tier: "strong" },
        policyVersion: "r3-policy-v1",
        explore: false,
      },
    };
  }

  // If a file is uploaded, route it based on the file type
  if (state.file) {
    if (state.file.mimetype.startsWith("image/")) {
      return {
        ...state,

        agent: "vision",
        routing: { mode: R3_CONFIG.flags.router, chosen: { agent: "vision", tier: "strong" }, policyVersion: "r3-policy-v1", explore: false },
      };
    }
  }

  if (state.file) {
    if (state.file.mimetype === "application/pdf") {
      return {
        ...state,

        agent: "pdf_rag",
        routing: { mode: R3_CONFIG.flags.router, chosen: { agent: "pdf_rag", tier: "strong" }, policyVersion: "r3-policy-v1", explore: false },
      };
    }
  }

  const agent = classifyPrompt(state.prompt);
  const incumbent = ROUTABLE_AGENTS.has(agent) ? agent : "chat";
  const policyArm = choosePolicyArm(incumbent);
  const [policyAgent, policyTier] = policyArm.split(":");
  const canUsePolicy = ["chat", "search", "coding"].includes(incumbent) && policyAgent === incumbent;
  const chosenAgent = R3_CONFIG.flags.router === "live" && canUsePolicy ? policyAgent : incumbent;
  const chosenTier = R3_CONFIG.flags.router === "live" && canUsePolicy ? policyTier : "economy";

  return {
    ...state,
    agent: chosenAgent,
    routing: {
      mode: R3_CONFIG.flags.router,
      chosen: { agent: chosenAgent, tier: chosenTier },
      ...(R3_CONFIG.flags.router === "shadow"
        ? { shadowChosen: { agent: policyAgent, tier: policyTier } }
        : {}),
      policyVersion: "r3-policy-v1",
      explore: false,
    },
  };
};
