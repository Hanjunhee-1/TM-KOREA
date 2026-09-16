import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: () => 'Hello World!',
            getHealth: async () => ({
              status: 'ok',
              service: 'TM-KOREA API',
              persistence: {
                mysql: 'disabled',
                redis: 'disabled',
                minio: 'disabled',
              },
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return API health', async () => {
      await expect(appController.getHealth()).resolves.toMatchObject({
        status: 'ok',
        service: 'TM-KOREA API',
      });
    });
  });
});
