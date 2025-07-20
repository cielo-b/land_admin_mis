import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Disputes Module (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let userId: number;
  let landId: number;
  let disputeId: number;

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
      email: 'testdispute@example.com',
      password: 'Test1234!',
      name: 'Test Dispute',
      phone: '123456789',
      nationalId: '3234567890123456',
    });
    expect(res.status).toBe(201);
  });

  it('should login and get JWT', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'testdispute@example.com',
      password: 'Test1234!',
    });
    expect(res.status).toBe(200);
    jwt = res.body.data.token;
    userId = res.body.data.user.id;
  });

  it('should register land', async () => {
    const res = await request(app.getHttpServer())
      .post('/land/register')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        parcelNumber: 'LP-003',
        location: { type: 'Point', coordinates: [30.3, -1.7] },
        area: 800,
        address: 'Kigali',
        district: 'Gasabo',
        sector: 'Kimironko',
        cell: 'Kibagabaga',
        village: 'Village3',
        registeredOwnerId: userId,
      });
    expect(res.status).toBe(201);
    landId = res.body.id;
  });

  it('should submit a dispute', async () => {
    const res = await request(app.getHttpServer())
      .post('/disputes/submit')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        parcelId: landId,
        complainantId: userId,
        description: 'Boundary issue',
        supportingDocuments: { doc: 'dispute doc' },
      });
    expect(res.status).toBe(201);
    disputeId = res.body.id;
  });

  it('should get the dispute by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/disputes/${disputeId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(disputeId);
  });

  afterAll(async () => {
    await app.close();
  });
});
