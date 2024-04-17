import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { UtilityCommands } from './utility';
import { ApiService } from 'src/api/api.service';

export type DiscordSlashCommand = {
  data: SlashCommandBuilder;
  execute: (args: { interaction: ChatInputCommandInteraction; api: ApiService }) => Promise<void>;
};

export function getSlashCommands(): DiscordSlashCommand[] {
  const commands: DiscordSlashCommand[] = [];
  commands.push(...UtilityCommands);

  return commands;
}
