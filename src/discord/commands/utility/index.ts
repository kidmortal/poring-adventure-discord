import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { ImageDrawerService } from 'src/utilities/imageDrawer';
import { CaptchaActions } from 'src/discord/components/CaptchaActions';

export const UtilityCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute({ interaction }) {
      await interaction.editReply('Pong!');
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('register')
      .addStringOption((option) => option.setName('token').setDescription('Your integration token').setRequired(true))
      .setDescription('Sync discord user with Poring profile'),
    async execute({ interaction, discord }) {
      const user = interaction.user;
      const result = await discord.apiService.registerDiscordProfile({
        name: user.username,
        id: user.id,
        url: user.avatarURL(),
        token: interaction.options.getString('token'),
      });

      if (result) {
        await interaction.editReply(`Account synced with the **${result.name}** character`);
      } else {
        await interaction.editReply('Failed to register — generate a fresh token in game and try again');
      }
    },
  },
  {
    data: new SlashCommandBuilder().setName('captcha').setDescription('Shows a captcha image'),
    async execute({ interaction }) {
      const buffer = await ImageDrawerService.drawAmongus();
      const attachment = new AttachmentBuilder(buffer);
      await interaction.editReply({
        files: [attachment],
        components: [CaptchaActions()],
        content: `Describe the captcha image`,
      });
    },
  },
];
