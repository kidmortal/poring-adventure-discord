import { RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { DiscordContextCommand, getContextCommands } from './context';
import { DiscordSlashCommand, getSlashCommands } from './commands';

export type AnyDiscordCommand = DiscordSlashCommand | DiscordContextCommand;

export type CommandOptionSummary = {
  name: string;
  description: string;
  required: boolean;
};

export type CommandSummary = {
  name: string;
  type: 'slash' | 'context';
  /** Context menu entries have no description — they are just a label. */
  description: string | null;
  options: CommandOptionSummary[];
  /** Null when the command is available to every member. */
  defaultMemberPermissions: string | null;
  dmPermission: boolean;
};

/**
 * Collects the commands the bot serves and validates them once, so a mistake
 * surfaces at startup instead of as a command that silently never fires.
 *
 * Slash and context commands are kept apart: they share a namespace in Discord
 * but are dispatched by different handlers, so a name used by both would mean
 * one of them runs the wrong `execute`.
 */
export class CommandRegistry {
  readonly slash = new Map<string, DiscordSlashCommand>();
  readonly context = new Map<string, DiscordContextCommand>();

  constructor(args?: { slash?: DiscordSlashCommand[]; context?: DiscordContextCommand[] }) {
    const slash = args?.slash ?? getSlashCommands();
    const context = args?.context ?? getContextCommands();

    this._add(this.slash, slash, 'slash');
    this._add(this.context, context, 'context');

    const clash = [...this.slash.keys()].filter((name) => this.context.has(name));
    if (clash.length) {
      throw new Error(`Command name used by both a slash and a context command: ${clash.join(', ')}`);
    }
  }

  get size() {
    return this.slash.size + this.context.size;
  }

  all(): AnyDiscordCommand[] {
    return [...this.slash.values(), ...this.context.values()];
  }

  /**
   * Builds the REST payload. `dmPermission` is only meaningful for a global
   * deployment, so it is left off guild payloads to keep them minimal.
   *
   * The permissions are written onto the serialised command rather than back
   * onto the builder: command definitions are module level singletons, so
   * mutating them would leak one deployment's flags into the next.
   */
  toPayload(args: { global: boolean }): RESTPostAPIApplicationCommandsJSONBody[] {
    return this.all().map((command) => {
      const json = command.data.toJSON();

      if (command.defaultMemberPermissions !== undefined) {
        json.default_member_permissions = command.defaultMemberPermissions.toString();
      }
      if (args.global && command.dmPermission !== undefined) {
        json.dm_permission = command.dmPermission;
      }

      return json;
    });
  }

  /** Describes what a deploy would send, so it can be reviewed before pushing it. */
  describe(): CommandSummary[] {
    const summarise = (command: AnyDiscordCommand, type: CommandSummary['type']): CommandSummary => {
      const json = command.data.toJSON();
      const options = 'options' in json && json.options ? json.options : [];

      return {
        name: json.name,
        type,
        description: 'description' in json ? json.description : null,
        options: options.map((option) => ({
          name: option.name,
          description: option.description,
          required: 'required' in option ? !!option.required : false,
        })),
        defaultMemberPermissions:
          command.defaultMemberPermissions === undefined ? null : command.defaultMemberPermissions.toString(),
        dmPermission: command.dmPermission ?? true,
      };
    };

    return [
      ...[...this.slash.values()].map((command) => summarise(command, 'slash')),
      ...[...this.context.values()].map((command) => summarise(command, 'context')),
    ].sort((a, b) => a.name.localeCompare(b.name));
  }

  private _add<T extends AnyDiscordCommand>(target: Map<string, T>, commands: T[], kind: string) {
    commands.forEach((command) => {
      if (!command.data?.name) {
        throw new Error(`A ${kind} command is missing its builder data`);
      }
      if (typeof command.execute !== 'function') {
        throw new Error(`The ${kind} command '${command.data.name}' has no execute handler`);
      }
      if (target.has(command.data.name)) {
        throw new Error(`Duplicate ${kind} command name '${command.data.name}'`);
      }
      target.set(command.data.name, command);
    });
  }
}
