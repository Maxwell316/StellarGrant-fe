import { DataSource, Repository } from "typeorm";
import { Grant } from "../entities/Grant";
import { Contributor } from "../entities/Contributor";
import { ReputationLog } from "../entities/ReputationLog";
import { SorobanContractClient } from "../soroban/types";

export class GrantSyncService {
  private readonly grantRepo: Repository<Grant>;
  private readonly contributorRepo: Repository<Contributor>;
  private readonly reputationLogRepo: Repository<ReputationLog>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly sorobanClient: SorobanContractClient,
  ) {
    this.grantRepo = this.dataSource.getRepository(Grant);
    this.contributorRepo = this.dataSource.getRepository(Contributor);
    this.reputationLogRepo = this.dataSource.getRepository(ReputationLog);
  }

  async syncAllGrants(): Promise<void> {
    const grants = await this.sorobanClient.fetchGrants();
    for (const grant of grants) {
      await this.grantRepo.save(grant);
      await this.syncContributorScore(grant.recipient);
    }
  }

  async syncGrant(id: number): Promise<void> {
    const grant = await this.sorobanClient.fetchGrantById(id);
    if (!grant) return;
    await this.grantRepo.save(grant);
    await this.syncContributorScore(grant.recipient);
  }

  private async syncContributorScore(address: string): Promise<void> {
    const score = await this.sorobanClient.fetchContributorScore(address);
    if (!score) return;

    let contributor = await this.contributorRepo.findOne({ where: { address } });
    const oldReputation = contributor?.reputation ?? 0;

    if (!contributor) {
      contributor = new Contributor();
      contributor.address = address;
    }

    // Count completed grants for this recipient
    const totalGrantsCompleted = await this.grantRepo.count({
      where: { recipient: address, status: "completed" }
    });

    contributor.reputation = score.reputation;
    contributor.totalGrantsCompleted = totalGrantsCompleted;
    await this.contributorRepo.save(contributor);

    // If reputation increased, log it for monthly leaderboard
    if (score.reputation > oldReputation) {
      const log = new ReputationLog();
      log.address = address;
      log.gain = score.reputation - oldReputation;
      await this.reputationLogRepo.save(log);
    }
  }
}
