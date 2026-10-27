import fs from "fs";
import path from "path";

const policyPath = path.resolve(process.env.R3_POLICY_PATH || "./traces/policy.json");
const arms = ["chat:economy", "chat:strong", "search:economy", "coding:strong"];

const load = () => {
  try {
    return JSON.parse(fs.readFileSync(policyPath, "utf8"));
  } catch {
    return Object.fromEntries(arms.map((arm) => [arm, { count: 0, reward: 0 }]));
  }
};

export const choosePolicyArm = (agent = "chat") => {
  const policy = load();
  const candidates = arms.filter((arm) => arm.startsWith(`${agent}:`));
  return (candidates.length ? candidates : ["chat:economy"]).sort(
    (a, b) => (policy[b].reward / Math.max(policy[b].count, 1)) - (policy[a].reward / Math.max(policy[a].count, 1)),
  )[0];
};

export const updatePolicy = (arm, reward) => {
  const policy = load();
  policy[arm] ||= { count: 0, reward: 0 };
  policy[arm].count += 1;
  policy[arm].reward += reward;
  fs.mkdirSync(path.dirname(policyPath), { recursive: true });
  fs.writeFileSync(policyPath, JSON.stringify(policy, null, 2));
  return policy[arm];
};
