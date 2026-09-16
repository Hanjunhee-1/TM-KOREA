import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { isRedisConfigured } from '../../config/persistence.config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | null;

  constructor() {
    if (!isRedisConfigured()) {
      this.client = null;
      this.logger.warn('Redis is not configured; realtime state is disabled.');
      return;
    }

    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }

  getClient(): Redis | null {
    return this.client;
  }

  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
      return (await this.client.ping()) === 'PONG';
    } catch (error) {
      this.logger.warn(`Redis ping failed: ${(error as Error).message}`);
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      this.client.disconnect();
    }
  }
}
