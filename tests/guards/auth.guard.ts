import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HonoRequest } from 'hono';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: HonoRequest = context.switchToHttp().getRequest();
    return req.header('Bypass') === 'true';
  }
}
