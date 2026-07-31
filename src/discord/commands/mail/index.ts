import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { fieldValue, silver } from 'src/discord/format';

function mailLine(mail: MailMessage) {
  const rewards: string[] = [];
  if (mail.silver) rewards.push(silver(mail.silver));
  if (mail.item) rewards.push(`${mail.itemStack ?? 1}x ${mail.item.name}`);

  const status = mail.claimed ? '✅' : '📩';
  const reward = rewards.length ? ` — ${rewards.join(', ')}` : '';
  return `${status} **${mail.sender}**: ${mail.content}${reward}`;
}

export const MailCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('mail').setDescription('Read your mailbox'),
    async execute({ interaction, discord }) {
      const mails = await discord.apiService.getMail({ discordId: interaction.user.id });
      const embed = new EmbedBuilder()
        .setColor(0x95a5a6)
        .setTitle('Mailbox')
        .setDescription(fieldValue(mails?.map(mailLine), 'Your mailbox is empty'))
        .setFooter({ text: 'Collect every reward with /mail-claim' });

      // Opening the mailbox marks it read, same as the web client.
      await discord.apiService.viewMail({ discordId: interaction.user.id }).catch(() => undefined);
      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder().setName('mail-claim').setDescription('Claim every reward in your mailbox'),
    async execute({ interaction, discord }) {
      await discord.apiService.claimMail({ discordId: interaction.user.id });
      await interaction.editReply('Claimed everything in your mailbox');
    },
  },
  {
    data: new SlashCommandBuilder().setName('mail-delete').setDescription('Delete your claimed mail'),
    async execute({ interaction, discord }) {
      await discord.apiService.deleteMail({ discordId: interaction.user.id });
      await interaction.editReply('Mailbox cleaned up');
    },
  },
];
