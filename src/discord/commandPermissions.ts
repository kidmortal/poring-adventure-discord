/**
 * Permission metadata a command can declare. It is applied to the builder at
 * registration time rather than on each `data` definition, so the whole policy
 * is visible in one place.
 *
 * Note that a guild administrator can always override these in Server Settings,
 * and administrators can run any command regardless. They are a default, not a
 * security boundary — anything that truly must not run for a given player has
 * to be checked by the API.
 */
export type CommandPermissions = {
  /**
   * Discord permission bits a member needs to see and run the command.
   * `HIDE_FROM_EVERYONE` hides it from everyone except administrators.
   */
  defaultMemberPermissions?: bigint;

  /**
   * Whether the command may be used in DMs. Only has an effect on globally
   * registered commands — guild commands never show up in DMs anyway.
   */
  dmPermission?: boolean;
};

/** `setDefaultMemberPermissions(0)` is Discord's "administrators only" shorthand. */
export const HIDE_FROM_EVERYONE = 0n;
