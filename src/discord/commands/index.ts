import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { UtilityCommands } from './utility';

import { BattleCommands } from './battle';
import { ProfileCommands } from './profile';
import { InventoryCommands } from './inventory';
import { GuildCommands } from './guild';
import { MarketCommands } from './market';
import { PartyCommands } from './party';
import { MailCommands } from './mail';
import { SkillCommands } from './skills';
import { DiscordService } from '../discord.service';

/** Adding an option drops the subcommand methods, so commands with options land on this shape. */
export type SlashCommandData = Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export type DiscordSlashCommand = {
  data: SlashCommandData;
  execute: (args: { interaction: ChatInputCommandInteraction; discord: DiscordService }) => Promise<void>;
};

/**
 * Interactions are deferred before `execute` runs, so every handler answers
 * with `interaction.editReply`.
 */
export function getSlashCommands(): DiscordSlashCommand[] {
  return [
    ...UtilityCommands,
    ...ProfileCommands,
    ...InventoryCommands,
    ...BattleCommands,
    ...SkillCommands,
    ...GuildCommands,
    ...PartyCommands,
    ...MarketCommands,
    ...MailCommands,
  ];
}
