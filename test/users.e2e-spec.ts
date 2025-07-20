import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users Module (e2e)', () => {
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

    // Register and login as admin (simulate admin by direct DB update or use a seed)
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'adminuser@example.com',
      password: 'Test1234!',
      name: 'Admin User',
      phone: '123456789',
      nationalId: '5234567890123456',
    });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'adminuser@example.com',
        password: 'Test1234!',
      });
    jwt = loginRes.body.data.token;
    userId = loginRes.body.data.user.id;
    // Optionally, update user role to ADMIN in DB if needed
  });

  it('should list users (admin only)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a user (admin only)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Updated Admin' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Admin');
  });

  it('should delete a user (admin only)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
