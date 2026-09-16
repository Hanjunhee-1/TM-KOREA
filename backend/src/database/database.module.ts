import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  getDatabaseConfig,
  isDatabaseConfigured,
} from '../config/persistence.config';
import { databaseEntities } from './entities';
import { InitCoreDomainSchema20260916120000 } from './migrations/20260916120000-InitCoreDomainSchema';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    if (!isDatabaseConfigured()) {
      return { module: DatabaseModule };
    }

    const database = getDatabaseConfig();

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: database.host,
          port: database.port,
          username: database.username,
          password: database.password,
          database: database.database,
          charset: 'utf8mb4',
          timezone: 'Z',
          entities: databaseEntities,
          migrations: [InitCoreDomainSchema20260916120000],
          synchronize: false,
          logging: database.logging,
        }),
      ],
    };
  }
}
