import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

/**
 * The command routes redeploy (or wipe) what every player sees, and the bot's
 * HTTP port has no other authentication in front of it, so they require a
 * shared secret. Fails closed: with no `ADMIN_TOKEN` configured, nothing can
 * reach them.
 *
 * The token is accepted as a query parameter as well as a header so the routes
 * stay reachable from a browser or a plain `curl`.
 */
@Injectable()
export class AdminTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.ADMIN_TOKEN;
    if (!expected) {
      throw new ForbiddenException('ADMIN_TOKEN is not configured, admin routes are disabled');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-admin-token') ?? request.query?.token;

    if (provided !== expected) {
      throw new ForbiddenException('Invalid admin token');
    }
    return true;
  }
}
