import { ApplicationCommandType, ContextMenuCommandBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandRegistry } from './commandRegistry';
import { HIDE_FROM_EVERYONE } from './commandPermissions';
import { DiscordSlashCommand } from './commands';
import { DiscordContextCommand } from './context';

const noop = async () => undefined;

function slash(name: string, extra: Partial<DiscordSlashCommand> = {}): DiscordSlashCommand {
  return { data: new SlashCommandBuilder().setName(name).setDescription(name), execute: noop, ...extra };
}

function context(name: string, extra: Partial<DiscordContextCommand> = {}): DiscordContextCommand {
  return {
    data: new ContextMenuCommandBuilder().setName(name).setType(ApplicationCommandType.User),
    execute: noop,
    ...extra,
  };
}

describe('CommandRegistry', () => {
  it('rejects two slash commands sharing a name', () => {
    expect(() => new CommandRegistry({ slash: [slash('battle'), slash('battle')], context: [] })).toThrow(
      /Duplicate slash command name 'battle'/,
    );
  });

  it('rejects a name used by both a slash and a context command', () => {
    expect(() => new CommandRegistry({ slash: [slash('party')], context: [context('party')] })).toThrow(
      /used by both a slash and a context command/,
    );
  });

  it('rejects a command with no execute handler', () => {
    const broken = {
      data: new SlashCommandBuilder().setName('x').setDescription('x'),
    } as unknown as DiscordSlashCommand;
    expect(() => new CommandRegistry({ slash: [broken], context: [] })).toThrow(/has no execute handler/);
  });

  it('applies default member permissions to the payload', () => {
    const registry = new CommandRegistry({
      slash: [slash('captcha', { defaultMemberPermissions: HIDE_FROM_EVERYONE }), slash('battle')],
      context: [],
    });

    const [captcha, battle] = registry.toPayload({ global: true });
    expect(captcha.default_member_permissions).toBe('0');
    expect(battle.default_member_permissions).toBeUndefined();
  });

  it('only sends dm_permission on a global deploy', () => {
    const commands = { slash: [], context: [context('invite_party', { dmPermission: false })] };

    expect(new CommandRegistry(commands).toPayload({ global: true })[0].dm_permission).toBe(false);
    expect(new CommandRegistry(commands).toPayload({ global: false })[0].dm_permission).toBeUndefined();
  });

  it('describes descriptions and options so a deploy can be reviewed', () => {
    const withOption = new SlashCommandBuilder()
      .setName('hunt')
      .setDescription('Start a battle on a map')
      .addIntegerOption((option) => option.setName('map').setDescription('Map id').setRequired(true));

    const registry = new CommandRegistry({
      slash: [{ data: withOption, execute: noop }],
      context: [context('invite_party')],
    });

    const [hunt, invite] = registry.describe();
    expect(hunt).toMatchObject({
      name: 'hunt',
      type: 'slash',
      description: 'Start a battle on a map',
      options: [{ name: 'map', description: 'Map id', required: true }],
    });
    // Context menu entries are a label only — no description, no options.
    expect(invite).toMatchObject({ name: 'invite_party', type: 'context', options: [] });
  });

  it('builds the real command set without clashing', () => {
    const registry = new CommandRegistry();
    expect(registry.size).toBe(registry.slash.size + registry.context.size);
    expect(registry.toPayload({ global: false })).toHaveLength(registry.size);
  });
});
