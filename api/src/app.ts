import express from "express";
import helmet from "helmet";
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

export const createApp = (dataSource: DataSource, sorobanClient: SorobanContractClient) => {
  const app = express();
  app.use(helmet());
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

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use(rateLimiter);
  app.use("/grants", buildGrantRouter(grantRepo, grantSyncService));
  app.use("/milestone_proof", buildMilestoneProofRouter(proofRepo, signatureService));
  app.use("/leaderboard", buildLeaderboardRouter(leaderboardService));
  app.use("/admin", adminMiddleware, buildAdminRouter(grantSyncService, contributorRepo, auditLogRepo));

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  });

  return app;
};
