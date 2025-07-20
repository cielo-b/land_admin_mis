import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  it('should register a user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      email: 'authtest@example.com',
      password: 'Test1234!',
      name: 'Auth Test',
      phone: '123456789',
      nationalId: '4234567890123456',
    });
    expect(res.status).toBe(201);
  });

  it('should login and get JWT', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'authtest@example.com',
      password: 'Test1234!',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    jwt = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    await app.close();
  });
});
