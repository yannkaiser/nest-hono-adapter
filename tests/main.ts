import { NestFactory } from '@nestjs/core';
import { HonoAdapter } from '../adapter/hono-adapter';
import { Body, Controller, Get, Module, Post } from '@nestjs/common';

@Controller('todos')
class TestController {
  @Get()
  getTodos() {
    return [{ text: 'Finish adapter' }];
  }

  @Post()
  postTest(@Body() todoText: string) {
    return { text: todoText };
  }
}

@Module({
  controllers: [TestController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new HonoAdapter(), {});

  await app.listen(3001);
}

bootstrap();
