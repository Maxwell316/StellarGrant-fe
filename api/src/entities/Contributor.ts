import { Column, Entity, Index, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "contributors" })
export class Contributor {
  @PrimaryColumn({ type: "varchar", length: 120 })
  address!: string;

  @Column({ type: "int", default: 0 })
  @Index("IDX_contributors_reputation")
  reputation!: number;

  @Column({ type: "int", default: 0 })
  totalGrantsCompleted!: number;

  @Column({ type: "boolean", default: false })
  isBlacklisted!: boolean;

  @UpdateDateColumn()
  updatedAt!: Date;
}
