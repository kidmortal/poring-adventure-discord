import { EmbedBuilder } from 'discord.js';
import { fieldValue, healthBar } from 'src/discord/format';

export function BattleEmbed(args: { battle: UserBattle }) {
  const { battle } = args;
  const embed = new EmbedBuilder().setColor(0x0099ff).setTitle('Battle').setTimestamp();

  battle.monsters?.forEach((monster) => {
    embed.addFields({ name: monster.name, value: `HP ${monster.health}`, inline: true });
  });

  battle.users?.forEach((user) => {
    const { health, maxHealth, mana, maxMana } = user.stats ?? ({} as Stats);
    embed.addFields({
      name: user.name,
      value: `HP ${healthBar(health, maxHealth, 6)}\nMP ${mana ?? 0}/${maxMana ?? 0}`,
      inline: true,
    });
  });

  embed.addFields({
    name: 'Logs',
    value: fieldValue(
      battle.log?.map((log) => log.message),
      '​',
    ),
  });

  if (battle.battleFinished) {
    embed.setColor(battle.userLost ? 0xe74c3c : 0x2ecc71);
    embed.setFooter({ text: battle.userLost ? 'You were defeated' : 'Battle won' });
  }

  return embed;
}
