import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { LandHistory } from './land-history.entity';
import { ConstructionPermit } from './construction-permit.entity';
import { DisputeCase } from './dispute-case.entity';

@Entity()
export class LandParcel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  parcelNumber: string;

  @Column('geometry')
  location: any;

  @Column('float')
  area: number;

  @Column()
  address: string;

  @Column()
  district: string;

  @Column()
  sector: string;

  @Column()
  cell: string;

  @Column()
  village: string;

  @ManyToOne(() => User, (user) => user.ownedLand)
  registeredOwner: User;

  @OneToMany(() => LandHistory, (history) => history.parcel)
  history: LandHistory[];

  @OneToMany(() => ConstructionPermit, (permit) => permit.parcel)
  permits: ConstructionPermit[];

  @OneToMany(() => DisputeCase, (dispute) => dispute.parcel)
  disputes: DisputeCase[];
}
