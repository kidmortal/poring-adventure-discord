import { Injectable, Logger } from '@nestjs/common';
import { io } from 'socket.io-client';
import { createHash } from 'crypto';

/** The API never acks a failed event, so a request that errors would hang forever. */
const REQUEST_TIMEOUT_MS = 10000;

export class ApiError extends Error {}

@Injectable()
export class ApiService {
  private socket = io(process.env.WEBSOCKET_API_URL, {
    auth: { accessToken: createHash('md5').update(process.env.DISCORD_API_TOKEN).digest('hex') },
  });
  private logger = new Logger('ApiService');

  constructor() {
    this.socket.on('connect', () => this.logger.log('Connected to Poring API'));
    this.socket.on('disconnect', () => this.logger.warn('Disconnected from Poring API'));
    this.socket.on('connect_error', (error) => this.logger.error(`Connection error: ${error?.message}`));
  }

  // ---------------------------------------------------------------- account

  registerDiscordProfile(args: RegisterDiscordProfileDto) {
    return this.request<PoringUserProfile | false>('register_discord_profile', args);
  }

  getUserProfile(args: GetDiscordUserDto) {
    return this.request<PoringUserProfile>('get_discord_user', args);
  }

  // ---------------------------------------------------------------- profile

  getProfile(args: DiscordAction) {
    return this.request<PoringUserProfile>('discord_get_profile', args);
  }

  updateName(args: DiscordAction & { newName: string }) {
    return this.request<unknown>('discord_update_name', args);
  }

  getRanking(args: { page: number }) {
    return this.request<RankedUser[]>('discord_get_ranking', args);
  }

  // -------------------------------------------------------------- inventory

  getUserInventory(args: DiscordAction) {
    return this.request<InventoryItem[]>('discord_get_inventory', args);
  }

  getEquipment(args: DiscordAction) {
    return this.request<InventoryItem[]>('discord_get_equipment', args);
  }

  equipItem(args: DiscordAction & { inventoryId: number }) {
    return this.request<unknown>('discord_equip_item', args);
  }

  unequipItem(args: DiscordAction & { inventoryId: number }) {
    return this.request<unknown>('discord_unequip_item', args);
  }

  consumeItem(args: DiscordAction & { inventoryId: number }) {
    return this.request<unknown>('discord_consume_item', args);
  }

  enhanceItem(args: DiscordAction & { inventoryId: number }) {
    return this.request<unknown>('discord_enhance_item', args);
  }

  // ----------------------------------------------------------------- battle

  getUserBattle(args: GetDiscordBattleDto) {
    return this.request<UserBattle | false>('get_discord_battle', args);
  }

  createBattle(args: DiscordAction & { mapId: number }) {
    return this.request<UserBattle | false>('discord_battle_create', args);
  }

  attack(args: DiscordAction) {
    return this.request<UserBattle | false>('discord_battle_attack', args);
  }

  cast(args: DiscordAction & { skillId: number; targetName?: string }) {
    return this.request<UserBattle | false>('discord_battle_cast', args);
  }

  resetBattle(args: DiscordAction) {
    return this.request<unknown>('discord_battle_reset', args);
  }

  getMaps() {
    return this.request<GameMap[]>('discord_get_maps', {});
  }

  getMapMonsters(args: { mapId: number }) {
    return this.request<Monster>('discord_get_map_monsters', args);
  }

  // ------------------------------------------------------------------ guild

  getGuild(args: DiscordAction) {
    return this.request<Guild | null>('discord_get_guild', args);
  }

  getAllGuilds() {
    return this.request<Guild[]>('discord_get_all_guilds', {});
  }

  applyToGuild(args: DiscordAction & { guildId: number }) {
    return this.request<unknown>('discord_apply_to_guild', args);
  }

  acceptGuildApplication(args: DiscordAction & { applicationId: number }) {
    return this.request<unknown>('discord_accept_guild_application', args);
  }

  refuseGuildApplication(args: DiscordAction & { applicationId: number }) {
    return this.request<unknown>('discord_refuse_guild_application', args);
  }

  quitGuild(args: DiscordAction) {
    return this.request<unknown>('discord_quit_guild', args);
  }

  getGuildTasks() {
    return this.request<GuildTask[]>('discord_get_guild_tasks', {});
  }

  acceptGuildTask(args: DiscordAction & { taskId: number }) {
    return this.request<unknown>('discord_accept_guild_task', args);
  }

