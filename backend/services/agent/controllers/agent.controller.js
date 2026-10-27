import redis from "../../../shared/redis/redis.js";
import { graph } from "../graph/supervisor.graph.js";
import { addMessage } from "../utils/memory.js";
import axios from "axios";
import crypto from "crypto";
import { R3_CONFIG } from "../r3/config.js";
import { measureExecution } from "../r3/cost.js";
import { updatePolicy } from "../r3/policy.js";
import { writeTurnTrace } from "../r3/trace.js";

// Process incoming user prompt and invoke the agent graph
export const chat = async (req, res, next) => {
  try {
    const startedAt = Date.now();
    const {
      prompt,

      conversationId,

      agent,
    } = req.body;

    console.log(req.body);
    console.log(req.file);

    // Save the user's message in local cache memory
    await addMessage(conversationId, "user", prompt);

    // Save the user's message in the database via the chat service
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    // Run the multi-agent graph with the user's prompt and file inputs
    const result = await graph.invoke({
      prompt,

      conversationId,

      userId: req.headers["x-user-id"],
      agent,
      file: req.file,
    });

    const tier = result.routing?.chosen?.tier || "economy";
    const execution = measureExecution({
      prompt,
      response: result.response,
      tier,
      model: R3_CONFIG.tiers[tier]?.model || "unknown",
      startedAt,
    });
    const reward = result.verification
      ? result.verification.faithfulness -
        execution.costUsd / Math.max(R3_CONFIG.reward.referenceCostUsd, 0.000001) * R3_CONFIG.reward.costWeight -
        execution.latencyMs / R3_CONFIG.reward.referenceLatencyMs * R3_CONFIG.reward.latencyWeight
      : undefined;
    if (reward !== undefined && result.routing?.chosen) {
      updatePolicy(`${result.routing.chosen.agent}:${tier}`, reward);
    }
    const trace = writeTurnTrace({
      turnId: crypto.randomUUID(),
      sessionId: String(conversationId),
      ts: new Date().toISOString(),
      query: prompt || "",
      features: {
        length: String(prompt || "").length,
        hasCode: /```|function |class |const /.test(prompt || ""),
        hasUrl: /https?:\/\//.test(prompt || ""),
        hasAttachment: Boolean(req.file),
        docLoaded: Boolean(req.file?.mimetype === "application/pdf"),
      },
      routing: result.routing || {
        mode: "off",
        chosen: { agent: result.agent || "chat", tier },
        policyVersion: "incumbent",
        explore: false,
      },
      execution,
      ...(result.verification ? { verification: result.verification } : {}),
      ...(result.gate ? { gate: result.gate } : {}),
      ...(result.memory ? { memory: result.memory } : {}),
      ...(reward !== undefined ? { reward } : {}),
    });

    console.log("after res", result);

    // Save the assistant's response in local cache memory
    await addMessage(conversationId, "assistant", result.response);
    
    // Save the assistant's response and generated assets in the database
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: result.response,
      images: result.images,
      artifacts: result.artifacts || [],
      trace,
    });

    return res.json({
      success: true,

      answer: result.response,
      images: result.images,
      artifacts: result.artifacts || [],
      trace,
    });
  } catch (error) {
    // Forward the error to the global error middleware
    next(error);
  }
};
