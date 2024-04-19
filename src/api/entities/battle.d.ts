declare type UserBattle = {
  users: PoringUserProfile[];
  monsters: Monster[];
  attackerTurn: number;
  attackerList: string[];
  battleFinished: boolean;
  userLost: boolean;
  log: Log[];
  drops: any[];
};
declare type Log = {
  icon: string;
  message: string;
};

declare type Monster = {
  id: number;
  name: string;
  image: string;
  level: number;
  boss: boolean;
  attack: number;
  health: number;
  silver: number;
  exp: number;
  mapId: number;
  drops: Drop[];
};

declare type Drop = {
  id: number;
  chance: number;
  minAmount: number;
  maxAmount: number;
  monsterId: number;
  itemId: number;
  item: Item;
};

declare type Item = {
  id: number;
  name: string;
  category: string;
  image: string;
  attack: any;
  str: any;
  agi: any;
  int: number;
  health: number;
  mana: number;
};
