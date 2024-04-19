import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function CaptchaActions() {
  const option1 = new ButtonBuilder().setCustomId('amongus1').setLabel('amongus').setStyle(ButtonStyle.Secondary);
  const option2 = new ButtonBuilder().setCustomId('amongus2').setLabel('amongus').setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(option1, option2);
  return row;
}
