import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Land Module (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let userId: number;
  let landId: number;

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
      email: 'testland@example.com',
      password: 'Test1234!',
      name: 'Test Land',
      phone: '123456789',
      nationalId: '1234567890123456',
    });
    expect(res.status).toBe(201);
  });

  it('should login and get JWT', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'testland@example.com',
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
        parcelNumber: 'LP-001',
        location: { type: 'Point', coordinates: [30.1, -1.9] },
        area: 1000,
        address: 'Kigali',
        district: 'Gasabo',
        sector: 'Kimironko',
        cell: 'Kibagabaga',
        village: 'Village1',
        registeredOwnerId: userId,
      });
    expect(res.status).toBe(201);
    landId = res.body.id;
  });

  it('should transfer land', async () => {
    // Register a second user
    const res2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'testland2@example.com',
        password: 'Test1234!',
        name: 'Test Land 2',
        phone: '987654321',
        nationalId: '1234567890123457',
      });
    expect(res2.status).toBe(201);
    // Login as second user to get ID
    const res3 = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'testland2@example.com',
      password: 'Test1234!',
    });
    const user2Id = res3.body.data.user.id;
    // Transfer land
    const res = await request(app.getHttpServer())
      .post('/land/transfer')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        parcelId: landId,
        fromOwnerId: userId,
        toOwnerId: user2Id,
        documents: { doc: 'transfer doc' },
      });
    expect(res.status).toBe(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
