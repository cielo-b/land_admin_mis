import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Settings Module (e2e)', () => {
  let app: INestApplication;
  let jwt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    // Register and login as admin
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'settingsadmin@example.com',
      password: 'Test1234!',
      name: 'Settings Admin',
      phone: '123456789',
      nationalId: '6234567890123456',
    });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'settingsadmin@example.com',
        password: 'Test1234!',
      });
    jwt = loginRes.body.data.token;
  });

  it('should set workflow settings', async () => {
    const res = await request(app.getHttpServer())
      .post('/settings/workflow')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        type: 'landTransfer',
        config: {
          requiredApprovals: 2,
          customStatuses: ['initiated', 'approved'],
        },
      });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe('landTransfer');
  });

  it('should get workflow settings', async () => {
    const res = await request(app.getHttpServer())
      .get('/settings/workflow?type=landTransfer')
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(res.body.requiredApprovals).toBe(2);
  });

  afterAll(async () => {
    await app.close();
  });
});
