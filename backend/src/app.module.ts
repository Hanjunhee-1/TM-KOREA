import './config/load-env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ObjectStorageModule } from './infrastructure/object-storage/object-storage.module';
import { RedisModule } from './infrastructure/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule.register(),
    RedisModule,
    ObjectStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
