import { ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from 'discord.js';

import { ApiService } from 'src/api/api.service';
import { PartyCommands } from './party';

export type DiscordContextCommand = {
  data: ContextMenuCommandBuilder;
  execute: (args: { interaction: UserContextMenuCommandInteraction; api: ApiService }) => Promise<void>;
};

export function getContextCommands(): DiscordContextCommand[] {
  const commands: DiscordContextCommand[] = [];
  commands.push(...PartyCommands);
  return commands;
}
