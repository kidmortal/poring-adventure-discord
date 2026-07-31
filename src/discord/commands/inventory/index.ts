import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { fieldValue, itemLabel } from 'src/discord/format';

export const InventoryCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder().setName('inventory').setDescription('Show the items you are carrying'),
    async execute({ interaction, discord }) {
      const inventory = await discord.apiService.getUserInventory({ discordId: interaction.user.id });
      const embed = new EmbedBuilder()
        .setColor(0x00b894)
        .setTitle('Inventory')
        .setDescription(fieldValue(inventory?.map(itemLabel), 'Your bag is empty'))
        .setFooter({ text: 'Use the #id with /equip, /use, /enhance or /market-sell' });

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder().setName('equipment').setDescription('Show the gear you are wearing'),
    async execute({ interaction, discord }) {
      const equipment = await discord.apiService.getEquipment({ discordId: interaction.user.id });
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('Equipment')
        .setDescription(fieldValue(equipment?.map(itemLabel), 'You are not wearing anything'));

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('equip')
      .setDescription('Equip an item from your inventory')
      .addIntegerOption((option) =>
        option.setName('id').setDescription('Inventory id, shown by /inventory').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const inventoryId = interaction.options.getInteger('id');
      await discord.apiService.equipItem({ discordId: interaction.user.id, inventoryId });
      await interaction.editReply(`Equipped item \`#${inventoryId}\``);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('unequip')
      .setDescription('Unequip an item')
      .addIntegerOption((option) =>
        option.setName('id').setDescription('Inventory id, shown by /equipment').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const inventoryId = interaction.options.getInteger('id');
      await discord.apiService.unequipItem({ discordId: interaction.user.id, inventoryId });
      await interaction.editReply(`Unequipped item \`#${inventoryId}\``);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('use')
      .setDescription('Consume an item')
      .addIntegerOption((option) =>
        option.setName('id').setDescription('Inventory id, shown by /inventory').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const inventoryId = interaction.options.getInteger('id');
      await discord.apiService.consumeItem({ discordId: interaction.user.id, inventoryId });
      await interaction.editReply(`Used item \`#${inventoryId}\``);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('enhance')
      .setDescription('Enhance an equipment')
      .addIntegerOption((option) =>
        option.setName('id').setDescription('Inventory id, shown by /inventory').setRequired(true),
      ),
    async execute({ interaction, discord }) {
      const inventoryId = interaction.options.getInteger('id');
      await discord.apiService.enhanceItem({ discordId: interaction.user.id, inventoryId });
      await interaction.editReply(`Enhanced item \`#${inventoryId}\``);
    },
  },
];
