import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Land Taxes Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  it('should calculate tax for a given area', async () => {
    const res = await request(app.getHttpServer())
      .get('/land-taxes/calculate?area=1000');
    expect(res.status).toBe(200);
    expect(res.body.tax).toBe(10000); // 1000 * 10
  });

  afterAll(async () => {
    await app.close();
  });
}); 