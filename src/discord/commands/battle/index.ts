import { SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { BattleEmbed } from 'src/discord/components/BattleEmbed';
import { BattleActions } from 'src/discord/components/BattleActions';

export const BattleCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('battle').setDescription('Get your current battle'),
    async execute({ interaction, discord }) {
      const user = interaction.user;
      const apiService = discord.apiService;
      const battle = await apiService.getUserBattle({ discordId: user.id });
      if (battle) {
        const battleEmbed = BattleEmbed({ battle });
        const row = BattleActions({ battle });
        interaction.reply({ embeds: [battleEmbed], components: [row] });
      } else {
        interaction.reply(`no battle`);
      }
    },
  },
];
