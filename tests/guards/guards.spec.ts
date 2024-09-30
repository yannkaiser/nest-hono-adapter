import { INestApplication } from '@nestjs/common';
import { TestModule } from './test.module';
import { Test } from '@nestjs/testing';
import { HonoAdapter } from '../../adapter/hono-adapter';
import { initApp } from '../helpers';
import * as supertest from 'supertest';

describe('Guards', () => {
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

  // TODO: rename test
  it('should return 401 when guard blocks', () => {
    return supertest(app.getHttpServer()).get('/test').expect(403);
  });
  it('should return 200 when guard does not block', () => {
    return supertest(app.getHttpServer())
      .get('/test')
      .set('Bypass', 'true')
      .expect(200);
  });
});
