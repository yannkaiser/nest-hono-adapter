import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { AuthGuard } from './auth.guard';

@Module({ controllers: [TestController], providers: [AuthGuard] })
export class TestModule {}
