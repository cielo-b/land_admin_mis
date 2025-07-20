import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  getClient() {
    return this.client;
  }

  async publish(channel: string, message: string) {
    await this.client.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    const sub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    sub.subscribe(channel);
    sub.on('message', (chan, msg) => {
      if (chan === channel) callback(msg);
    });
    return sub;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
