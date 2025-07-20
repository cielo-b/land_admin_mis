import { Injectable } from '@nestjs/common';
import { RedisService } from '../shared/redis.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly redisService: RedisService) {}

  async sendNotification(channel: string, message: string) {
    await this.redisService.publish(channel, JSON.stringify(message));
  }

  async onNotification(channel: string, callback: (message: any) => void) {
    await this.redisService.subscribe(channel, (msg) => {
      callback(JSON.parse(msg));
    });
  }
}
