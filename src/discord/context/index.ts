import { ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from 'discord.js';

import { ApiService } from 'src/api/api.service';
import { PartyContextCommands } from './party';
import { DiscordService } from '../discord.service';
import { CommandPermissions } from '../commandPermissions';

export type DiscordContextCommand = CommandPermissions & {
  data: ContextMenuCommandBuilder;
  execute: (args: {
    interaction: UserContextMenuCommandInteraction;
    apiService: ApiService;
    discord: DiscordService;
  }) => Promise<void>;
};

export function getContextCommands(): DiscordContextCommand[] {
  return [...PartyContextCommands];
}
