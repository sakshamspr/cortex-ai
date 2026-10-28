import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import redis from "../shared/redis/redis.js";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import { proxyWithUser } from "./utils/proxyWithHeaders.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
// Configure CORS to allow the frontend to access the gateway with credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/uploads", express.static("uploads"));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// Authentication is disabled for local use; provide one stable anonymous identity.
app.use((req, res, next) => {
  req.user = {
    userId: "anonymous-local-user",
    email: "local@cortex-ai.test",
    name: "Local User",
    plan: "free",
    credits: 100,
    totalCredits: 100,
  };
  next();
});

app.use("/api/me", getCurrentUser);
app.use("/api/chat", proxyWithUser(process.env.CHAT_SERVICE));
app.use("/api/agent", proxyWithUser(process.env.AGENT_SERVICE));
app.use("/api/billing", proxyWithUser(process.env.BILLING_SERVICE));

app.use((err, req, res, next) => {
  console.error("[gateway]", err);
  if (res.headersSent) return next(err);
  return res.status(err.status || 502).json({
    success: false,
    title: "Service unavailable",
    message:
      err.data?.message ||
      err.response?.body?.message ||
      err.message ||
      "The requested service could not complete this request.",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    service: "gateway",
    status: "ok",
  });
});

app.get("/health", (req, res) => {
  res.json({ service: "gateway", status: "ok" });
});

app.listen(port, () => {
  console.log(`Gateway running on ${port}`);
});
