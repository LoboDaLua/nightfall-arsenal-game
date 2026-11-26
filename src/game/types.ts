export type GameScreenState =
  | 'title'
  | 'playing'
  | 'paused'
  | 'victory'
  | 'gameover';

export type MapId = 1 | 2 | 3 | 4 | 5;

export type DamageType = 'physical' | 'magic' | 'hybrid' | 'true';

export type WeaponId =
  | 'sword'
  | 'club'
  | 'chain'
  | 'fangs'
  | 'pistol'
  | 'sniper'
  | 'axe'
  | 'scythe'
  | 'shotgun'
  | 'crossbow'
  | 'flamethrower'
  | 'katana'
  | 'halberd'
  | 'chakram'
  | 'railgun'
  | 'grimoire'
  | 'minigun'
  | 'greatsword'
  | 'arcane_staff'
  | 'void_orb'
  | 'stormcaller_wand'
  | 'frostbrand'
  | 'cursed_censer'
  | 'runic_gauntlets'
  | 'starfire_bow';

export type WearableId =
  | 'sunfire_aegis'
  | 'thornmail'
  | 'spirit_visage'
  | 'force_of_nature'
  | 'frozen_heart'
  | 'banshees_veil'
  | 'jaksho'
  | 'iceborn_gauntlet';

export type EnemyKind =
  | 'zombie_sword'
  | 'zombie_club'
  | 'zombie_bomber'
  | 'cultist'
  | 'wisp_lantern'
  | 'bog_shaman'
  | 'skeleton'
  | 'skeleton_archer'
  | 'imp'
  | 'cinder_hound'
  | 'hell_warlock'
  | 'hell_knight'
  | 'spider'
  | 'spider_spitter'
  | 'magma_imp'
  | 'magma_slime'
  | 'magma_mite'
  | 'obsidian_sentinel'
  | 'ash_gargoyle'
  | 'wraith'
  | 'void_reaper'
  | 'plague_archon'
  | 'spectral_banshee'
  | 'plague_alchemist'
  | 'abyss_brute'
  | 'abyss_paladin'
  | 'robot_pistol'
  | 'robot_sniper'
  | 'robot_pyro'
  | 'robot_tesla'
  | 'boss_zombie'
  | 'boss_hellhound'
  | 'boss_golem'
  | 'boss_skeleton3'
  | 'boss_satan';

export type PickupKind =
  | 'potion'
  | 'boost_speed'
  | 'boost_rage'
  | 'boost_shield';

export type GenderOption = 'male' | 'female' | 'neuter';

export type ClothingStyle =
  | 'shadow_cloak'
  | 'hunter_coat'
  | 'iron_plate'
  | 'alchemist'
  | 'ronin_garb'
  | 'wasteland_jacket';

export interface CharacterCustomization {
  skinColor: string;
  gender: GenderOption;
  clothing: ClothingStyle;
}

export interface PlayerAppearanceSave {
  customization: CharacterCustomization;
}

export type UpgradeCategory = 'weapon' | 'character';

export type UpgradeNodeId =
  // Weapon Evolution Tree (offered on wave pedestals)
  | 'w_twin_arc'
  | 'w_ricochet'
  | 'w_explosive'
  | 'w_pierce'
  | 'w_elemental'
  | 'w_overclock'
  | 'w_siphon'
  | 'w_orbit'
  // Character Evolution Tree (offered on boss clear shrines)
  | 'c_awakening'
  | 'c_phantom_dash'
  | 'c_double_dash'
  | 'c_thorns'
  | 'c_aegis'
  | 'c_rush'
  | 'c_alchemist'
  | 'c_reaper';

export interface UpgradeNodeSpec {
  id: UpgradeNodeId;
  category: UpgradeCategory;
  name: string;
  desc: string;
  tier: 1 | 2 | 3;
  maxRank: number;
  requires: UpgradeNodeId[];
  accentHex: string;
}

export interface MapSpec {
  id: MapId;
  name: string;
  subtitle: string;
  waves: number;
  isBossOnly: boolean;
  bossKind: EnemyKind;
  bossName: string;
  skyHex: number;
  fogDensity: number;
  groundTint: number;
  accentHex: number;
  enemyHpMult: number;
  enemyDmgMult: number;
  enemySpeedMult: number;
}

export interface WeaponMoveSpec {
  name: string;
  cooldown: number;
  windup: number;
  active: number;
  recovery: number;
  damage: number;
  damageType: DamageType;
  range: number;
  arcRad: number;
  knockback: number;
}

export interface WeaponSpec {
  id: WeaponId;
  name: string;
  tier: 1 | 2 | 3 | 4;
  damageType: DamageType;
  roleHint: string;
  accentHex: string;
  accentInt: number;
  primary: WeaponMoveSpec;
  secondary: WeaponMoveSpec;
}

export interface WearableSpec {
  id: WearableId;
  name: string;
  shortDesc: string;
  passiveDesc: string;
  armorPct: number;
  mrPct: number;
  accentHex: string;
  accentInt: number;
}

export interface EnemyArchetypeSpec {
  kind: EnemyKind;
  name: string;
  maxHp: number;
  speed: number;
  radius: number;
  attackRange: number;
  attackDamage: number;
  damageType: DamageType;
  armor: number;
  magicResist: number;
  windupTime: number;
  cooldown: number;
  scoreValue: number;
  hasWeakPoint: boolean;
  isRanged: boolean;
  isBoss?: boolean;
}

export interface Vec2 {
  x: number;
  z: number;
}

export interface ActiveBoostsSnapshot {
  speedTimer: number;
  rageTimer: number;
  shieldTimer: number;
}

export type PedestalRewardItem =
  | { kind: 'weapon'; weaponId: WeaponId }
  | { kind: 'wearable'; wearableId: WearableId }
  | { kind: 'upgrade'; upgradeId: UpgradeNodeId };

export type WaveRewardState = 'none' | 'claiming' | 'ready' | 'portal_open';

export interface NearbyInteractableSnapshot {
  kind: 'pedestal' | 'chest' | 'shrine' | 'next_wave' | 'portal';
  title: string;
  subtitle: string;
  badge?: string;
  accentHex: string;
  actionLabel: string;
  swapWarning?: string;
}

export interface HudSnapshot {
  screen: GameScreenState;
  mapId: MapId;
  mapName: string;
  mapSubtitle: string;
  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;
  hotRemaining: number;
  potions: number;
  maxPotions: number;
  score: number;
  bestScore: number;
  noHitKills: number;
  noHitScoreMult: number;
  kills: number;
  wave: number;
  totalWavesInMap: number;
  waveKillsRemaining: number;
  isBossWave: boolean;
  bossName: string | null;
  bossHp: number;
  bossMaxHp: number;
  combo: number;
  weaponId: WeaponId;
  ownedWeapons: WeaponId[];
  wearableId: WearableId | null;
  armorPct: number;
  mrPct: number;
  bansheeShieldReady: boolean;
  jakshoStacks: number;
  fonStacks: number;
  spellbladeReady: boolean;
  activeUpgrades: Partial<Record<UpgradeNodeId, number>>;
  primaryCooldownRatio: number;
  secondaryCooldownRatio: number;
  dashCooldownRatio: number;
  dashCharges: number;
  maxDashCharges: number;
  isBlocking: boolean;
  boosts: ActiveBoostsSnapshot;
  rushStacks: number;
  elapsedSeconds: number;
  activeEnemyCount: number;
  bannerText: string | null;
  nearbyPrompt: NearbyInteractableSnapshot | null;
  waveRewardState: WaveRewardState;
  muted: boolean;
  touchControlsEnabled: boolean;
}
