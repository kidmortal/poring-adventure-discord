import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';
import { DiscordContextCommand } from '..';

/** Both players are discord users, so the API resolves each side by discord id. */
export const PartyContextCommands: DiscordContextCommand[] = [
  {
    data: new ContextMenuCommandBuilder().setName('invite_party').setType(ApplicationCommandType.User),
    // Right-clicking another member only makes sense inside a server.
    dmPermission: false,
    async execute({ interaction, apiService }) {
      const target = interaction.targetUser;
      await apiService.inviteToParty({ discordId: interaction.user.id, invitedDiscordId: target.id });
      await interaction.editReply(`Invited ${target.username} to your party`);
    },
  },
  {
    data: new ContextMenuCommandBuilder().setName('kick_from_party').setType(ApplicationCommandType.User),
    dmPermission: false,
    async execute({ interaction, apiService }) {
      const target = interaction.targetUser;
      await apiService.kickFromParty({ discordId: interaction.user.id, kickedDiscordId: target.id });
      await interaction.editReply(`Kicked ${target.username} from your party`);
    },
  },
];
