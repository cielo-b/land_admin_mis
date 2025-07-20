import { Module } from '@nestjs/common';
import { PermitsController } from './permits.controller';
import { PermitsService } from './permits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionPermit } from '../shared/entities/construction-permit.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructionPermit]), NotificationsModule, SharedModule],
  controllers: [PermitsController],
  providers: [PermitsService],
  exports: [PermitsService],
})
export class PermitsModule {}
