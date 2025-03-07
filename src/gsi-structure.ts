export interface Dota2Data {
  provider: {
    name: string;
    appid: number;
    version: number;
    timestamp: number;
  };
  map: {
    name: string;
    matchid: string;
    game_time: number;
    clock_time: number;
    daytime: boolean;
    nightstalker_night: boolean;
    radiant_score: number;
    dire_score: number;
    game_state: string;
    paused: boolean;
    win_team: string;
    customgamename: string;
    ward_purchase_cooldown: number;
  };
  player: {
    steamid: string;
    accountid: string;
    name: string;
    activity: string;
    kills: number;
    deaths: number;
    assists: number;
    last_hits: number;
    denies: number;
    kill_streak: number;
    commands_issued: number;
    kill_list: Record<string, number>;
    team_name: string;
    player_slot: number;
    team_slot: number;
    gold: number;
    gold_reliable: number;
    gold_unreliable: number;
    gold_from_hero_kills: number;
    gold_from_creep_kills: number;
    gold_from_income: number;
    gold_from_shared: number;
    gpm: number;
    xpm: number;
  };
  hero: {
    facet: number;
    xpos: number;
    ypos: number;
    id: number;
    name: string;
    level: number;
    xp: number;
    alive: boolean;
    respawn_seconds: number;
    buyback_cost: number;
    buyback_cooldown: number;
    health: number;
    max_health: number;
    health_percent: number;
    mana: number;
    max_mana: number;
    mana_percent: number;
    silenced: boolean;
    stunned: boolean;
    disarmed: boolean;
    magicimmune: boolean;
    hexed: boolean;
    muted: boolean;
    break: boolean;
    aghanims_scepter: boolean;
    aghanims_shard: boolean;
    smoked: boolean;
    has_debuff: boolean;
    talent_1: boolean;
    talent_2: boolean;
    talent_3: boolean;
    talent_4: boolean;
    talent_5: boolean;
    talent_6: boolean;
    talent_7: boolean;
    talent_8: boolean;
    attributes_level: number;
  };
  abilities: Record<
    string,
    {
      name: string;
      level: number;
      can_cast: boolean;
      passive: boolean;
      ability_active: boolean;
      cooldown: number;
      ultimate: boolean;
    }
  >;
  items: {
    slot0: Item;
    slot1: Item;
    slot2: Item;
    slot3: Item;
    slot4: Item;
    slot5: Item;
    slot6: Item;
    slot7: Item;
    slot8: Item;
    stash0: Item;
    stash1: Item;
    stash2: Item;
    stash3: Item;
    stash4: Item;
    stash5: Item;
    teleport0: Item;
    neutral0: Item;
    neutral1: Item;
    preserved_neutral6: Item;
    preserved_neutral7: Item;
    preserved_neutral8: Item;
    preserved_neutral9: Item;
    preserved_neutral10: Item;
  };
  previously: any;
}

export interface Item {
  name: string;
  purchaser?: number;
  item_level?: number;
  can_cast?: boolean;
  cooldown?: number;
  passive?: boolean;
  item_charges?: number;
  charges?: number;
}
