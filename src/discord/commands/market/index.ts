import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '..';
import { fieldValue, silver } from 'src/discord/format';

const CATEGORIES: MarketCategory[] = ['all', 'equipment', 'consumable', 'material'];

export const MarketCommands: DiscordSlashCommand[] = [
  {
    data: new SlashCommandBuilder()
      .setName('market')
      .setDescription('Browse the market')
      .addIntegerOption((option) => option.setName('page').setDescription('Page number').setMinValue(1))
      .addStringOption((option) =>
        option
          .setName('category')
          .setDescription('Filter by category')
          .addChoices(...CATEGORIES.map((category) => ({ name: category, value: category }))),
      ),
    async execute({ interaction, discord }) {
      const page = interaction.options.getInteger('page') ?? 1;
      const category = (interaction.options.getString('category') as MarketCategory) ?? 'all';
      const listings = await discord.apiService.getMarketListings({ page, category });

      const lines = listings?.map((listing) => {
        const name = listing.inventory?.item?.name ?? 'Unknown item';
        return `\`#${listing.id}\` ${listing.stack}x ${name} — ${silver(listing.price)}`;
      });

      const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle(`Market — ${category} (page ${page})`)
        .setDescription(fieldValue(lines, 'Nothing for sale here'))
        .setFooter({ text: 'Buy with /market-buy <id>' });

      await interaction.editReply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('market-sell')
      .setDescription('List one of your items on the market')
      .addIntegerOption((option) =>
        option.setName('id').setDescription('Inventory id, shown by /inventory').setRequired(true),
      )
      .addIntegerOption((option) =>
        option.setName('price').setDescription('Price in silver').setRequired(true).setMinValue(1),
      )
      .addIntegerOption((option) => option.setName('stack').setDescription('How many to sell').setMinValue(1)),
    async execute({ interaction, discord }) {
      const inventoryId = interaction.options.getInteger('id');
      const price = interaction.options.getInteger('price');
      const stack = interaction.options.getInteger('stack') ?? 1;

      await discord.apiService.createMarketListing({ discordId: interaction.user.id, inventoryId, price, stack });
      await interaction.editReply(`Listed ${stack}x of item \`#${inventoryId}\` for ${silver(price)}`);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('market-buy')
      .setDescription('Buy a market listing')
      .addIntegerOption((option) =>
        option.setName('listing').setDescription('Listing id, shown by /market').setRequired(true),
      )
      .addIntegerOption((option) => option.setName('stack').setDescription('How many to buy').setMinValue(1)),
    async execute({ interaction, discord }) {
      const marketListingId = interaction.options.getInteger('listing');
      const stack = interaction.options.getInteger('stack') ?? 1;

      await discord.apiService.purchaseMarketListing({ discordId: interaction.user.id, marketListingId, stack });
      await interaction.editReply(`Bought ${stack}x from listing \`#${marketListingId}\``);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('market-remove')
      .setDescription('Take one of your listings down')
      .addIntegerOption((option) => option.setName('listing').setDescription('Listing id').setRequired(true)),
    async execute({ interaction, discord }) {
      const marketListingId = interaction.options.getInteger('listing');
      await discord.apiService.removeMarketListing({ discordId: interaction.user.id, marketListingId });
      await interaction.editReply(`Listing \`#${marketListingId}\` removed`);
    },
  },
];
