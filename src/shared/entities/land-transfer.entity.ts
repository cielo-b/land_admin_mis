import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { LandParcel } from './land-parcel.entity';
import { User } from './user.entity';
import { TransferStatus } from '../enums/ETransfer-status.enum';

@Entity()
export class LandTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandParcel)
  parcel: LandParcel;

  @ManyToOne(() => User)
  fromOwner: User;

  @ManyToOne(() => User)
  toOwner: User;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @Column()
  requestDate: Date;

  @Column({ nullable: true })
  approvalDate: Date;

  @Column({ nullable: true })
  completionDate: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column('jsonb', { nullable: true })
  documents: any;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ nullable: true })
  updatedAt: Date;
}
