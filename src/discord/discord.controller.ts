import { Controller, Get } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Get('/')
  registerSlashCommands() {
    return this.discordService.registerSlashCommands();
  }
}
