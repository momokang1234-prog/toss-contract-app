import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import accountsRoutes from "./routes/accounts.js";
import transfersRoutes from "./routes/transfers.js";
import transactionsRoutes from "./routes/transactions.js";
import { setupSwagger } from "./swagger.js";

export function createApp(): express.Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Swagger docs
  setupSwagger(app);

  // Routes
  app.use("/auth", authRoutes);
  app.use("/accounts", accountsRoutes);
  app.use("/transfers", transfersRoutes);
  app.use("/transactions", transactionsRoutes);

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}
