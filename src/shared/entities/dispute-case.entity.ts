import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { LandParcel } from './land-parcel.entity';

export enum DisputeStatus {
  OPEN = 'open',
  IN_MEDIATION = 'in_mediation',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

@Entity()
export class DisputeCase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandParcel, (parcel) => parcel.disputes)
  parcel: LandParcel;

  @ManyToOne(() => User, (user) => user.disputes)
  complainant: User;

  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.OPEN,
  })
  status: DisputeStatus;

  @Column()
  description: string;

  @Column()
  submissionDate: Date;

  @Column({ nullable: true })
  resolutionDate: Date;

  @Column({ nullable: true })
  resolutionDetails: string;

  @Column('jsonb')
  supportingDocuments: any;

  @Column({ nullable: true })
  resolvedBy: number;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ nullable: true })
  updatedAt: Date;
}
