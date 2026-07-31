import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { ImageDrawerService } from 'src/utilities/imageDrawer';
import { fieldValue, healthBar, silver } from 'src/discord/format';

export const ProfileCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('profile').setDescription('Show your Poring character'),
    async execute({ interaction, discord }) {
      const user = await discord.apiService.getProfile({ discordId: interaction.user.id });
      if (!user) {
        await interaction.editReply('No profile found, use `/register` first');
        return;
      }

      const stats = user.stats;
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(user.name)
        .setDescription(`${user.profession?.name ?? 'Novice'} · ${silver(user.silver)}`)
        .addFields(
          { name: 'Level', value: `${stats?.level ?? 1} (${stats?.experience ?? 0} exp)`, inline: true },
          { name: 'Attack', value: `${stats?.attack ?? 0}`, inline: true },
          { name: '​', value: '​', inline: true },
          { name: 'Health', value: healthBar(stats?.health ?? 0, stats?.maxHealth ?? 0), inline: false },
          { name: 'Mana', value: healthBar(stats?.mana ?? 0, stats?.maxMana ?? 0), inline: false },
          { name: 'Str', value: `${stats?.str ?? 0}`, inline: true },
          { name: 'Agi', value: `${stats?.agi ?? 0}`, inline: true },
          { name: 'Int', value: `${stats?.int ?? 0}`, inline: true },
        );

      if (user.buffs?.length) {
        embed.addFields({
          name: 'Buffs',
          value: fieldValue(user.buffs.map((buff) => `${buff.buff?.name} (${buff.duration})`)),
        });
      }

      // The character sprite is a nice-to-have: a missing asset must not kill the reply.
      try {
        const buffer = await ImageDrawerService.drawUserCharacter({ user });
        await interaction.editReply({ embeds: [embed], files: [new AttachmentBuilder(buffer, { name: 'char.png' })] });
      } catch {
        await interaction.editReply({ embeds: [embed] });
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('rename')
      .setDescription('Change your character name')
      .addStringOption((option) => option.setName('name').setDescription('The new name').setRequired(true)),
    async execute({ interaction, discord }) {
      const newName = interaction.options.getString('name');
      await discord.apiService.updateName({ discordId: interaction.user.id, newName });
      await interaction.editReply(`Your character is now called **${newName}**`);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('ranking')
      .setDescription('Show the experience ranking')
      .addIntegerOption((option) => option.setName('page').setDescription('Page number').setMinValue(1)),
    async execute({ interaction, discord }) {
      const page = interaction.options.getInteger('page') ?? 1;
      const users = await discord.apiService.getRanking({ page });

      const lines = users?.map((user, index) => {
        const position = (page - 1) * 10 + index + 1;
        return `**${position}.** ${user.name} — level ${user.stats?.level ?? 1}`;
      });

      const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle(`Ranking — page ${page}`)
        .setDescription(fieldValue(lines, 'No players on this page'));

      await interaction.editReply({ embeds: [embed] });
    },
  },
];
