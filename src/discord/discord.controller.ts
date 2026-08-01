import { Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { AdminTokenGuard } from './admin.guard';

/**
 * Deploying commands is a manual step: Discord only learns about a new or
 * renamed command when the application command list is PUT to it.
 *
 * `guildId` defaults to `DISCORD_GUILD_ID`; pass it explicitly to target
 * another server, or pass `global=true` to deploy application-wide.
 */
@UseGuards(AdminTokenGuard)
@Controller('discord/commands')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  /** Read-only preview of what a deploy would send, including the permission policy. */
  @Get('/')
  listCommands() {
    return this.discordService.describeCommands();
  }

  @Post('/')
  registerSlashCommands(@Query('guildId') guildId?: string, @Query('global') global?: string) {
    return this.discordService.registerSlashCommands({ guildId, global: global === 'true' });
  }

  @Delete('/')
  removeSlashCommands(@Query('guildId') guildId?: string, @Query('global') global?: string) {
    return this.discordService.removeSlashCommands({ guildId, global: global === 'true' });
  }
}
