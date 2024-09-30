import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestModule } from './test.module';
import { HonoAdapter } from '../../adapter/hono-adapter';
import { initApp } from '../helpers';
import * as supertest from 'supertest';

describe('Exceptions handling', () => {
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

  it.each(generateHTTPStatusCodes())(
    'should return status code of exception (%i)',
    (statusCode: number) => {
      return supertest(app.getHttpServer())
        .post('/exception')
        .send({ statusCode })
        .expect(statusCode)
        .expect({
          message: 'Error',
          statusCode,
        });
    },
  );
});

function generateHTTPStatusCodes(): number[] {
  const arr = [];
  for (let i = 400; i <= 419; i++) {
    arr.push(i);
  }
  for (let i = 421; i <= 429; i++) {
    arr.push(i);
  }

  arr.push(...[431, 449, 450, 451, 456]);

  for (let i = 500; i <= 511; i++) {
    arr.push(i);
  }

  return arr;
}
