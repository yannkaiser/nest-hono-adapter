import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Controller('/test')
@UseGuards(AuthGuard)
export class TestController {
  @Get()
  getTest() {
    return '';
  }
}
