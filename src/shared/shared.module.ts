/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { Controller, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { User } from './entities/user.entity';
import { LandParcel } from './entities/land-parcel.entity';
import { LandHistory } from './entities/land-history.entity';
import { ConstructionPermit } from './entities/construction-permit.entity';
import { DisputeCase } from './entities/dispute-case.entity';
import { LandTransfer } from './entities/land-transfer.entity';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { RedisService } from './redis.service';
import { RabbitService } from './rabbit.service';
import { RabbitListenerService } from './rabbit-listener.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      LandParcel,
      LandHistory,
      ConstructionPermit,
      DisputeCase,
      LandTransfer,
      AuditLog,
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: 'memory',
        redis: {
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
        },
        ttl: 60 * 60 * 24,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService, RabbitService, AuditLogService, RabbitListenerService],
  exports: [
    TypeOrmModule,
    CacheModule,
    BullModule,
    RedisService,
    RabbitService,
    AuditLogService,
  ],
})
export class SharedModule {}
