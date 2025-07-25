import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitService } from './rabbit.service';
import { RedisService } from './redis.service';
import { EventType } from './enums/EEvent-type.enum';

@Injectable()
export class RabbitListenerService implements OnModuleInit {
  constructor(
    private readonly rabbitService: RabbitService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.rabbitService.ready;
    await this.rabbitService.consume(EventType.REGISTRATION, async (msg) => {
      const data = msg.content.toString();
      const message = `Land ${data} registered successfully.`;
      await this.redisService.publish(
        'notifications',
        JSON.stringify({
          type: EventType.REGISTRATION,
          message,
        }),
      );
    });

    // listen the transer too
    await this.rabbitService.consume(EventType.TRANSFER, async (msg) => {
      const data = JSON.parse(msg.content);
      const message = `Land ${data.parcel.parcelNumber || 'N/A'} transfer between ${data.toOwner.name || 'N/A'} and ${data.fromOwner.name || 'N/A'} successfully completed.`;

      await this.redisService.publish(
        'notifications',
        JSON.stringify({
          type: EventType.TRANSFER,
          message,
        }),
      );
    });
  }
}
