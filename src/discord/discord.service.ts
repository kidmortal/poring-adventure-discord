import { Injectable } from '@nestjs/common';
import {
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  UserContextMenuCommandInteraction,
} from 'discord.js';

import { DiscordSlashCommand, getSlashCommands } from './commands';
import { ApiError, ApiService } from 'src/api/api.service';
import { DiscordContextCommand, getContextCommands } from './context';
import { BATTLE_ATTACK_ID, BATTLE_FLEE_ID, BattleActions } from './components/BattleActions';
import { BattleEmbed } from './components/BattleEmbed';

@Injectable()
export class DiscordService {
  private onGoingBattles: { [key: string]: UserBattle } = {};
  discord = new Client({ intents: [GatewayIntentBits.Guilds] });
  private rest = new REST({ version: '10' }).setToken(process.env.DISCORD_API_TOKEN);
  constructor(readonly apiService: ApiService) {
    this.discord.login(process.env.DISCORD_API_TOKEN);
    this.discord.on('ready', () => {
      console.log(`Logged in as ${this.discord.user.tag}!`);
    });

    this.slashCommandListeners();
    this.interactionHandler();
  }

  async slashCommandListeners() {
    const contextCommands = getContextCommands();
    const slashCommands = getSlashCommands();
    this.discord.commands = new Collection();
    slashCommands.forEach((command) => {
      if (command.data && command.execute) {
        console.log(`Listening command ${command.data.name}`);
        this.discord.commands.set(command.data.name, command);
      }
    });
    contextCommands.forEach((command) => {
      if (command.data && command.execute) {
        console.log(`Listening context ${command.data.name}`);
        this.discord.commands.set(command.data.name, command);
      }
    });
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

  async registerSlashCommands() {
    const slashCommands = getSlashCommands();
    const contextCommands = getContextCommands();
    const commands = [...slashCommands, ...contextCommands]
      .filter((command) => command.data && command.execute)
      .map((command) => command.data.toJSON());

    const response = await this.rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, '746324655710797854'), {
      body: commands,
    });

    console.log(response);
    return true;
  }

  async removeSlashCommands() {
    const response = await this.rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, '746324655710797854'), {
      body: [],
    });

    await this.rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: [],
    });
    console.log(response);
    return true;
  }

  private async _handleContextCommand({ interaction }: { interaction: UserContextMenuCommandInteraction<CacheType> }) {
    const command: DiscordContextCommand = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
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
    const command: DiscordSlashCommand = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
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
    console.error(error);

    try {
      if (interaction.deferred) {
        await interaction.editReply({ content });
      } else if (interaction.replied) {
        await interaction.followUp({ content, ephemeral: true });
      } else {
        await interaction.reply({ content, ephemeral: true });
      }
    } catch (replyError) {
      console.error(replyError);
    }
  }
  private async _pushBattleToOnGoingBattle(args: { messageId: string; battle: UserBattle }) {
    const { messageId, battle } = args;

    if (messageId in this.onGoingBattles) {
      // Property already exists, update the value
      this.onGoingBattles[messageId] = battle;
    } else {
      // Property doesn't exist, create a new entry
      this.onGoingBattles[messageId] = battle;
    }
  }
}
