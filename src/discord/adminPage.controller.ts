import { Controller, Get, Header } from '@nestjs/common';
import { ADMIN_PAGE_HTML } from './adminPage';

/**
 * Deliberately unguarded: this is the page on which the admin token is typed,
 * so requiring the token to load it would be circular. It ships no secrets and
 * every action it triggers goes through the guarded command routes.
 */
@Controller('discord')
export class AdminPageController {
  @Get('/')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  page() {
    return ADMIN_PAGE_HTML;
  }
}
