import { Injectable } from '@nestjs/common';
import { RedisService } from '../shared/redis.service';
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    this.redisService.subscribe('notifications', (message) => {
      console.log('notifications', JSON.parse(message));
    });
  }

  async sendNotification(channel: string, message: string) {
    await this.redisService.publish(channel, JSON.stringify(message));
  }

  async onNotification(channel: string, callback: (message: any) => void) {
    await this.redisService.subscribe(channel, (msg) => {
      callback(JSON.parse(msg));
    });
  }
}
