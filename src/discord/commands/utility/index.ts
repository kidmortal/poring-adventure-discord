import { SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';

export const UtilityCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong!'),
    async execute({ interaction }) {
      const user = interaction.user;
      const url = interaction.user.avatarURL();
      await interaction.reply(
        JSON.stringify({ name: user.username, id: user.id, url }),
      );
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('register')
      .addStringOption((option) =>
        option
          .setName('token')
          .setDescription('Your integration token')
          .setRequired(true),
      )
      .setDescription('Sync discord user with Poring profile'),
    async execute({ interaction, api }) {
      const user = interaction.user;
      const token = interaction.options.getString('token');
      const url = interaction.user.avatarURL();
      const result = await api.registerDiscordProfile({
        name: user.username,
        id: user.id,
        url: url,
        token: token,
      });
      if (result) {
        await interaction.reply(
          `Account sync with profile ${result.name} character`,
        );
      } else {
        await interaction.reply('Failed to register');
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('user')
      .setDescription('Provides information about the user.'),
    async execute({ interaction, api }) {
      const response = await api.getUserProfile({
        discordId: interaction.user.id,
      });
      await interaction.reply(JSON.stringify(response));
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('inventory')
      .setDescription('Provides information about the user inventory.'),
    async execute({ interaction, api }) {
      let items = '';
      const response = await api.getUserInventory({
        discordId: interaction.user.id,
      });
      response.forEach((item) => {
        const stack = item?.stack;
        const name = item?.item?.name;
        items += `${stack}x ${name} `;
      });
      await interaction.reply(items);
    },
  },
];
