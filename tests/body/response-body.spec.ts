import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HonoAdapter } from '../../adapter/hono-adapter';
import { initApp } from '../helpers';
import { TestModule } from './test.module';
import * as supertest from 'supertest';

describe('Response body', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();
    app = module.createNestApplication(new HonoAdapter());

    await initApp(app);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('application/json', () => {
    it('should return JSON body', () => {
      return supertest(app.getHttpServer())
        .get('/body/json')
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect({
          type: 'JSON',
        });
    });
  });

  describe('text/plain', () => {
    it('should return text body', () => {
      return supertest(app.getHttpServer())
        .get('/body/text')
        .set('Content-Type', 'text/plain')
        .expect(200)
        .expect('TEXT');
    });
  });
});
