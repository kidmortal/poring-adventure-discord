import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { fieldValue, healthBar } from 'src/discord/format';

export const PartyCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('party').setDescription('Show your party'),
    async execute({ interaction, discord }) {
      const party = await discord.apiService.getParty({ discordId: interaction.user.id });
      if (!party) {
        await interaction.editReply('You are not in a party, create one with `/party-create`');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`Party #${party.id}`)
        .setDescription(`Leader: ${party.leaderEmail}`);

      if (party.members?.length) {
        embed.addFields({
          name: 'Members',
          value: fieldValue(
            party.members.map(
              (member) => `${member.name} — ${healthBar(member.stats?.health ?? 0, member.stats?.maxHealth ?? 0, 6)}`,
            ),
          ),
        });
      }

      if (party.chat?.length) {
        embed.addFields({ name: 'Chat', value: fieldValue(party.chat.slice(-10)) });
      }

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder().setName('party-create').setDescription('Create a party'),
    async execute({ interaction, discord }) {
      await discord.apiService.createParty({ discordId: interaction.user.id });
      await interaction.editReply('Party created');
    },
  },
  {
    data: new SlashCommandBuilder().setName('party-list').setDescription('List the parties open to join'),
    async execute({ interaction, discord }) {
      const parties = await discord.apiService.getOpenParties();
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('Open parties')
        .setDescription(
          fieldValue(
            parties?.filter(Boolean).map((party) => `\`#${party.id}\` ${party.members?.length ?? 0} members`),
            'No open parties',
          ),
        )
        .setFooter({ text: 'Join with /party-join <id>' });

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('party-join')
      .setDescription('Join an open party')
      .addIntegerOption((option) =>
        option.setName('party').setDescription('Party id, shown by /party-list').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const partyId = interaction.options.getInteger('party');
      await discord.apiService.joinParty({ discordId: interaction.user.id, partyId });
      await interaction.editReply(`Joined party \`#${partyId}\``);
    },
  },
  {
    data: new SlashCommandBuilder().setName('party-open').setDescription('Let anyone join your party'),
    async execute({ interaction, discord }) {
      await discord.apiService.openParty({ discordId: interaction.user.id });
      await interaction.editReply('Your party is now open');
    },
  },
  {
    data: new SlashCommandBuilder().setName('party-close').setDescription('Stop listing your party'),
    async execute({ interaction, discord }) {
      await discord.apiService.closeParty({ discordId: interaction.user.id });
      await interaction.editReply('Your party is now closed');
    },
  },
  {
    data: new SlashCommandBuilder().setName('party-quit').setDescription('Leave your party'),
    async execute({ interaction, discord }) {
      await discord.apiService.quitParty({ discordId: interaction.user.id });
      await interaction.editReply('You left the party');
    },
  },
  {
    data: new SlashCommandBuilder().setName('party-disband').setDescription('Disband the party you lead'),
    async execute({ interaction, discord }) {
      await discord.apiService.removeParty({ discordId: interaction.user.id });
      await interaction.editReply('Party disbanded');
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('party-say')
      .setDescription('Send a message to your party chat')
      .addStringOption((option) => option.setName('message').setDescription('What to say').setRequired(true)),
    async execute({ interaction, discord }) {
      const message = interaction.options.getString('message');
      await discord.apiService.sendPartyMessage({ discordId: interaction.user.id, message });
      await interaction.editReply(`Sent to party chat: ${message}`);
    },
  },
];
