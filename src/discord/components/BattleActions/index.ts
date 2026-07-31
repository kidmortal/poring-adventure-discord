import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const BATTLE_ATTACK_ID = 'battle_attack';
export const BATTLE_FLEE_ID = 'battle_flee';

export function BattleActions(args: { battle: UserBattle }) {
  const finished = !!args.battle.battleFinished;

  const attack = new ButtonBuilder()
    .setCustomId(BATTLE_ATTACK_ID)
    .setLabel('Attack')
    .setStyle(ButtonStyle.Danger)
    .setDisabled(finished);

  const flee = new ButtonBuilder()
    .setCustomId(BATTLE_FLEE_ID)
    .setLabel(finished ? 'Close' : 'Flee')
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(attack, flee);
}
