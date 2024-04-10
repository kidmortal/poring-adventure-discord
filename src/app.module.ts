import { Module } from '@nestjs/common';

import { DiscordModule } from './discord/discord.module';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';

@Module({
  imports: [ConfigModule.forRoot(), DiscordModule, ApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
