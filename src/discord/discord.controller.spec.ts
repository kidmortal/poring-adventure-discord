import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';

const discordService = {
  describeCommands: jest.fn(() => ({ count: 1, commands: [] })),
  registerSlashCommands: jest.fn(async (scope) => ({ scope, ok: true })),
  removeSlashCommands: jest.fn(async (scope) => ({ scope, ok: true })),
};

describe('DiscordController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DiscordController],
      providers: [{ provide: DiscordService, useValue: discordService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  describe('with no ADMIN_TOKEN configured', () => {
    beforeEach(() => delete process.env.ADMIN_TOKEN);

    it('refuses every request rather than defaulting to open', async () => {
      await request(app.getHttpServer()).get('/discord/commands').expect(403);
      await request(app.getHttpServer()).post('/discord/commands').expect(403);
      expect(discordService.registerSlashCommands).not.toHaveBeenCalled();
    });
  });

  describe('with a token configured', () => {
    beforeEach(() => (process.env.ADMIN_TOKEN = 'secret'));
    afterAll(() => delete process.env.ADMIN_TOKEN);

    it('rejects a missing or wrong token', async () => {
      await request(app.getHttpServer()).get('/discord/commands').expect(403);
      await request(app.getHttpServer()).get('/discord/commands?token=nope').expect(403);
    });

    it('accepts the token as a header or a query parameter', async () => {
      await request(app.getHttpServer()).get('/discord/commands?token=secret').expect(200);
      await request(app.getHttpServer()).get('/discord/commands').set('x-admin-token', 'secret').expect(200);
      expect(discordService.describeCommands).toHaveBeenCalledTimes(2);
    });

    it('passes the requested scope through to the service', async () => {
      await request(app.getHttpServer()).post('/discord/commands?token=secret&guildId=42').expect(201);
      expect(discordService.registerSlashCommands).toHaveBeenCalledWith({ guildId: '42', global: false });

      await request(app.getHttpServer()).post('/discord/commands?token=secret&global=true').expect(201);
      expect(discordService.registerSlashCommands).toHaveBeenLastCalledWith({ guildId: undefined, global: true });
    });

    it('clears commands on DELETE', async () => {
      await request(app.getHttpServer()).delete('/discord/commands?token=secret').expect(200);
      expect(discordService.removeSlashCommands).toHaveBeenCalledWith({ guildId: undefined, global: false });
    });
  });
});
