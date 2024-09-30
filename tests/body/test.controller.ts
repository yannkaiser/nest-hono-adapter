import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('/body')
export class TestController {
  @Post()
  postJSON(@Body() content: any) {
    return {
      parsed: content,
    };
  }

  @Get('/json')
  getJSON() {
    return {
      type: 'JSON',
    };
  }

  @Get('/text')
  getText() {
    return 'TEXT';
  }
}
