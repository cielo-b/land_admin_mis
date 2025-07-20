import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from '../enums/ERole.enum';
import { LandParcel } from './land-parcel.entity';
import { ConstructionPermit } from './construction-permit.entity';
import { DisputeCase } from './dispute-case.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nationalId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.CITIZEN],
  })
  roles: UserRole[];

  @OneToMany(() => LandParcel, (parcel) => parcel.registeredOwner)
  ownedLand: LandParcel[];

  @OneToMany(() => ConstructionPermit, (permit) => permit.applicant)
  permits: ConstructionPermit[];

  @OneToMany(() => DisputeCase, (dispute) => dispute.complainant)
  disputes: DisputeCase[];
}
