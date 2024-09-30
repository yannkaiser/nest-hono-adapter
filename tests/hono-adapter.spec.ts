import { NestFactory } from '@nestjs/core';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  INestApplication,
  Module,
  Post,
} from '@nestjs/common';
import { HonoAdapter } from '../adapter/hono-adapter';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ExpressAdapter } from '@nestjs/platform-express';

describe('Hono adapter', () => {
  let app: INestApplication;
  beforeAll(async () => {
    @Controller('/todos')
    class TestController {
      @Get()
      getTodos() {
        return [{ text: 'Finish adapter' }];
      }
      @Post()
      postTest(@Body() todoText: string) {
        return { text: todoText };
      }

      @Get('/exception')
      testException() {
        throw new ConflictException('should be catched');
      }
    }
    const module = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();
    app = module.createNestApplication(new HonoAdapter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('app should start with hono as http adapter', async () => {
    @Controller('test')
    class TestController {
      @Get()
      get() {
        return {};
      }
    }
    @Module({
      controllers: [TestController],
    })
    class AppModule {}

    const app = await NestFactory.create(AppModule, new HonoAdapter(), {});

    await app.init();
    expect(app.getHttpAdapter().getType()).toEqual('hono');
    await app.close();
  });

  it('should return 404 for unknown route', () => {
    return request(app.getHttpServer()).get('/todos2').expect(404);
  });

  it('should return 200 for existing route expected to return 200', async () => {
    const res = await request(app.getHttpServer()).get('/todos').expect(200);

    expect(res.body).toEqual([{ text: 'Finish adapter' }]);
  });

  it('should handle body', async () => {
    const res = await request(app.getHttpServer())
      .post('/todos')
      .send('New todo')
      .expect(201);

    expect(res.body).toEqual({ text: 'New todo' });
  });

  it('should handle exception', async () => {
    const res = await request(app.getHttpServer())
      .get('/todos/exception')
      .expect(409);

    expect(res.body).toEqual({
      message: 'should be catched',
      error: 'Conflict',
      statusCode: 409,
    });
  });
});
