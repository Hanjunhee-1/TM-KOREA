import { Injectable, Optional, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  isDatabaseConfigured,
  isMinioConfigured,
  isRedisConfigured,
} from './config/persistence.config';
import { ObjectStorageService } from './infrastructure/object-storage/object-storage.service';
import { RedisService } from './infrastructure/redis/redis.service';

@Injectable()
export class AppService {
  constructor(
    private readonly redis: RedisService,
    private readonly objectStorage: ObjectStorageService,
    @Optional() @Inject(DataSource) private readonly dataSource?: DataSource,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    const mysqlConfigured = isDatabaseConfigured();
    const redisConfigured = isRedisConfigured();
    const minioConfigured = isMinioConfigured();

    return {
      status: 'ok',
      service: 'TM-KOREA API',
      persistence: {
        mysql: mysqlConfigured
          ? this.dataSource?.isInitialized
            ? 'up'
            : 'down'
          : 'disabled',
        redis: redisConfigured
          ? (await this.redis.ping())
            ? 'up'
            : 'down'
          : 'disabled',
        minio: minioConfigured
          ? (await this.objectStorage.ping())
            ? 'up'
            : 'down'
          : 'disabled',
      },
    };
  }
}
