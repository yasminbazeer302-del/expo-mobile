import express from "express";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express"; // ✅ FIX

import { functions, inngest } from "./config/inngest.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(clerkMiddleware()); // req.auth available

// ✅ Inngest route
app.use("/api/inngest", serve({ client: inngest, functions }));

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

// ✅ Production frontend serving
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../admin/dist/index.html"));
  });
}

// ✅ Start server after DB connect
const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`Server is up and running on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
