import { Module } from '@nestjs/common';
import { LandController } from './land.controller';
import { LandService } from './land.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandParcel } from '../shared/entities/land-parcel.entity';
import { LandTransfer } from '../shared/entities/land-transfer.entity';
import { User } from '../shared/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LandParcel, LandTransfer, User]),
    NotificationsModule,
    SharedModule,
  ],
  controllers: [LandController],
  providers: [LandService],
  exports: [LandService],
})
export class LandModule {}
