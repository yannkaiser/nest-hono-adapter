import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HonoAdapter } from '../../adapter/hono-adapter';
import { initApp } from '../helpers';
import { TestModule } from './test.module';
import * as supertest from 'supertest';

describe('Parse body', () => {
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
    it('should return body', () => {
      return supertest(app.getHttpServer())
        .post('/body')
        .set('Content-Type', 'application/json')
        .send({
          content: 'JSON content',
        })
        .expect(201)
        .expect({
          parsed: {
            content: 'JSON content',
          },
        });
    });

    it('should handle empty body', () => {
      return supertest(app.getHttpServer())
        .post('/body')
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect({});
    });
  });

  describe('text/plain', () => {
    it('should return body', () => {
      return supertest(app.getHttpServer())
        .post('/body')
        .set('Content-Type', 'text/plain')
        .send('content')
        .expect(201)
        .expect({ parsed: 'content' });
    });
  });
});
