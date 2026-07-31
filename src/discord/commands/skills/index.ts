import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { fieldValue } from 'src/discord/format';

export const SkillCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('skills').setDescription('Show your skills'),
    async execute({ interaction, discord }) {
      const { learned, available } = await discord.apiService.getSkills({ discordId: interaction.user.id });
      const learnedIds = new Set(learned?.map((skill) => skill.skillId));

      const embed = new EmbedBuilder()
        .setColor(0x8e44ad)
        .setTitle('Skills')
        .addFields(
          {
            name: 'Learned',
            value: fieldValue(
              learned?.map(
                (skill) =>
                  `\`#${skill.skillId}\` ${skill.skill?.name} — mastery ${skill.masteryLevel}${skill.equipped ? ' *(equipped)*' : ''}`,
              ),
              'You have not learned any skill',
            ),
          },
          {
            name: 'Available to learn',
            value: fieldValue(
              available
                ?.filter((skill) => !learnedIds.has(skill.id))
                .map((skill) => `\`#${skill.id}\` ${skill.name} — level ${skill.requiredLevel}`),
              'Nothing left to learn',
            ),
          },
        )
        .setFooter({ text: 'Use the #id with /skill-learn, /skill-equip or /cast' });

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('skill-learn')
      .setDescription('Learn a skill')
      .addIntegerOption((option) =>
        option.setName('skill').setDescription('Skill id, shown by /skills').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const skillId = interaction.options.getInteger('skill');
      await discord.apiService.learnSkill({ discordId: interaction.user.id, skillId });
      await interaction.editReply(`Learned skill \`#${skillId}\``);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('skill-equip')
      .setDescription('Equip a learned skill')
      .addIntegerOption((option) =>
        option.setName('skill').setDescription('Skill id, shown by /skills').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const skillId = interaction.options.getInteger('skill');
      await discord.apiService.equipSkill({ discordId: interaction.user.id, skillId });
      await interaction.editReply(`Equipped skill \`#${skillId}\``);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('skill-unequip')
      .setDescription('Unequip a skill')
      .addIntegerOption((option) =>
        option.setName('skill').setDescription('Skill id, shown by /skills').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const skillId = interaction.options.getInteger('skill');
      await discord.apiService.unequipSkill({ discordId: interaction.user.id, skillId });
      await interaction.editReply(`Unequipped skill \`#${skillId}\``);
    },
  },
];
