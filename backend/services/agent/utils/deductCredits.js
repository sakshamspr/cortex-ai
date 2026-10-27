import axios from "axios";

// Calls the Auth microservice internally to deduct credit points based on the triggered agent
export const deductCredits = async (
  userId,

  agent,
) => {
  // Authentication and account billing are disabled for local anonymous use.
  return { userId, agent };
};
