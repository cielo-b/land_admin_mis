import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entity: string; // e.g., 'LandTransfer'

  @Column()
  entityId: number;

  @Column()
  action: string; // e.g., 'APPROVED', 'UPDATED'

  @Column()
  performedBy: number; // User ID

  @Column()
  performedAt: Date;

  @Column('jsonb', { nullable: true })
  before: any;

  @Column('jsonb', { nullable: true })
  after: any;
}
