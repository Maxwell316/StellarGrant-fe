import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { DataSource } from "typeorm";
import { Grant } from "./entities/Grant";
import { MilestoneProof } from "./entities/MilestoneProof";
import { buildGrantRouter } from "./routes/grants";
import { buildMilestoneProofRouter } from "./routes/milestone-proof";
import { buildLeaderboardRouter } from "./routes/leaderboard";
import { buildAdminRouter } from "./routes/admin";
import { GrantSyncService } from "./services/grant-sync-service";
import { LeaderboardService } from "./services/leaderboard-service";
import { SignatureService } from "./services/signature-service";
import { Contributor } from "./entities/Contributor";
import { AuditLog } from "./entities/AuditLog";
import { buildAdminMiddleware } from "./middlewares/admin-middleware";
import { SorobanContractClient } from "./soroban/types";
import { createRateLimiter } from "./middlewares/rate-limiter";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { env } from "./config/env";
import { requestLogger } from "./config/logger";
import { v4 as uuidv4 } from "uuid";

export const createApp = (dataSource: DataSource, sorobanClient: SorobanContractClient) => {
  const app = express();

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: env.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-address", "x-admin-signature", "x-admin-nonce", "x-admin-timestamp"],
  }));

  // Request ID generation
  app.use((req, _res, next) => {
    req.headers["x-request-id"] = req.headers["x-request-id"] || uuidv4();
    next();
  });

  // HTTP request logging with Morgan and Winston
  const httpLogger = requestLogger();
  app.use(morgan("combined", {
    stream: {
      write: (message: string) => {
        httpLogger.info(message.trim());
      },
    },
  }));

  app.use(express.json());

  const rateLimiter = createRateLimiter(dataSource);

  const grantRepo = dataSource.getRepository(Grant);
  const proofRepo = dataSource.getRepository(MilestoneProof);
  const grantSyncService = new GrantSyncService(dataSource, sorobanClient);
  const signatureService = new SignatureService();
  const leaderboardService = new LeaderboardService(dataSource);

  const contributorRepo = dataSource.getRepository(Contributor);
  const auditLogRepo = dataSource.getRepository(AuditLog);
  const adminMiddleware = buildAdminMiddleware(signatureService);

  // Health check endpoint (no versioning)
  app.get("/health", (_req, res) => res.json({ ok: true, version: "v1" }));

  // Apply rate limiting
  app.use(rateLimiter);

  // API v1 routes
  app.use("/v1/grants", buildGrantRouter(grantRepo, grantSyncService));
  app.use("/v1/milestone_proof", buildMilestoneProofRouter(proofRepo, signatureService));
  app.use("/v1/leaderboard", buildLeaderboardRouter(leaderboardService));
  app.use("/v1/admin", adminMiddleware, buildAdminRouter(grantSyncService, contributorRepo, auditLogRepo));

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};