  cancelGuildTask(args: DiscordAction) {
    return this.request<unknown>('discord_cancel_guild_task', args);
  }

  finishGuildTask(args: DiscordAction) {
    return this.request<unknown>('discord_finish_guild_task', args);
  }

  // ----------------------------------------------------------------- market

  getMarketListings(args: { page: number; category: MarketCategory }) {
    return this.request<MarketListing[]>('discord_get_market', args);
  }

  createMarketListing(args: DiscordAction & { inventoryId: number; price: number; stack: number }) {
    return this.request<unknown>('discord_create_market_listing', args);
  }

  purchaseMarketListing(args: DiscordAction & { marketListingId: number; stack: number }) {
    return this.request<unknown>('discord_purchase_market_listing', args);
  }

  removeMarketListing(args: DiscordAction & { marketListingId: number }) {
    return this.request<unknown>('discord_remove_market_listing', args);
  }

  // ------------------------------------------------------------------ party

  getParty(args: DiscordAction) {
    return this.request<Party | null>('discord_get_party', args);
  }

  createParty(args: DiscordAction) {
    return this.request<unknown>('discord_create_party', args);
  }

  getOpenParties() {
    return this.request<Party[]>('discord_get_open_parties', {});
  }

  openParty(args: DiscordAction) {
    return this.request<unknown>('discord_open_party', args);
  }

  closeParty(args: DiscordAction) {
    return this.request<unknown>('discord_close_party', args);
  }

  joinParty(args: DiscordAction & { partyId: number }) {
    return this.request<unknown>('discord_join_party', args);
  }

  quitParty(args: DiscordAction) {
    return this.request<unknown>('discord_quit_party', args);
  }

  removeParty(args: DiscordAction) {
    return this.request<unknown>('discord_remove_party', args);
  }

  inviteToParty(args: DiscordAction & { invitedDiscordId: string }) {
    return this.request<unknown>('discord_invite_to_party', args);
  }

  kickFromParty(args: DiscordAction & { kickedDiscordId: string }) {
    return this.request<unknown>('discord_kick_from_party', args);
  }

  sendPartyMessage(args: DiscordAction & { message: string }) {
    return this.request<unknown>('discord_send_party_message', args);
  }

  // ------------------------------------------------------------------- mail

  getMail(args: DiscordAction) {
    return this.request<MailMessage[]>('discord_get_mail', args);
  }

  claimMail(args: DiscordAction) {
    return this.request<unknown>('discord_claim_mail', args);
  }

  viewMail(args: DiscordAction) {
    return this.request<unknown>('discord_view_mail', args);
  }

  deleteMail(args: DiscordAction) {
    return this.request<unknown>('discord_delete_mail', args);
  }

  // ----------------------------------------------------------------- skills

  getSkills(args: DiscordAction) {
    return this.request<{ learned: LearnedSkill[]; available: Skill[] }>('discord_get_skills', args);
  }

  learnSkill(args: DiscordAction & { skillId: number }) {
    return this.request<unknown>('discord_learn_skill', args);
  }

  equipSkill(args: DiscordAction & { skillId: number }) {
    return this.request<unknown>('discord_equip_skill', args);
  }

  unequipSkill(args: DiscordAction & { skillId: number }) {
    return this.request<unknown>('discord_unequip_skill', args);
  }

  // ---------------------------------------------------------------- helpers

  /**
   * A failed event never acks — the API reports it as an `error_notification`
   * broadcast instead. We listen for one alongside the ack so the caller gets
   * the real reason rather than a timeout. Those notifications carry no request
   * id, so with concurrent in-flight calls one can be blamed on the wrong caller.
   */
  private request<T>(event: string, args: object): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let settled = false;

      const finish = () => {
        settled = true;
        clearTimeout(timer);
        this.socket.off('error_notification', onError);
      };

      const onError = (message: string) => {
        if (settled) return;
        finish();
        this.logger.warn(`${event} failed: ${message}`);
        reject(new ApiError(message));
      };

      const timer = setTimeout(() => {
        if (settled) return;
        finish();
        reject(new ApiError(`The game server did not answer '${event}' in time`));
      }, REQUEST_TIMEOUT_MS);

      this.socket.once('error_notification', onError);
      this.socket.emit(event, args, (response: T) => {
        if (settled) return;
        finish();
        resolve(response);
      });
    });
  }
}
