import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { Grant } from "../entities/Grant";
import { MilestoneProof } from "../entities/MilestoneProof";
import { Contributor } from "../entities/Contributor";
import { ReputationLog } from "../entities/ReputationLog";
import { AuditLog } from "../entities/AuditLog";

export const buildDataSource = (databaseUrl = env.databaseUrl) =>
  new DataSource({
    type: databaseUrl.startsWith("sqljs") ? "sqljs" : "postgres",
    ...(databaseUrl.startsWith("sqljs")
      ? { location: databaseUrl.replace("sqljs://", ""), autoSave: false }
      : { url: databaseUrl }),
    entities: [Grant, MilestoneProof, Contributor, ReputationLog, AuditLog],
    synchronize: true,
  });
