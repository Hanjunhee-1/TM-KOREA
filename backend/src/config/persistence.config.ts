export type PersistenceStatus = 'disabled' | 'up' | 'down';

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_HOST);
}

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_HOST);
}

export function isMinioConfigured(): boolean {
  return Boolean(process.env.MINIO_ENDPOINT);
}

export function getDatabaseConfig() {
  return {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 3306),
    username: process.env.DATABASE_USER ?? 'tmkorea',
    password: process.env.DATABASE_PASSWORD ?? 'tmkorea',
    database: process.env.DATABASE_NAME ?? 'tmkorea',
    logging: process.env.DATABASE_LOGGING === 'true',
  };
}
