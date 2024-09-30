import { Body, Controller, HttpException, Post } from '@nestjs/common';

@Controller('/exception')
export class TestController {
  @Post()
  conflict(@Body() body: { statusCode: number }) {
    throw new HttpException('Error', body.statusCode);
  }
}
