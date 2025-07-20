import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://localhost',
    );
    this.channel = await this.connection.createChannel();
  }

  getChannel() {
    return this.channel;
  }

  async publish(queue: string, message: string) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async consume(queue: string, callback: (msg: amqp.ConsumeMessage) => void) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, callback, { noAck: true });
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }
}
