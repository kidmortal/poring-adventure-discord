/** Payload shared by every discord-scoped API event. */
declare type DiscordAction = {
  discordId: string;
};

declare type MarketCategory = 'all' | 'equipment' | 'consumable' | 'material';

declare type InventoryItem = {
  id: number;
  stack: number;
  userEmail: string;
  itemId: number;
  item: Item;
  quality: number;
  enhancement: number;
  equipped: boolean;
  locked: boolean;
  marketListing?: MarketListing;
};

/** Kept as an alias: the API returns equipped rows straight out of the inventory. */
declare type Equipment = InventoryItem;

declare type MarketListing = {
  id: number;
  price: number;
  stack: number;
  inventoryId: number;
  inventory?: InventoryItem;
  sellerEmail: string;
  seller?: { name: string };
};

declare type GameMap = {
  id: number;
  name: string;
  image: string;
  monster?: Monster[];
};

declare type Profession = {
  id: number;
  name: string;
  costume: string;
  attack: number;
  health: number;
  mana: number;
  str: number;
  agi: number;
  int: number;
  skills?: Skill[];
};

declare type GuildMember = {
  id: number;
  role: string;
  permissionLevel: number;
  contribution: number;
  guildTokens: number;
  userEmail: string;
  guildId?: number;
  user?: PoringUserProfile;
};

declare type GuildApplication = {
  id: number;
  userEmail: string;
  guildId: number;
  user?: PoringUserProfile;
};

declare type GuildBlessing = {
  id: number;
  guildId: number;
  health: number;
  mana: number;
  str: number;
  int: number;
  agi: number;
};

declare type GuildTask = {
  id: number;
  name: string;
  mapId: number;
  killCount: number;
  taskPoints: number;
  target?: GameMap;
};

declare type CurrentGuildTask = {
  id: number;
  guildId: number;
  taskId: number;
  currentKillCount: number;
  task?: GuildTask;
};

declare type Guild = {
  id: number;
  name: string;
  leaderEmail: string;
  imageUrl: string;
  level: number;
  experience: number;
  taskPoints: number;
  publicMessage: string;
  internalMessage: string;
  members?: GuildMember[];
  guildApplications?: GuildApplication[];
  currentGuildTask?: CurrentGuildTask;
  blessing?: GuildBlessing;
};

declare type MailMessage = {
  id: number;
  sender: string;
  content: string;
  claimed: boolean;
  silver?: number;
  itemId?: number;
  itemStack?: number;
  item?: Item;
  visualized: boolean;
  userEmail: string;
};

declare type RankedUser = {
  id: number;
  name: string;
  email: string;
  silver: number;
  stats?: Stats;
  appearance?: Appearance;
};
