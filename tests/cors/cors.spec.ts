import { INestApplication } from '@nestjs/common';
import { TestModule } from './test.module';
import { Test } from '@nestjs/testing';
import { HonoAdapter } from '../../adapter/hono-adapter';
import { initApp } from '../helpers';
import * as supertest from 'supertest';

describe('Cors', () => {
  describe('with options', () => {
    let app: INestApplication;
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [TestModule],
      }).compile();
      app = module.createNestApplication(new HonoAdapter());

      app.enableCors({
        origin: 'example.com',
        credentials: true,
        exposedHeaders: ['with', 'options'],
      });

      await initApp(app);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should add cors headers in reply', () => {
      return supertest(app.getHttpServer())
        .get('/test')
        .expect('access-control-allow-origin', 'example.com')
        .expect('vary', 'Origin')
        .expect('access-control-allow-credentials', 'true')
        .expect('access-control-expose-headers', 'with,options')
        .expect('content-length', '0');
    });
  });

  describe('with options as delegate', () => {
    let app: INestApplication;
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [TestModule],
      }).compile();
      app = module.createNestApplication(new HonoAdapter());

      app.enableCors((c, cb) => {
        return cb(null, {
          origin: 'example.com',
          credentials: true,
          exposedHeaders: ['with', 'delegate'],
        });
      });

      await initApp(app);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should add cors headers in reply', () => {
      return supertest(app.getHttpServer())
        .get('/test')
        .expect('access-control-allow-origin', 'example.com')
        .expect('vary', 'Origin')
        .expect('access-control-allow-credentials', 'true')
        .expect('access-control-expose-headers', 'with,delegate')
        .expect('content-length', '0');
    });
  });

  describe('without options', () => {
    let app: INestApplication;
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [TestModule],
      }).compile();
      app = module.createNestApplication(new HonoAdapter());

      app.enableCors();

      await initApp(app);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should use default options', () => {
      return supertest(app.getHttpServer())
        .options('/test')
        .expect('access-control-allow-origin', '*')
        .expect(
          'access-control-allow-methods',
          'GET,HEAD,PUT,POST,DELETE,PATCH',
        );
    });
  });
});
