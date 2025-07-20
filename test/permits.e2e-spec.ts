import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Permits Module (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let userId: number;
  let landId: number;
  let permitId: number;

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
      email: 'testpermit@example.com',
      password: 'Test1234!',
      name: 'Test Permit',
      phone: '123456789',
      nationalId: '2234567890123456',
    });
    expect(res.status).toBe(201);
  });

  it('should login and get JWT', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'testpermit@example.com',
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
        parcelNumber: 'LP-002',
        location: { type: 'Point', coordinates: [30.2, -1.8] },
        area: 500,
        address: 'Kigali',
        district: 'Gasabo',
        sector: 'Kimironko',
        cell: 'Kibagabaga',
        village: 'Village2',
        registeredOwnerId: userId,
      });
    expect(res.status).toBe(201);
    landId = res.body.id;
  });

  it('should apply for a permit', async () => {
    const res = await request(app.getHttpServer())
      .post('/permits/apply')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        parcelId: landId,
        applicantId: userId,
        constructionType: 'Residential',
        plannedArea: 120,
        documents: { doc: 'permit doc' },
      });
    expect(res.status).toBe(201);
    permitId = res.body.id;
  });

  it('should get the permit by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/permits/${permitId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(permitId);
  });

  afterAll(async () => {
    await app.close();
  });
});
