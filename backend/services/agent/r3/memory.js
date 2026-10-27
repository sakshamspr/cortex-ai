import crypto from "crypto";
import redis from "../../../shared/redis/redis.js";
import { R3_CONFIG } from "./config.js";

const keyFor = (conversationId, tier) => `r3:${tier}:${conversationId}`;

export const retrieveMemory = async (conversationId) => {
  if (R3_CONFIG.flags.memory !== "on" || !conversationId) return [];
  const values = await redis.lrange(keyFor(conversationId, "episodic"), 0, 4);
  return values.map((value) => JSON.parse(value));
};

export const rememberTurn = async ({ conversationId, prompt, response, faithfulness }) => {
  if (R3_CONFIG.flags.memory !== "on" || !conversationId) {
    return { retrievedIds: [], written: [], blockedByFilter: 0 };
  }
  if (faithfulness < R3_CONFIG.thresholds.memory) {
    return { retrievedIds: [], written: [], blockedByFilter: 1 };
  }
  const id = crypto.randomUUID();
  const record = { id, prompt, response, faithfulness, createdAt: new Date().toISOString() };
  await redis.lpush(keyFor(conversationId, "episodic"), JSON.stringify(record));
  await redis.ltrim(keyFor(conversationId, "episodic"), 0, 19);
  await redis.expire(keyFor(conversationId, "episodic"), 86400);
  return { retrievedIds: [], written: [{ id, tier: "episodic" }], blockedByFilter: 0 };
};
