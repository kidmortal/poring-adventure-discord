import { SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';

export const UtilityCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong!'),
    async execute({ interaction }) {
      await interaction.reply('Pong!');
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('user')
      .setDescription('Provides information about the user.'),
    async execute({ interaction, api }) {
      // interaction.user is the object representing the User who ran the command
      // interaction.member is the GuildMember object, which represents the user in the specific guild
      const response = await api.getUserProfile({
        discordId: '210894526338826241',
      });
      await interaction.reply(
        `User Id ${interaction.user.id}, response: ${JSON.stringify(response)}`,
      );
    },
  },
];
