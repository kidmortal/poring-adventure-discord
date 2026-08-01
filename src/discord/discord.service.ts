import { Injectable, Logger } from '@nestjs/common';
import {
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  UserContextMenuCommandInteraction,
} from 'discord.js';

import { ApiError, ApiService } from 'src/api/api.service';
import { BATTLE_ATTACK_ID, BATTLE_FLEE_ID, BattleActions } from './components/BattleActions';
import { BattleEmbed } from './components/BattleEmbed';
import { CommandRegistry } from './commandRegistry';

/** Which deployment to touch. Omit both to use `DISCORD_GUILD_ID`. */
export type CommandScope = { guildId?: string; global?: boolean };

@Injectable()
export class DiscordService {
  discord = new Client({ intents: [GatewayIntentBits.Guilds] });
  /** Built eagerly so a duplicate or malformed command fails the boot, not a player's interaction. */
  private readonly registry = new CommandRegistry();
  private readonly logger = new Logger('DiscordService');
  private rest = new REST({ version: '10' }).setToken(process.env.DISCORD_API_TOKEN);

  constructor(readonly apiService: ApiService) {
    this.discord.login(process.env.DISCORD_API_TOKEN);
    this.discord.on('ready', () => {
      this.logger.log(`Logged in as ${this.discord.user.tag}`);
    });

    this.logger.log(`Serving ${this.registry.slash.size} slash and ${this.registry.context.size} context commands`);
    this.interactionHandler();
  }

  async interactionHandler() {
    this.discord.on('interactionCreate', async (interaction) => {
      if (interaction.isChatInputCommand()) this._handleSlashCommand({ interaction });
      if (interaction.isUserContextMenuCommand()) this._handleContextCommand({ interaction });
      if (interaction.isButton()) this._handleButton({ interaction });
    });
  }

  /** The battle message keeps its buttons live so a fight can be played without retyping commands. */
  private async _handleButton({ interaction }: { interaction: ButtonInteraction<CacheType> }) {
    const { customId } = interaction;
    if (customId !== BATTLE_ATTACK_ID && customId !== BATTLE_FLEE_ID) return;

    try {
      await interaction.deferUpdate();

      if (customId === BATTLE_FLEE_ID) {
        await this.apiService.resetBattle({ discordId: interaction.user.id });
        await interaction.editReply({ content: 'You left the battle', embeds: [], components: [] });
        return;
      }

      const battle = await this.apiService.attack({ discordId: interaction.user.id });
      if (!battle) {
        await interaction.editReply({ content: 'The battle is over', embeds: [], components: [] });
        return;
      }

      await interaction.editReply({ embeds: [BattleEmbed({ battle })], components: [BattleActions({ battle })] });
    } catch (error) {
      await this._replyWithError({ interaction, error });
    }
  }

  /** What the bot would deploy, without touching Discord. */
  describeCommands() {
    return { count: this.registry.size, commands: this.registry.describe() };
  }

  /**
   * Deploys to a guild when a guild id is available — those apply instantly,
   * which is what you want while iterating. A global deployment reaches every
   * server the bot is in but can take up to an hour to propagate.
   */
  async registerSlashCommands(args?: CommandScope) {
    const guildId = this._resolveGuildId(args);
    const body = this.registry.toPayload({ global: !guildId });
    const route = this._route({ guildId });

    await this.rest.put(route, { body });
    this.logger.log(`Registered ${body.length} commands ${guildId ? `to guild ${guildId}` : 'globally'}`);

    return {
      scope: guildId ? 'guild' : 'global',
      guildId: guildId ?? null,
      count: body.length,
      commands: this.registry.describe(),
    };
  }

  /** Clears one scope only — a guild deployment and the global one are separate lists. */
  async removeSlashCommands(args?: CommandScope) {
    const guildId = this._resolveGuildId(args);

    await this.rest.put(this._route({ guildId }), { body: [] });
    this.logger.log(`Removed all commands ${guildId ? `from guild ${guildId}` : 'globally'}`);

    return { scope: guildId ? 'guild' : 'global', guildId: guildId ?? null, count: 0 };
  }

  /** An explicit `global` beats the configured guild default; otherwise the guild wins. */
  private _resolveGuildId(args?: CommandScope) {
    if (args?.global) return undefined;
    return args?.guildId || process.env.DISCORD_GUILD_ID || undefined;
  }

  private _route(args: { guildId?: string }) {
    const clientId = process.env.CLIENT_ID;
    if (!clientId) {
      throw new Error('CLIENT_ID is not set, cannot manage slash commands');
    }
    return args.guildId
      ? Routes.applicationGuildCommands(clientId, args.guildId)
      : Routes.applicationCommands(clientId);
  }

  private async _handleContextCommand({ interaction }: { interaction: UserContextMenuCommandInteraction<CacheType> }) {
    const command = this.registry.context.get(interaction.commandName);
    if (!command) {
      this.logger.error(`No context command matching '${interaction.commandName}' was found`);
      return;
    }

    try {
      await interaction.deferReply();
      await command.execute({ interaction, apiService: this.apiService, discord: this });
    } catch (error) {
      await this._replyWithError({ interaction, error });
    }
  }

  private async _handleSlashCommand({ interaction }: { interaction: ChatInputCommandInteraction<CacheType> }) {
    const command = this.registry.slash.get(interaction.commandName);
    if (!command) {
      this.logger.error(`No slash command matching '${interaction.commandName}' was found`);
      return;
    }

    try {
      await interaction.deferReply();
      await command.execute({ interaction, discord: this });
    } catch (error) {
      await this._replyWithError({ interaction, error });
    }
  }

  /** API failures carry a player-facing reason, so show it instead of a generic message. */
  private async _replyWithError(args: {
    interaction:
      | ChatInputCommandInteraction<CacheType>
      | UserContextMenuCommandInteraction<CacheType>
      | ButtonInteraction<CacheType>;
    error: unknown;
  }) {
    const { interaction, error } = args;
    const content =
      error instanceof ApiError ? `❌ ${error.message}` : 'There was an error while executing this command!';
    this.logger.error(error);

    try {
      if (interaction.deferred) {
        await interaction.editReply({ content });
      } else if (interaction.replied) {
        await interaction.followUp({ content, ephemeral: true });
      } else {
        await interaction.reply({ content, ephemeral: true });
      }
    } catch (replyError) {
      this.logger.error(replyError);
    }
  }
}
