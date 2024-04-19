import { ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from 'discord.js';

import { ApiService } from 'src/api/api.service';
import { PartyCommands } from './party';
import { DiscordService } from '../discord.service';

export type DiscordContextCommand = {
  data: ContextMenuCommandBuilder;
  execute: (args: {
    interaction: UserContextMenuCommandInteraction;
    apiService: ApiService;
    discord: DiscordService;
  }) => Promise<void>;
};

export function getContextCommands(): DiscordContextCommand[] {
  const commands: DiscordContextCommand[] = [];
  commands.push(...PartyCommands);
  return commands;
}
