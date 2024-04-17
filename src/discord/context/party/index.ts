import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';
import { DiscordContextCommand } from '..';

export const PartyCommands: DiscordContextCommand[] = [
  {
    data: new ContextMenuCommandBuilder().setName('invite_party').setType(ApplicationCommandType.User),
    async execute({ interaction }) {
      const target = interaction.targetUser;

      await interaction.reply(`Inviting ${target.username} to party`);
    },
  },
];
