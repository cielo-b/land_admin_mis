import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  public ready: Promise<void>;
  private readyResolve: () => void;

  constructor() {
    this.ready = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
  }

  async onModuleInit() {
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://localhost',
    );
    this.channel = await this.connection.createChannel();
    this.readyResolve();
  }

  async publish(queue: string, message: string) {
    await this.ready;
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async consume(queue: string, callback: (msg: amqp.ConsumeMessage) => void) {
    await this.ready;
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, callback, { noAck: true });
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}