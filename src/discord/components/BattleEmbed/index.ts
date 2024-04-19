import { EmbedBuilder } from 'discord.js';

export function BattleEmbed(args: { battle: UserBattle }) {
  const embed = new EmbedBuilder().setColor(0x0099ff).setTitle('Battle').setTimestamp();

  args.battle.monsters?.forEach((monster) => {
    const { health } = monster;
    embed.addFields({ name: monster.name, value: `HP ${health}` });
  });

  args.battle.users?.forEach((user) => {
    const { health, maxHealth } = user.stats;
    embed.addFields({ name: user.name, value: `HP ${health}/${maxHealth}` });
  });
  const logs = args.battle.log.length > 0 ? args.battle.log?.map((l) => l.message).join('\n') : '\u200B';
  console.log(args.battle.log);
  embed.addFields({ name: 'Logs', value: logs });

  return embed;
}
