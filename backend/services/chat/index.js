import express from "express";
import dotenv from "dotenv";
import router from "./routes/chat.routes.js";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT;

app.use("/", router);

app.get("/health", (req, res) => {
  res.json({ service: "chat", status: "ok" });
});

app.use((err, req, res, next) => {
  console.error("[chat]", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Chat service request failed.",
  });
});

app.listen(port, () => {
  connectDB();
  console.log(`chat service running on ${port}`);
});
