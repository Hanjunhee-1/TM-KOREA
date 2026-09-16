import { Injectable, Logger } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { isMinioConfigured } from '../../config/persistence.config';

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly client: MinioClient | null;
  readonly bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET ?? 'tm-korea-documents';
    if (!isMinioConfigured()) {
      this.client = null;
      this.logger.warn('MinIO is not configured; object storage is disabled.');
      return;
    }

    const endpoint = process.env.MINIO_ENDPOINT ?? 'localhost';
    const [host, portValue] = endpoint.includes(':')
      ? endpoint.split(':')
      : [endpoint, process.env.MINIO_PORT ?? '9000'];

    this.client = new MinioClient({
      endPoint: host,
      port: Number(portValue),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY ?? 'tmkorea',
      secretKey: process.env.MINIO_SECRET_KEY ?? 'tmkoreapass',
    });
  }

  getClient(): MinioClient | null {
    return this.client;
  }

  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }
    try {
      await this.client.bucketExists(this.bucket);
      return true;
    } catch (error) {
      this.logger.warn(`MinIO ping failed: ${(error as Error).message}`);
      return false;
    }
  }
}
