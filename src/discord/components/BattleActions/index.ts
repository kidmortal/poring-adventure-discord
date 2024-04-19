import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function BattleActions(args: { battle: UserBattle }) {
  const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
  const attack = new ButtonBuilder().setCustomId('attack').setLabel('Attack').setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, attack);
  return row;
}
