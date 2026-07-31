import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { BattleEmbed } from 'src/discord/components/BattleEmbed';
import { BattleActions } from 'src/discord/components/BattleActions';
import { fieldValue } from 'src/discord/format';

export const BattleCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('battle').setDescription('Get your current battle'),
    async execute({ interaction, discord }) {
      const battle = await discord.apiService.getUserBattle({ discordId: interaction.user.id });
      if (!battle) {
        await interaction.editReply('You are not in a battle, start one with `/hunt`');
        return;
      }

      await interaction.editReply({ embeds: [BattleEmbed({ battle })], components: [BattleActions({ battle })] });
    },
  },
  {
    data: new SlashCommandBuilder().setName('maps').setDescription('List the maps you can hunt on'),
    async execute({ interaction, discord }) {
      const maps = await discord.apiService.getMaps();
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('Maps')
        .setDescription(
          fieldValue(
            maps?.map((map) => `\`#${map.id}\` ${map.name}`),
            'No maps available',
          ),
        )
        .setFooter({ text: 'Start hunting with /hunt <map>' });

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('hunt')
      .setDescription('Start a battle on a map')
      .addIntegerOption((option) =>
        option.setName('map').setDescription('Map id, shown by /maps').setRequired(true).setMinValue(1),
      ),
    async execute({ interaction, discord }) {
      const mapId = interaction.options.getInteger('map');
      const battle = await discord.apiService.createBattle({ discordId: interaction.user.id, mapId });
      if (!battle) {
        await interaction.editReply('Could not start a battle on that map');
        return;
      }

      await interaction.editReply({ embeds: [BattleEmbed({ battle })], components: [BattleActions({ battle })] });
    },
  },
  {
    data: new SlashCommandBuilder().setName('attack').setDescription('Attack on your current battle'),
    async execute({ interaction, discord }) {
      const battle = await discord.apiService.attack({ discordId: interaction.user.id });
      if (!battle) {
        await interaction.editReply('The battle is over');
        return;
      }

      await interaction.editReply({ embeds: [BattleEmbed({ battle })], components: [BattleActions({ battle })] });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('cast')
      .setDescription('Cast one of your equipped skills')
      .addIntegerOption((option) =>
        option.setName('skill').setDescription('Skill id, shown by /skills').setRequired(true),
      )
      .addStringOption((option) => option.setName('target').setDescription('Name of the target')),
    async execute({ interaction, discord }) {
      const skillId = interaction.options.getInteger('skill');
      const targetName = interaction.options.getString('target') ?? undefined;
      const battle = await discord.apiService.cast({ discordId: interaction.user.id, skillId, targetName });
      if (!battle) {
        await interaction.editReply('The battle is over');
        return;
      }

      await interaction.editReply({ embeds: [BattleEmbed({ battle })], components: [BattleActions({ battle })] });
    },
  },
  {
    data: new SlashCommandBuilder().setName('flee').setDescription('Abandon your current battle'),
    async execute({ interaction, discord }) {
      await discord.apiService.resetBattle({ discordId: interaction.user.id });
      await interaction.editReply('You fled from the battle');
    },
  },
];
