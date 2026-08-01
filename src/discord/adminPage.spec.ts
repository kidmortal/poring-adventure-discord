import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as vm from 'vm';
import * as request from 'supertest';
import { ADMIN_PAGE_HTML } from './adminPage';
import { AdminPageController } from './adminPage.controller';

describe('admin page', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [AdminPageController] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('serves without a token, since it is where the token gets typed', async () => {
    delete process.env.ADMIN_TOKEN;

    const response = await request(app.getHttpServer()).get('/discord').expect(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.text).toContain('Discord command deployment');
  });

  // The inline script is never seen by tsc, so a typo would only show up in the browser.
  it('has a syntactically valid inline script', () => {
    const scripts = [...ADMIN_PAGE_HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
    expect(scripts).toHaveLength(1);
    expect(() => new vm.Script(scripts[0])).not.toThrow();
  });

  it('talks to the guarded route and sends the token as a header', () => {
    expect(ADMIN_PAGE_HTML).toContain("fetch('/discord/commands'");
    expect(ADMIN_PAGE_HTML).toContain("'x-admin-token': token");
  });

  it('never embeds a token of its own', () => {
    expect(ADMIN_PAGE_HTML).not.toMatch(/ADMIN_TOKEN\s*=\s*['"][^'"]+['"]/);
  });
});
