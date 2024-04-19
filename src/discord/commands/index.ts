import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { UtilityCommands } from './utility';

import { BattleCommands } from './battle';
import { DiscordService } from '../discord.service';

export type DiscordSlashCommand = {
  data: SlashCommandBuilder;
  execute: (args: { interaction: ChatInputCommandInteraction; discord: DiscordService }) => Promise<void>;
};

export function getSlashCommands(): DiscordSlashCommand[] {
  const commands: DiscordSlashCommand[] = [];
  commands.push(...UtilityCommands);
  commands.push(...BattleCommands);

  return commands;
}
