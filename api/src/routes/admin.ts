import { Router } from "express";
import { Repository } from "typeorm";
import { GrantSyncService } from "../services/grant-sync-service";
import { Contributor } from "../entities/Contributor";
import { AuditLog } from "../entities/AuditLog";

export const buildAdminRouter = (
  grantSyncService: GrantSyncService,
  contributorRepo: Repository<Contributor>,
  auditLogRepo: Repository<AuditLog>
) => {
  const router = Router();

  router.post("/sync/:grant_id", async (req, res, next) => {
    try {
      const grantId = parseInt(req.params.grant_id, 10);
      if (isNaN(grantId)) {
        res.status(400).json({ error: "Invalid grant ID" });
        return;
      }

      await grantSyncService.syncGrant(grantId);

      await auditLogRepo.save({
        adminAddress: (req as any).adminAddress,
        action: "SYNC_GRANT",
        target: `grant:${grantId}`,
        details: `Force synced grant ${grantId}`,
      });

      res.json({ ok: true, message: `Grant ${grantId} synced` });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/users/:address/blacklist", async (req, res, next) => {
    try {
      const { address } = req.params;
      const { blacklist } = req.body;

      if (typeof blacklist !== "boolean") {
        res.status(400).json({ error: "Missing or invalid 'blacklist' field (boolean)" });
        return;
      }

      let contributor = await contributorRepo.findOne({ where: { address } });
      if (!contributor) {
        contributor = contributorRepo.create({ address });
      }

      contributor.isBlacklisted = blacklist;
      await contributorRepo.save(contributor);

      await auditLogRepo.save({
        adminAddress: (req as any).adminAddress,
        action: blacklist ? "BLACKLIST_USER" : "UNBLACKLIST_USER",
        target: `user:${address}`,
        details: `${blacklist ? "Blacklisted" : "Unblacklisted"} user ${address}`,
      });

      res.json({ ok: true, isBlacklisted: blacklist });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
