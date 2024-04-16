import { Injectable } from '@nestjs/common';
import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
} from 'discord.js';

import { DiscordSlashCommand, getSlashCommands } from './commands';
import { ApiService } from 'src/api/api.service';

@Injectable()
export class DiscordService {
  discord = new Client({ intents: [GatewayIntentBits.Guilds] });
  private rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_API_TOKEN,
  );
  constructor(private readonly api: ApiService) {
    this.discord.login(process.env.DISCORD_API_TOKEN);
    this.discord.on('ready', () => {
      console.log(`Logged in as ${this.discord.user.tag}!`);
    });

    this.slashCommandListeners();
    this.interactionHandler();
  }

  async slashCommandListeners() {
    const slashCommands = getSlashCommands();
    this.discord.commands = new Collection();
    slashCommands.forEach((command) => {
      if (command.data && command.execute) {
        console.log(`Listening command ${command.data.name}`);
        this.discord.commands.set(command.data.name, command);
      }
    });
  }

  async interactionHandler() {
    this.discord.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command: DiscordSlashCommand = interaction.client.commands.get(
        interaction.commandName,
      );
      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`,
        );
        return;
      }

      try {
        await command.execute({ interaction, api: this.api });
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
    });
  }

  async registerSlashCommands() {
    const commands = [];
    const slashCommands = getSlashCommands();
    slashCommands.forEach((command) => {
      if (command.data && command.execute) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command is missing a required "data" or "execute" property.`,
        );
      }
    });
    const response = await this.rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        '746324655710797854',
      ),
      {
        body: commands,
      },
    );
    console.log(response);
    return true;
  }

  async removeSlashCommands() {
    const response = await this.rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        '746324655710797854',
      ),
      {
        body: [],
      },
    );

    await this.rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: [],
    });
    console.log(response);
    return true;
  }
}
