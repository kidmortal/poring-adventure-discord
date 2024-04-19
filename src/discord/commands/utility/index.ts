import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { ImageDrawerService } from 'src/utilities/imageDrawer';
import { CaptchaActions } from 'src/discord/components/CaptchaActions';

export const UtilityCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute({ interaction }) {
      const user = interaction.user;
      const url = interaction.user.avatarURL();
      await interaction.reply(JSON.stringify({ name: user.username, id: user.id, url }));
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('register')
      .addStringOption((option) => option.setName('token').setDescription('Your integration token').setRequired(true))
      .setDescription('Sync discord user with Poring profile'),
    async execute({ interaction, discord }) {
      const apiService = discord.apiService;
      const user = interaction.user;
      const token = interaction.options.getString('token');
      const url = interaction.user.avatarURL();
      const result = await apiService.registerDiscordProfile({
        name: user.username,
        id: user.id,
        url: url,
        token: token,
      });
      if (result) {
        await interaction.reply(`Account sync with profile ${result.name} character`);
      } else {
        await interaction.reply('Failed to register');
      }
    },
  },
  {
    data: new SlashCommandBuilder().setName('user').setDescription('Provides information about the user.'),
    async execute({ interaction, discord }) {
      const apiService = discord.apiService;
      const response = await apiService.getUserProfile({ discordId: interaction.user.id });
      const buffer = await ImageDrawerService.drawUserCharacter({ user: response });
      const attachment = new AttachmentBuilder(buffer);
      await interaction.reply({ files: [attachment], content: `Name: ${response.name} - Silver ${response.silver}` });
    },
  },
  {
    data: new SlashCommandBuilder().setName('captcha').setDescription('Shows a captcha image'),
    async execute({ interaction }) {
      const buffer = await ImageDrawerService.drawAmongus();
      const attachment = new AttachmentBuilder(buffer);
      await interaction.reply({
        files: [attachment],
        components: [CaptchaActions()],
        content: `Describe the captcha image`,
      });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('inventory')
      .setDescription('Provides information about the user inventory.'),
    async execute({ interaction, discord }) {
      const apiService = discord.apiService;
      let items = '';
      const response = await apiService.getUserInventory({
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
