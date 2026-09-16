import '../config/load-env';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseEntities } from './entities';
import { InitCoreDomainSchema20260916120000 } from './migrations/20260916120000-InitCoreDomainSchema';

export function createDataSource(): DataSource {
  return new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 3306),
    username: process.env.DATABASE_USER ?? 'tmkorea',
    password: process.env.DATABASE_PASSWORD ?? 'tmkorea',
    database: process.env.DATABASE_NAME ?? 'tmkorea',
    charset: 'utf8mb4',
    timezone: 'Z',
    entities: databaseEntities,
    migrations: [InitCoreDomainSchema20260916120000],
    synchronize: false,
    logging: process.env.DATABASE_LOGGING === 'true',
  });
}

export default createDataSource();
