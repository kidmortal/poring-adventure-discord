import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { fieldValue } from 'src/discord/format';

export const GuildCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('guild').setDescription('Show your guild'),
    async execute({ interaction, discord }) {
      const guild = await discord.apiService.getGuild({ discordId: interaction.user.id });
      if (!guild) {
        await interaction.editReply('You are not in a guild, browse them with `/guilds`');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle(`${guild.name} — level ${guild.level}`)
        .setDescription(guild.publicMessage || '​')
        .setThumbnail(guild.imageUrl ?? null)
        .addFields(
          { name: 'Task points', value: `${guild.taskPoints ?? 0}`, inline: true },
          { name: 'Members', value: `${guild.members?.length ?? 0}`, inline: true },
        );

      if (guild.members?.length) {
        embed.addFields({
          name: 'Roster',
          value: fieldValue(
            guild.members.map(
              (member) => `${member.user?.name ?? member.userEmail} — ${member.role} (${member.contribution} pts)`,
            ),
          ),
        });
      }

      const currentTask = guild.currentGuildTask;
      if (currentTask?.task) {
        embed.addFields({
          name: 'Current task',
          value: `${currentTask.task.name} — ${currentTask.currentKillCount ?? 0}/${currentTask.task.killCount} kills`,
        });
      }

      if (guild.guildApplications?.length) {
        embed.addFields({
          name: 'Applications',
          value: fieldValue(guild.guildApplications.map((app) => `\`#${app.id}\` ${app.user?.name ?? app.userEmail}`)),
        });
      }

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder().setName('guilds').setDescription('List every guild'),
    async execute({ interaction, discord }) {
      const guilds = await discord.apiService.getAllGuilds();
      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle('Guilds')
        .setDescription(
          fieldValue(
            guilds?.map((guild) => `\`#${guild.id}\` ${guild.name} — level ${guild.level}`),
            'No guilds yet',
          ),
        )
        .setFooter({ text: 'Apply with /guild-apply <id>' });

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('guild-apply')
      .setDescription('Apply to a guild')
      .addIntegerOption((option) =>
        option.setName('guild').setDescription('Guild id, shown by /guilds').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const guildId = interaction.options.getInteger('guild');
      await discord.apiService.applyToGuild({ discordId: interaction.user.id, guildId });
      await interaction.editReply(`Applied to guild \`#${guildId}\``);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('guild-accept')
      .setDescription('Accept a pending guild application')
      .addIntegerOption((option) =>
        option.setName('application').setDescription('Application id, shown by /guild').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const applicationId = interaction.options.getInteger('application');
      await discord.apiService.acceptGuildApplication({ discordId: interaction.user.id, applicationId });
      await interaction.editReply(`Accepted application \`#${applicationId}\``);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('guild-refuse')
      .setDescription('Refuse a pending guild application')
      .addIntegerOption((option) =>
        option.setName('application').setDescription('Application id, shown by /guild').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const applicationId = interaction.options.getInteger('application');
      await discord.apiService.refuseGuildApplication({ discordId: interaction.user.id, applicationId });
      await interaction.editReply(`Refused application \`#${applicationId}\``);
    },
  },
  {
    data: new SlashCommandBuilder().setName('guild-quit').setDescription('Leave your guild'),
    async execute({ interaction, discord }) {
      await discord.apiService.quitGuild({ discordId: interaction.user.id });
      await interaction.editReply('You left your guild');
    },
  },
  {
    data: new SlashCommandBuilder().setName('guild-tasks').setDescription('List the guild tasks you can take'),
    async execute({ interaction, discord }) {
      const tasks = await discord.apiService.getGuildTasks();
      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle('Guild tasks')
        .setDescription(
          fieldValue(
            tasks?.map((task) => `\`#${task.id}\` ${task.name} — ${task.killCount} kills, ${task.taskPoints} pts`),
            'No tasks available',
          ),
        )
        .setFooter({ text: 'Accept with /guild-task-accept <id>' });

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('guild-task-accept')
      .setDescription('Accept a guild task')
      .addIntegerOption((option) =>
        option.setName('task').setDescription('Task id, shown by /guild-tasks').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const taskId = interaction.options.getInteger('task');
      await discord.apiService.acceptGuildTask({ discordId: interaction.user.id, taskId });
      await interaction.editReply(`Guild task \`#${taskId}\` accepted`);
    },
  },
  {
    data: new SlashCommandBuilder().setName('guild-task-finish').setDescription('Turn in your current guild task'),
    async execute({ interaction, discord }) {
      await discord.apiService.finishGuildTask({ discordId: interaction.user.id });
      await interaction.editReply('Guild task finished');
    },
  },
  {
    data: new SlashCommandBuilder().setName('guild-task-cancel').setDescription('Cancel your current guild task'),
    async execute({ interaction, discord }) {
      await discord.apiService.cancelGuildTask({ discordId: interaction.user.id });
      await interaction.editReply('Guild task cancelled');
    },
  },
];
