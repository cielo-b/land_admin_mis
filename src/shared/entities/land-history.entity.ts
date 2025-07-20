import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { LandParcel } from './land-parcel.entity';
import { User } from './user.entity';
import { EventType } from '../enums/EEvent-type.enum';

@Entity()
export class LandHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandParcel, (parcel) => parcel.history)
  parcel: LandParcel;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  eventType: EventType;

  @Column('jsonb')
  details: any;

  @Column()
  eventDate: Date;

  @ManyToOne(() => User)
  recordedBy: User;
}
