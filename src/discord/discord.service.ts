import { Injectable } from '@nestjs/common';
import {
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
import { ApiService } from 'src/api/api.service';
import { DiscordContextCommand, getContextCommands } from './context';

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
    });
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
      await command.execute({ interaction, apiService: this.apiService, discord: this });
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  }

  private async _handleSlashCommand({ interaction }: { interaction: ChatInputCommandInteraction<CacheType> }) {
    const command: DiscordSlashCommand = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute({ interaction, discord: this });
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
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
