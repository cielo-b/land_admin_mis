import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { LandParcel } from './land-parcel.entity';
import { PermitStatus } from '../enums/EPermit-status.enum';

@Entity()
export class ConstructionPermit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandParcel, (parcel) => parcel.permits)
  parcel: LandParcel;

  @ManyToOne(() => User, (user) => user.permits)
  applicant: User;

  @Column({
    type: 'enum',
    enum: PermitStatus,
    default: PermitStatus.DRAFT,
  })
  status: PermitStatus;

  @Column()
  constructionType: string;

  @Column('float')
  plannedArea: number;

  @Column()
  submissionDate: Date;

  @Column({ nullable: true })
  reviewDate: Date;

  @Column({ nullable: true })
  approvalDate: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column('jsonb')
  documents: any;
}
