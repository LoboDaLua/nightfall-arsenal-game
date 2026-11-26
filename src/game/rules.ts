import type {
  CharacterCustomization,
  ClothingStyle,
  DamageType,
  EnemyArchetypeSpec,
  EnemyKind,
  MapId,
  MapSpec,
  PedestalRewardItem,
  PickupKind,
  UpgradeNodeId,
  UpgradeNodeSpec,
  Vec2,
  WeaponId,
  WeaponSpec,
  WearableId,
  WearableSpec,
} from './types';

export const ARENA_RADIUS = 21.5;
export const PLAYER_RADIUS = 0.65;
export const BASE_PLAYER_MAX_HP = 80;
export const BASE_PLAYER_MOVE_SPEED = 8.2;
export const PLAYER_DASH_SPEED = 22.0;
export const PLAYER_DASH_DURATION = 0.16;
export const BASE_PLAYER_DASH_COOLDOWN = 1.84;
export const PLAYER_INCOMING_DAMAGE_MULT = 1.5;
export const BASE_POTION_HEAL_TOTAL = 45;
export const BASE_POTION_DURATION = 6.0;
export const MAX_ATTACK_TOKENS = 8;
export const MAX_EQUIPPED_WEAPONS = 3;
export const PLAYER_RESIST_CAP = 0.45;
export const ENEMY_HEALTHBAR_VISIBLE_SECONDS = 3.5;

export const SKIN_PALETTE: { id: string; name: string; hex: string }[] = [
  { id: 'ivory', name: 'Moon Ivory', hex: '#f1d2bd' },
  { id: 'peach', name: 'Warm Sand', hex: '#e0b08d' },
  { id: 'olive', name: 'Olive Dusk', hex: '#b58763' },
  { id: 'chestnut', name: 'Chestnut', hex: '#86583c' },
  { id: 'umber', name: 'Deep Umber', hex: '#523426' },
  { id: 'ash', name: 'Spectral Ash', hex: '#9aa7b8' },
];

export const CLOTHING_OPTIONS: {
  id: ClothingStyle;
  name: string;
  primaryHex: number;
  secondaryHex: number;
  trimHex: number;
}[] = [
  { id: 'shadow_cloak', name: 'Shadow Cloak', primaryHex: 0x26354d, secondaryHex: 0x1a2233, trimHex: 0x64748b },
  { id: 'hunter_coat', name: 'Night Hunter', primaryHex: 0x3b2621, secondaryHex: 0x241714, trimHex: 0xb45309 },
  { id: 'iron_plate', name: 'Iron Paladin', primaryHex: 0x64748b, secondaryHex: 0x334155, trimHex: 0xe2e8f0 },
  { id: 'alchemist', name: 'Plague Alchemist', primaryHex: 0x1e3a32, secondaryHex: 0x142620, trimHex: 0x4ade80 },
  { id: 'ronin_garb', name: 'Moonlit Ronin', primaryHex: 0x451a2b, secondaryHex: 0x261019, trimHex: 0xf43f5e },
  { id: 'wasteland_jacket', name: 'Scrap Jacket', primaryHex: 0x4d4129, secondaryHex: 0x292316, trimHex: 0xfacc15 },
];

export const MAPS: Record<MapId, MapSpec> = {
  1: {
    id: 1,
    name: 'The Astral Rift',
    subtitle: 'Opening the Portal',
    waves: 5,
    isBossOnly: false,
    bossKind: 'boss_zombie',
    bossName: 'Goliath Rotjaw',
    skyHex: 0x070a18,
    fogDensity: 0.022,
    groundTint: 0xffffff,
    accentHex: 0x8b5cf6,
    enemyHpMult: 1.05,
    enemyDmgMult: 1.15,
    enemySpeedMult: 1.04,
  },
  2: {
    id: 2,
    name: 'Gates of Hell',
    subtitle: 'Threshold of Brimstone',
    waves: 5,
    isBossOnly: false,
    bossKind: 'boss_hellhound',
    bossName: 'Cerberus, Gate Hound',
    skyHex: 0x180909,
    fogDensity: 0.024,
    groundTint: 0xd99b82,
    accentHex: 0xf97316,
    enemyHpMult: 1.42,
    enemyDmgMult: 1.38,
    enemySpeedMult: 1.12,
  },
  3: {
    id: 3,
    name: 'Molten Island',
    subtitle: 'Ringed by Magma',
    waves: 5,
    isBossOnly: false,
    bossKind: 'boss_golem',
    bossName: 'Ignis Lava Colossus',
    skyHex: 0x1e0b06,
    fogDensity: 0.021,
    groundTint: 0xc27a66,
    accentHex: 0xff5500,
    enemyHpMult: 1.82,
    enemyDmgMult: 1.62,
    enemySpeedMult: 1.2,
  },
  4: {
    id: 4,
    name: 'The Quiet Abyss',
    subtitle: 'Green Fire & Silent Ash',
    waves: 5,
    isBossOnly: false,
    bossKind: 'boss_skeleton3',
    bossName: 'Tri-Skull Sovereign',
    skyHex: 0x04120c,
    fogDensity: 0.026,
    groundTint: 0x6ea68a,
    accentHex: 0x22c55e,
    enemyHpMult: 2.25,
    enemyDmgMult: 1.88,
    enemySpeedMult: 1.28,
  },
  5: {
    id: 5,
    name: 'Throne of the Fallen',
    subtitle: 'Face Satan Himself',
    waves: 1,
    isBossOnly: true,
    bossKind: 'boss_satan',
    bossName: 'Satan, Lord of the Abyss',
    skyHex: 0x120306,
    fogDensity: 0.019,
    groundTint: 0xa66571,
    accentHex: 0xe11d48,
    enemyHpMult: 2.6,
    enemyDmgMult: 2.05,
    enemySpeedMult: 1.32,
  },
};

export const WEAPONS: Record<WeaponId, WeaponSpec> = {
  // === 18 Updated Existing Weapons ===
  sword: {
    id: 'sword',
    name: 'Iron Sword',
    tier: 1,
    damageType: 'physical',
    roleHint: 'Physical · Balanced Slash & Thrust',
    accentHex: '#7dd3fc',
    accentInt: 0x7dd3fc,
    primary: {
      name: 'Slash',
      cooldown: 0.72,
      windup: 0.06,
      active: 0.12,
      recovery: 0.1,
      damage: 25,
      damageType: 'physical',
      range: 3.0,
      arcRad: Math.PI * 0.82,
      knockback: 5.0,
    },
    secondary: {
      name: 'Thrust',
      cooldown: 1.52,
      windup: 0.08,
      active: 0.15,
      recovery: 0.14,
      damage: 38,
      damageType: 'physical',
      range: 4.1,
      arcRad: Math.PI * 0.28,
      knockback: 7.5,
    },
  },
  club: {
    id: 'club',
    name: 'Spiked Club',
    tier: 1,
    damageType: 'physical',
    roleHint: 'Physical · Heavy Smash & Guard',
    accentHex: '#f59e0b',
    accentInt: 0xf59e0b,
    primary: {
      name: 'Smash',
      cooldown: 1.08,
      windup: 0.1,
      active: 0.14,
      recovery: 0.15,
      damage: 46,
      damageType: 'physical',
      range: 3.3,
      arcRad: Math.PI * 0.9,
      knockback: 12.5,
    },
    secondary: {
      name: 'Guard Bash',
      cooldown: 1.9,
      windup: 0.02,
      active: 1.05,
      recovery: 0.08,
      damage: 20,
      damageType: 'physical',
      range: 2.3,
      arcRad: Math.PI,
      knockback: 9.5,
    },
  },
  fangs: {
    id: 'fangs',
    name: 'Spider Fangs',
    tier: 1,
    damageType: 'hybrid',
    roleHint: 'Hybrid · Physical Bite & Magic Venom',
    accentHex: '#4ade80',
    accentInt: 0x4ade80,
    primary: {
      name: 'Venom Bite',
      cooldown: 0.56,
      windup: 0.04,
      active: 0.1,
      recovery: 0.07,
      damage: 23,
      damageType: 'physical',
      range: 2.75,
      arcRad: Math.PI * 0.7,
      knockback: 3.5,
    },
    secondary: {
      name: 'Fang Toss',
      cooldown: 1.2,
      windup: 0.06,
      active: 0.1,
      recovery: 0.1,
      damage: 30,
      damageType: 'magic',
      range: 13.5,
      arcRad: 0.2,
      knockback: 4.5,
    },
  },
  pistol: {
    id: 'pistol',
    name: 'Flint Pistol',
    tier: 1,
    damageType: 'physical',
    roleHint: 'Physical · Crisp Shots & Barrage',
    accentHex: '#facc15',
    accentInt: 0xfacc15,
    primary: {
      name: 'Shot',
      cooldown: 0.52,
      windup: 0.03,
      active: 0.06,
      recovery: 0.06,
      damage: 29,
      damageType: 'physical',
      range: 18.0,
      arcRad: 0.1,
      knockback: 4.0,
    },
    secondary: {
      name: 'Barrage',
      cooldown: 2.0,
      windup: 0.06,
      active: 0.14,
      recovery: 0.14,
      damage: 19,
      damageType: 'physical',
      range: 15.0,
      arcRad: 0.48,
      knockback: 5.5,
    },
  },
  chain: {
    id: 'chain',
    name: 'Chain Blade',
    tier: 1,
    damageType: 'physical',
    roleHint: 'Physical · 360° Spin & Lash',
    accentHex: '#e2e8f0',
    accentInt: 0xe2e8f0,
    primary: {
      name: 'Spin Cut',
      cooldown: 1.0,
      windup: 0.07,
      active: 0.18,
      recovery: 0.11,
      damage: 33,
      damageType: 'physical',
      range: 4.3,
      arcRad: Math.PI * 2,
      knockback: 7.5,
    },
    secondary: {
      name: 'Frontal Lash',
      cooldown: 1.48,
      windup: 0.08,
      active: 0.16,
      recovery: 0.13,
      damage: 48,
      damageType: 'physical',
      range: 7.5,
      arcRad: Math.PI * 0.22,
      knockback: 6.5,
    },
  },
  axe: {
    id: 'axe',
    name: 'Battleaxe',
    tier: 2,
    damageType: 'physical',
    roleHint: 'Physical · Cleave & Whirlwind',
    accentHex: '#fb923c',
    accentInt: 0xfb923c,
    primary: {
      name: 'Cleave',
      cooldown: 1.08,
      windup: 0.09,
      active: 0.14,
      recovery: 0.14,
      damage: 54,
      damageType: 'physical',
      range: 3.6,
      arcRad: Math.PI * 0.95,
      knockback: 10.5,
    },
    secondary: {
      name: 'Whirlwind',
      cooldown: 2.04,
      windup: 0.07,
      active: 0.24,
      recovery: 0.12,
      damage: 44,
      damageType: 'physical',
      range: 4.2,
      arcRad: Math.PI * 2,
      knockback: 11.0,
    },
  },
  crossbow: {
    id: 'crossbow',
    name: 'Crossbow',
    tier: 2,
    damageType: 'physical',
    roleHint: 'Physical · Piercing & Blast Bolt',
    accentHex: '#a78bfa',
    accentInt: 0xa78bfa,
    primary: {
      name: 'Bolt',
      cooldown: 0.72,
      windup: 0.04,
      active: 0.06,
      recovery: 0.08,
      damage: 42,
      damageType: 'physical',
      range: 20.0,
      arcRad: 0.1,
      knockback: 5.5,
    },
    secondary: {
      name: 'Blast Bolt',
      cooldown: 2.1,
      windup: 0.07,
      active: 0.08,
      recovery: 0.14,
      damage: 62,
      damageType: 'physical',
      range: 18.0,
      arcRad: 0.15,
      knockback: 10.0,
    },
  },
  shotgun: {
    id: 'shotgun',
    name: 'Shotgun',
    tier: 2,
    damageType: 'physical',
    roleHint: 'Physical · Buckshot Spread & Slug',
    accentHex: '#fb7185',
    accentInt: 0xfb7185,
    primary: {
      name: 'Buckshot',
      cooldown: 1.16,
      windup: 0.04,
      active: 0.08,
      recovery: 0.13,
      damage: 18,
      damageType: 'physical',
      range: 11.5,
      arcRad: 0.55,
      knockback: 8.5,
    },
    secondary: {
      name: 'Heavy Slug',
      cooldown: 1.96,
      windup: 0.06,
      active: 0.08,
      recovery: 0.16,
      damage: 72,
      damageType: 'physical',
      range: 16.0,
      arcRad: 0.1,
      knockback: 13.0,
    },
  },
  katana: {
    id: 'katana',
    name: 'Moon Katana',
    tier: 2,
    damageType: 'physical',
    roleHint: 'Physical · Rapid Iaido & Dash Flash',
    accentHex: '#67e8f9',
    accentInt: 0x67e8f9,
    primary: {
      name: 'Iaido Cut',
      cooldown: 0.46,
      windup: 0.03,
      active: 0.09,
      recovery: 0.05,
      damage: 33,
      damageType: 'physical',
      range: 3.5,
      arcRad: Math.PI * 0.85,
      knockback: 4.5,
    },
    secondary: {
      name: 'Shadow Flash',
      cooldown: 1.56,
      windup: 0.05,
      active: 0.14,
      recovery: 0.09,
      damage: 60,
      damageType: 'physical',
      range: 5.5,
      arcRad: Math.PI * 0.45,
      knockback: 7.0,
    },
  },
  halberd: {
    id: 'halberd',
    name: 'Runic Halberd',
    tier: 2,
    damageType: 'hybrid',
    roleHint: 'Hybrid · Physical Sweep & Magic Lance',
    accentHex: '#38bdf8',
    accentInt: 0x38bdf8,
    primary: {
      name: 'Pole Sweep',
      cooldown: 0.96,
      windup: 0.08,
      active: 0.14,
      recovery: 0.12,
      damage: 46,
      damageType: 'physical',
      range: 4.6,
      arcRad: Math.PI * 0.95,
      knockback: 8.5,
    },
    secondary: {
      name: 'Lance Charge',
      cooldown: 1.76,
      windup: 0.07,
      active: 0.16,
      recovery: 0.12,
      damage: 68,
      damageType: 'magic',
      range: 5.8,
      arcRad: 0.34,
      knockback: 11.0,
    },
  },
  scythe: {
    id: 'scythe',
    name: 'Reaper Scythe',
    tier: 3,
    damageType: 'hybrid',
    roleHint: 'Hybrid · Pull Reap & Magic Crescent',
    accentHex: '#c084fc',
    accentInt: 0xc084fc,
    primary: {
      name: 'Reap',
      cooldown: 0.9,
      windup: 0.06,
      active: 0.14,
      recovery: 0.11,
      damage: 43,
      damageType: 'physical',
      range: 4.0,
      arcRad: Math.PI * 1.15,
      knockback: -4.5,
    },
    secondary: {
      name: 'Soul Crescent',
      cooldown: 1.64,
      windup: 0.08,
      active: 0.12,
      recovery: 0.12,
      damage: 54,
      damageType: 'magic',
      range: 15.0,
      arcRad: 0.3,
      knockback: 5.0,
    },
  },
  flamethrower: {
    id: 'flamethrower',
    name: 'Pyre Torch',
    tier: 3,
    damageType: 'magic',
    roleHint: 'Magic · Fire Jet & Blazing Orb',
    accentHex: '#f97316',
    accentInt: 0xf97316,
    primary: {
      name: 'Flame Jet',
      cooldown: 0.32,
      windup: 0.02,
      active: 0.08,
      recovery: 0.04,
      damage: 17,
      damageType: 'magic',
      range: 7.8,
      arcRad: 0.45,
      knockback: 1.5,
    },
    secondary: {
      name: 'Fireball',
      cooldown: 1.8,
      windup: 0.06,
      active: 0.09,
      recovery: 0.11,
      damage: 68,
      damageType: 'magic',
      range: 15.0,
      arcRad: 0.2,
      knockback: 8.5,
    },
  },
  sniper: {
    id: 'sniper',
    name: 'Rift Sniper',
    tier: 3,
    damageType: 'physical',
    roleHint: 'Physical · High-Caliber & Snare Trap',
    accentHex: '#f43f5e',
    accentInt: 0xf43f5e,
    primary: {
      name: 'Long Shot',
      cooldown: 1.72,
      windup: 0.09,
      active: 0.08,
      recovery: 0.16,
      damage: 96,
      damageType: 'physical',
      range: 28.0,
      arcRad: 0.08,
      knockback: 9.0,
    },
    secondary: {
      name: 'Snare Trap',
      cooldown: 2.1,
      windup: 0.05,
      active: 0.08,
      recovery: 0.1,
      damage: 72,
      damageType: 'physical',
      range: 2.3,
      arcRad: Math.PI * 2,
      knockback: 2.0,
    },
  },
  chakram: {
    id: 'chakram',
    name: 'Blood Chakram',
    tier: 3,
    damageType: 'physical',
    roleHint: 'Physical · Boomerang & Triple Fan',
    accentHex: '#fda4af',
    accentInt: 0xfda4af,
    primary: {
      name: 'Boomerang',
      cooldown: 0.84,
      windup: 0.04,
      active: 0.08,
      recovery: 0.08,
      damage: 35,
      damageType: 'physical',
      range: 14.0,
      arcRad: 0.2,
      knockback: 3.0,
    },
    secondary: {
      name: 'Crimson Fan',
      cooldown: 1.84,
      windup: 0.06,
      active: 0.1,
      recovery: 0.12,
      damage: 33,
      damageType: 'physical',
      range: 13.0,
      arcRad: 0.65,
      knockback: 4.5,
    },
  },
  minigun: {
    id: 'minigun',
    name: 'Gatling Repeater',
    tier: 4,
    damageType: 'physical',
    roleHint: 'Physical · Bullet Hail & Suppression',
    accentHex: '#fde047',
    accentInt: 0xfde047,
    primary: {
      name: 'Lead Hail',
      cooldown: 0.24,
      windup: 0.02,
      active: 0.05,
      recovery: 0.03,
      damage: 17,
      damageType: 'physical',
      range: 17.0,
      arcRad: 0.16,
      knockback: 2.2,
    },
    secondary: {
      name: 'Lead Sweep',
      cooldown: 1.9,
      windup: 0.06,
      active: 0.16,
      recovery: 0.14,
      damage: 21,
      damageType: 'physical',
      range: 15.0,
      arcRad: 0.85,
      knockback: 5.5,
    },
  },
  railgun: {
    id: 'railgun',
    name: 'Hellfire Railgun',
    tier: 4,
    damageType: 'magic',
    roleHint: 'Magic · Piercing Plasma & EMP Nova',
    accentHex: '#22d3ee',
    accentInt: 0x22d3ee,
    primary: {
      name: 'Plasma Beam',
      cooldown: 1.44,
      windup: 0.08,
      active: 0.08,
      recovery: 0.14,
      damage: 90,
      damageType: 'magic',
      range: 26.0,
      arcRad: 0.1,
      knockback: 9.0,
    },
    secondary: {
      name: 'EMP Pulse',
      cooldown: 2.3,
      windup: 0.06,
      active: 0.12,
      recovery: 0.14,
      damage: 48,
      damageType: 'magic',
      range: 5.2,
      arcRad: Math.PI * 2,
      knockback: 13.0,
    },
  },
  grimoire: {
    id: 'grimoire',
    name: 'Abyss Grimoire',
    tier: 4,
    damageType: 'magic',
    roleHint: 'Magic · Homing Hex & Green Nova',
    accentHex: '#4ade80',
    accentInt: 0x4ade80,
    primary: {
      name: 'Hex Skulls',
      cooldown: 0.68,
      windup: 0.04,
      active: 0.08,
      recovery: 0.08,
      damage: 36,
      damageType: 'magic',
      range: 18.0,
      arcRad: 0.35,
      knockback: 3.5,
    },
    secondary: {
      name: 'Green Nova',
      cooldown: 2.16,
      windup: 0.07,
      active: 0.16,
      recovery: 0.14,
      damage: 66,
      damageType: 'magic',
      range: 5.6,
      arcRad: Math.PI * 2,
      knockback: 11.0,
    },
  },
  greatsword: {
    id: 'greatsword',
    name: 'Infernal Greatsword',
    tier: 4,
    damageType: 'hybrid',
    roleHint: 'Hybrid · Titan Cleave & Magma Slam',
    accentHex: '#ff6b35',
    accentInt: 0xff6b35,
    primary: {
      name: 'Titan Cleave',
      cooldown: 1.24,
      windup: 0.11,
      active: 0.16,
      recovery: 0.16,
      damage: 78,
      damageType: 'physical',
      range: 4.4,
      arcRad: Math.PI * 1.1,
      knockback: 13.0,
    },
    secondary: {
      name: 'Magma Slam',
      cooldown: 2.3,
      windup: 0.12,
      active: 0.18,
      recovery: 0.18,
      damage: 94,
      damageType: 'magic',
      range: 5.0,
      arcRad: Math.PI * 2,
      knockback: 15.0,
    },
  },

  // === 7 New Magic & Hybrid Weapons ===
  arcane_staff: {
    id: 'arcane_staff',
    name: 'Arcane Staff',
    tier: 2,
    damageType: 'magic',
    roleHint: 'Magic · Homing Bolts & Astral Meteor',
    accentHex: '#c084fc',
    accentInt: 0xc084fc,
    primary: {
      name: 'Arcane Bolt',
      cooldown: 0.62,
      windup: 0.04,
      active: 0.08,
      recovery: 0.08,
      damage: 32,
      damageType: 'magic',
      range: 17.5,
      arcRad: 0.25,
      knockback: 3.5,
    },
    secondary: {
      name: 'Astral Meteor',
      cooldown: 2.2,
      windup: 0.08,
      active: 0.12,
      recovery: 0.14,
      damage: 78,
      damageType: 'magic',
      range: 15.0,
      arcRad: 0.2,
      knockback: 9.0,
    },
  },
  void_orb: {
    id: 'void_orb',
    name: 'Void Orb',
    tier: 3,
    damageType: 'magic',
    roleHint: 'Magic · Gravity Pull & Singularity Burst',
    accentHex: '#a855f7',
    accentInt: 0xa855f7,
    primary: {
      name: 'Gravity Pulse',
      cooldown: 1.15,
      windup: 0.06,
      active: 0.1,
      recovery: 0.1,
      damage: 22,
      damageType: 'magic',
      range: 14.0,
      arcRad: 0.2,
      knockback: -2.5,
    },
    secondary: {
      name: 'Singularity',
      cooldown: 2.35,
      windup: 0.08,
      active: 0.14,
      recovery: 0.15,
      damage: 86,
      damageType: 'magic',
      range: 13.0,
      arcRad: Math.PI * 2,
      knockback: 11.5,
    },
  },
  stormcaller_wand: {
    id: 'stormcaller_wand',
    name: 'Stormcaller Wand',
    tier: 2,
    damageType: 'magic',
    roleHint: 'Magic · Chain Lightning & Thunder Stun',
    accentHex: '#38bdf8',
    accentInt: 0x38bdf8,
    primary: {
      name: 'Chain Spark',
      cooldown: 0.68,
      windup: 0.04,
      active: 0.08,
      recovery: 0.08,
      damage: 30,
      damageType: 'magic',
      range: 14.5,
      arcRad: 0.45,
      knockback: 3.0,
    },
    secondary: {
      name: 'Thunderclap',
      cooldown: 2.05,
      windup: 0.05,
      active: 0.12,
      recovery: 0.12,
      damage: 54,
      damageType: 'magic',
      range: 5.4,
      arcRad: Math.PI * 2,
      knockback: 12.0,
    },
  },
  frostbrand: {
    id: 'frostbrand',
    name: 'Frostbrand',
    tier: 3,
    damageType: 'hybrid',
    roleHint: 'Hybrid · Chilling Blade & Glacial Shatter',
    accentHex: '#67e8f9',
    accentInt: 0x67e8f9,
    primary: {
      name: 'Frost Cleave',
      cooldown: 0.78,
      windup: 0.06,
      active: 0.12,
      recovery: 0.1,
      damage: 38,
      damageType: 'hybrid',
      range: 4.1,
      arcRad: Math.PI * 0.9,
      knockback: 6.0,
    },
    secondary: {
      name: 'Glacial Shatter',
      cooldown: 1.92,
      windup: 0.07,
      active: 0.15,
      recovery: 0.14,
      damage: 64,
      damageType: 'magic',
      range: 5.2,
      arcRad: Math.PI * 2,
      knockback: 9.5,
    },
  },
  cursed_censer: {
    id: 'cursed_censer',
    name: 'Cursed Censer',
    tier: 3,
    damageType: 'magic',
    roleHint: 'Magic · Piercing Burn & Wailing Lantern',
    accentHex: '#22c55e',
    accentInt: 0x22c55e,
    primary: {
      name: 'Blight Wave',
      cooldown: 0.88,
      windup: 0.06,
      active: 0.12,
      recovery: 0.1,
      damage: 36,
      damageType: 'magic',
      range: 12.5,
      arcRad: 0.45,
      knockback: 4.0,
    },
    secondary: {
      name: 'Wailing Lantern',
      cooldown: 2.5,
      windup: 0.06,
      active: 0.1,
      recovery: 0.12,
      damage: 42,
      damageType: 'magic',
      range: 4.5,
      arcRad: Math.PI * 2,
      knockback: 5.0,
    },
  },
  runic_gauntlets: {
    id: 'runic_gauntlets',
    name: 'Runic Gauntlets',
    tier: 2,
    damageType: 'hybrid',
    roleHint: 'Hybrid · 3-Hit Combo & Shockwave Palm',
    accentHex: '#f59e0b',
    accentInt: 0xf59e0b,
    primary: {
      name: 'Runic Flurry',
      cooldown: 0.42,
      windup: 0.03,
      active: 0.09,
      recovery: 0.06,
      damage: 26,
      damageType: 'physical',
      range: 2.8,
      arcRad: Math.PI * 0.8,
      knockback: 4.5,
    },
    secondary: {
      name: 'Shockwave Palm',
      cooldown: 1.68,
      windup: 0.05,
      active: 0.14,
      recovery: 0.11,
      damage: 62,
      damageType: 'magic',
      range: 6.4,
      arcRad: Math.PI * 0.55,
      knockback: 12.0,
    },
  },
  starfire_bow: {
    id: 'starfire_bow',
    name: 'Starfire Bow',
    tier: 4,
    damageType: 'hybrid',
    roleHint: 'Hybrid · Splitting Starlight & Arrow Rain',
    accentHex: '#fde047',
    accentInt: 0xfde047,
    primary: {
      name: 'Radiant Shot',
      cooldown: 0.7,
      windup: 0.04,
      active: 0.07,
      recovery: 0.08,
      damage: 46,
      damageType: 'hybrid',
      range: 21.0,
      arcRad: 0.12,
      knockback: 5.5,
    },
    secondary: {
      name: 'Arrow Rain',
      cooldown: 2.24,
      windup: 0.08,
      active: 0.14,
      recovery: 0.14,
      damage: 74,
      damageType: 'magic',
      range: 16.0,
      arcRad: 0.4,
      knockback: 7.0,
    },
  },
};

export const WEARABLES: Record<WearableId, WearableSpec> = {
  sunfire_aegis: {
    id: 'sunfire_aegis',
    name: 'Sunfire Aegis',
    shortDesc: '20% Armor · 15% MR',
    passiveDesc: 'Immolate: Scorches foes within 3.6u with ramping magic fire ticks.',
    armorPct: 0.2,
    mrPct: 0.15,
    accentHex: '#f97316',
    accentInt: 0xf97316,
  },
  thornmail: {
    id: 'thornmail',
    name: 'Thornmail',
    shortDesc: '35% Armor · 0% MR',
    passiveDesc: 'Thorns: Reflects magic damage onto attackers and chills them 20%.',
    armorPct: 0.35,
    mrPct: 0.0,
    accentHex: '#cbd5e1',
    accentInt: 0xcbd5e1,
  },
  spirit_visage: {
    id: 'spirit_visage',
    name: 'Spirit Visage',
    shortDesc: '0% Armor · 35% MR · +25 HP',
    passiveDesc: 'Boundless Vitality: +35% Potion & Shield healing power and +25 Max HP.',
    armorPct: 0.0,
    mrPct: 0.35,
    accentHex: '#4ade80',
    accentInt: 0x4ade80,
  },
  force_of_nature: {
    id: 'force_of_nature',
    name: 'Force of Nature',
    shortDesc: '0% Armor · 30% MR · -25% DoT',
    passiveDesc: 'Steadfast: Taking hits stacks +5% Speed & +MR (up to 4x, 45% cap).',
    armorPct: 0.0,
    mrPct: 0.3,
    accentHex: '#38bdf8',
    accentInt: 0x38bdf8,
  },
  frozen_heart: {
    id: 'frozen_heart',
    name: 'Frozen Heart',
    shortDesc: '32% Armor · +15% Haste',
    passiveDesc: "Winter's Caress: 6u aura slows enemy speed & windup 22%; 15% faster CDs.",
    armorPct: 0.32,
    mrPct: 0.0,
    accentHex: '#67e8f9',
    accentInt: 0x67e8f9,
  },
  banshees_veil: {
    id: 'banshees_veil',
    name: "Banshee's Veil",
    shortDesc: '0% Armor · 25% MR · Shield',
    passiveDesc: 'Annul: Recharging 14s Spell Shield blocks 1 hit & blasts foes away.',
    armorPct: 0.0,
    mrPct: 0.25,
    accentHex: '#c084fc',
    accentInt: 0xc084fc,
  },
  jaksho: {
    id: 'jaksho',
    name: "Jak'Sho, The Protean",
    shortDesc: '18% Arm / 18% MR → 45%',
    passiveDesc: 'Voidborn: Stacks +3% Arm/MR per sec (max 8); max stacks drain & heal 12 HP.',
    armorPct: 0.18,
    mrPct: 0.18,
    accentHex: '#a855f7',
    accentInt: 0xa855f7,
  },
  iceborn_gauntlet: {
    id: 'iceborn_gauntlet',
    name: 'Iceborn Gauntlet',
    shortDesc: '26% Armor · 12% MR',
    passiveDesc: 'Spellblade: After Secondary or Dash, next Primary blasts a 40% slow frost ring.',
    armorPct: 0.26,
    mrPct: 0.12,
    accentHex: '#22d3ee',
    accentInt: 0x22d3ee,
  },
};

export const ENEMY_ARCHETYPES: Record<EnemyKind, EnemyArchetypeSpec> = {
  zombie_sword: {
    kind: 'zombie_sword',
    name: 'Blade Zombie',
    maxHp: 56,
    speed: 3.7,
    radius: 0.68,
    attackRange: 2.25,
    attackDamage: 16,
    damageType: 'physical',
    armor: 5,
    magicResist: 5,
    windupTime: 0.32,
    cooldown: 0.85,
    scoreValue: 90,
    hasWeakPoint: false,
    isRanged: false,
  },
  zombie_club: {
    kind: 'zombie_club',
    name: 'Brute Zombie',
    maxHp: 84,
    speed: 3.15,
    radius: 0.78,
    attackRange: 2.45,
    attackDamage: 24,
    damageType: 'physical',
    armor: 15,
    magicResist: 5,
    windupTime: 0.42,
    cooldown: 1.05,
    scoreValue: 120,
    hasWeakPoint: false,
    isRanged: false,
  },
  zombie_bomber: {
    kind: 'zombie_bomber',
    name: 'Blight Bomber',
    maxHp: 46,
    speed: 4.9,
    radius: 0.7,
    attackRange: 2.6,
    attackDamage: 34,
    damageType: 'hybrid',
    armor: 10,
    magicResist: 15,
    windupTime: 0.48,
    cooldown: 1.5,
    scoreValue: 150,
    hasWeakPoint: false,
    isRanged: false,
  },
  cultist: {
    kind: 'cultist',
    name: 'Rift Cultist',
    maxHp: 50,
    speed: 3.85,
    radius: 0.65,
    attackRange: 13.0,
    attackDamage: 18,
    damageType: 'magic',
    armor: 10,
    magicResist: 48,
    windupTime: 0.42,
    cooldown: 1.3,
    scoreValue: 145,
    hasWeakPoint: false,
    isRanged: true,
  },
  wisp_lantern: {
    kind: 'wisp_lantern',
    name: 'Lantern Wisp',
    maxHp: 42,
    speed: 4.4,
    radius: 0.56,
    attackRange: 13.5,
    attackDamage: 15,
    damageType: 'magic',
    armor: 8,
    magicResist: 44,
    windupTime: 0.36,
    cooldown: 1.25,
    scoreValue: 140,
    hasWeakPoint: false,
    isRanged: true,
  },
  bog_shaman: {
    kind: 'bog_shaman',
    name: 'Bog Shaman',
    maxHp: 64,
    speed: 3.3,
    radius: 0.7,
    attackRange: 13.5,
    attackDamage: 17,
    damageType: 'magic',
    armor: 12,
    magicResist: 46,
    windupTime: 0.46,
    cooldown: 1.6,
    scoreValue: 170,
    hasWeakPoint: false,
    isRanged: true,
  },
  skeleton: {
    kind: 'skeleton',
    name: 'Chain Skeleton',
    maxHp: 54,
    speed: 4.4,
    radius: 0.62,
    attackRange: 6.4,
    attackDamage: 19,
    damageType: 'physical',
    armor: 10,
    magicResist: 10,
    windupTime: 0.38,
    cooldown: 1.1,
    scoreValue: 145,
    hasWeakPoint: false,
    isRanged: true,
  },
  skeleton_archer: {
    kind: 'skeleton_archer',
    name: 'Bone Marksman',
    maxHp: 50,
    speed: 3.9,
    radius: 0.62,
    attackRange: 14.5,
    attackDamage: 21,
    damageType: 'physical',
    armor: 8,
    magicResist: 10,
    windupTime: 0.44,
    cooldown: 1.28,
    scoreValue: 165,
    hasWeakPoint: false,
    isRanged: true,
  },
  imp: {
    kind: 'imp',
    name: 'Hell Imp',
    maxHp: 48,
    speed: 5.8,
    radius: 0.58,
    attackRange: 11.5,
    attackDamage: 18,
    damageType: 'magic',
    armor: 10,
    magicResist: 38,
    windupTime: 0.32,
    cooldown: 1.0,
    scoreValue: 160,
    hasWeakPoint: false,
    isRanged: true,
  },
  cinder_hound: {
    kind: 'cinder_hound',
    name: 'Cinder Hound',
    maxHp: 74,
    speed: 6.0,
    radius: 0.72,
    attackRange: 7.4,
    attackDamage: 22,
    damageType: 'hybrid',
    armor: 20,
    magicResist: 30,
    windupTime: 0.36,
    cooldown: 1.15,
    scoreValue: 195,
    hasWeakPoint: false,
    isRanged: false,
  },
  hell_warlock: {
    kind: 'hell_warlock',
    name: 'Hell Warlock',
    maxHp: 82,
    speed: 3.7,
    radius: 0.68,
    attackRange: 14.5,
    attackDamage: 20,
    damageType: 'magic',
    armor: 14,
    magicResist: 56,
    windupTime: 0.44,
    cooldown: 1.45,
    scoreValue: 225,
    hasWeakPoint: false,
    isRanged: true,
  },
  hell_knight: {
    kind: 'hell_knight',
    name: 'Hell Knight',
    maxHp: 124,
    speed: 4.25,
    radius: 0.84,
    attackRange: 2.75,
    attackDamage: 28,
    damageType: 'physical',
    armor: 55,
    magicResist: 15,
    windupTime: 0.36,
    cooldown: 0.95,
    scoreValue: 220,
    hasWeakPoint: false,
    isRanged: false,
  },
  spider: {
    kind: 'spider',
    name: 'Web Spider',
    maxHp: 48,
    speed: 5.5,
    radius: 0.7,
    attackRange: 7.8,
    attackDamage: 18,
    damageType: 'physical',
    armor: 8,
    magicResist: 8,
    windupTime: 0.34,
    cooldown: 1.05,
    scoreValue: 140,
    hasWeakPoint: false,
    isRanged: false,
  },
  spider_spitter: {
    kind: 'spider_spitter',
    name: 'Acid Brood',
    maxHp: 68,
    speed: 4.3,
    radius: 0.76,
    attackRange: 11.0,
    attackDamage: 18,
    damageType: 'magic',
    armor: 10,
    magicResist: 32,
    windupTime: 0.4,
    cooldown: 1.45,
    scoreValue: 175,
    hasWeakPoint: false,
    isRanged: true,
  },
  magma_imp: {
    kind: 'magma_imp',
    name: 'Magma Fiend',
    maxHp: 74,
    speed: 5.1,
    radius: 0.68,
    attackRange: 12.0,
    attackDamage: 22,
    damageType: 'magic',
    armor: 15,
    magicResist: 45,
    windupTime: 0.36,
    cooldown: 1.15,
    scoreValue: 210,
    hasWeakPoint: false,
    isRanged: true,
  },
  magma_slime: {
    kind: 'magma_slime',
    name: 'Magma Slime',
    maxHp: 112,
    speed: 3.1,
    radius: 0.9,
    attackRange: 2.6,
    attackDamage: 23,
    damageType: 'magic',
    armor: 18,
    magicResist: 36,
    windupTime: 0.4,
    cooldown: 1.15,
    scoreValue: 220,
    hasWeakPoint: false,
    isRanged: false,
  },
  magma_mite: {
    kind: 'magma_mite',
    name: 'Molten Shard',
    maxHp: 38,
    speed: 5.8,
    radius: 0.48,
    attackRange: 2.0,
    attackDamage: 14,
    damageType: 'hybrid',
    armor: 8,
    magicResist: 15,
    windupTime: 0.25,
    cooldown: 0.85,
    scoreValue: 75,
    hasWeakPoint: false,
    isRanged: false,
  },
  obsidian_sentinel: {
    kind: 'obsidian_sentinel',
    name: 'Obsidian Sentinel',
    maxHp: 155,
    speed: 2.8,
    radius: 0.94,
    attackRange: 7.2,
    attackDamage: 30,
    damageType: 'physical',
    armor: 78,
    magicResist: 16,
    windupTime: 0.5,
    cooldown: 1.45,
    scoreValue: 290,
    hasWeakPoint: false,
    isRanged: false,
  },
  ash_gargoyle: {
    kind: 'ash_gargoyle',
    name: 'Ash Gargoyle',
    maxHp: 104,
    speed: 5.2,
    radius: 0.78,
    attackRange: 8.6,
    attackDamage: 25,
    damageType: 'physical',
    armor: 48,
    magicResist: 18,
    windupTime: 0.36,
    cooldown: 1.1,
    scoreValue: 240,
    hasWeakPoint: false,
    isRanged: false,
  },
  wraith: {
    kind: 'wraith',
    name: 'Shadow Wraith',
    maxHp: 74,
    speed: 5.4,
    radius: 0.66,
    attackRange: 2.85,
    attackDamage: 24,
    damageType: 'magic',
    armor: 12,
    magicResist: 55,
    windupTime: 0.3,
    cooldown: 0.98,
    scoreValue: 210,
    hasWeakPoint: false,
    isRanged: false,
  },
  void_reaper: {
    kind: 'void_reaper',
    name: 'Emerald Reaper',
    maxHp: 108,
    speed: 6.0,
    radius: 0.72,
    attackRange: 3.25,
    attackDamage: 28,
    damageType: 'magic',
    armor: 18,
    magicResist: 58,
    windupTime: 0.26,
    cooldown: 0.88,
    scoreValue: 285,
    hasWeakPoint: false,
    isRanged: false,
  },
  plague_archon: {
    kind: 'plague_archon',
    name: 'Greenfire Archon',
    maxHp: 96,
    speed: 4.0,
    radius: 0.74,
    attackRange: 15.0,
    attackDamage: 24,
    damageType: 'magic',
    armor: 14,
    magicResist: 65,
    windupTime: 0.4,
    cooldown: 1.35,
    scoreValue: 295,
    hasWeakPoint: false,
    isRanged: true,
  },
  spectral_banshee: {
    kind: 'spectral_banshee',
    name: 'Spectral Banshee',
    maxHp: 92,
    speed: 5.1,
    radius: 0.68,
    attackRange: 7.5,
    attackDamage: 25,
    damageType: 'magic',
    armor: 15,
    magicResist: 66,
    windupTime: 0.38,
    cooldown: 1.25,
    scoreValue: 300,
    hasWeakPoint: false,
    isRanged: true,
  },
  plague_alchemist: {
    kind: 'plague_alchemist',
    name: 'Plague Alchemist',
    maxHp: 98,
    speed: 3.5,
    radius: 0.72,
    attackRange: 14.5,
    attackDamage: 21,
    damageType: 'magic',
    armor: 16,
    magicResist: 58,
    windupTime: 0.46,
    cooldown: 1.55,
    scoreValue: 285,
    hasWeakPoint: false,
    isRanged: true,
  },
  abyss_brute: {
    kind: 'abyss_brute',
    name: 'Abyss Juggernaut',
    maxHp: 185,
    speed: 3.7,
    radius: 0.96,
    attackRange: 2.95,
    attackDamage: 34,
    damageType: 'physical',
    armor: 60,
    magicResist: 18,
    windupTime: 0.4,
    cooldown: 1.05,
    scoreValue: 320,
    hasWeakPoint: false,
    isRanged: false,
  },
  abyss_paladin: {
    kind: 'abyss_paladin',
    name: 'Abyss Paladin',
    maxHp: 168,
    speed: 4.35,
    radius: 0.88,
    attackRange: 9.5,
    attackDamage: 30,
    damageType: 'hybrid',
    armor: 58,
    magicResist: 48,
    windupTime: 0.36,
    cooldown: 1.05,
    scoreValue: 340,
    hasWeakPoint: false,
    isRanged: true,
  },
  robot_pistol: {
    kind: 'robot_pistol',
    name: 'Pistol Automaton',
    maxHp: 165,
    speed: 2.85,
    radius: 0.92,
    attackRange: 13.0,
    attackDamage: 16,
    damageType: 'physical',
    armor: 72,
    magicResist: 12,
    windupTime: 0.4,
    cooldown: 1.35,
    scoreValue: 250,
    hasWeakPoint: true,
    isRanged: true,
  },
  robot_sniper: {
    kind: 'robot_sniper',
    name: 'Sniper Automaton',
    maxHp: 180,
    speed: 2.4,
    radius: 0.95,
    attackRange: 18.0,
    attackDamage: 34,
    damageType: 'physical',
    armor: 68,
    magicResist: 12,
    windupTime: 0.62,
    cooldown: 1.85,
    scoreValue: 310,
    hasWeakPoint: true,
    isRanged: true,
  },
  robot_pyro: {
    kind: 'robot_pyro',
    name: 'Pyro Automaton',
    maxHp: 205,
    speed: 2.6,
    radius: 0.98,
    attackRange: 9.0,
    attackDamage: 20,
    damageType: 'hybrid',
    armor: 68,
    magicResist: 16,
    windupTime: 0.44,
    cooldown: 1.5,
    scoreValue: 330,
    hasWeakPoint: true,
    isRanged: true,
  },
  robot_tesla: {
    kind: 'robot_tesla',
    name: 'Tesla Coil Walker',
    maxHp: 190,
    speed: 2.55,
    radius: 0.96,
    attackRange: 5.5,
    attackDamage: 24,
    damageType: 'magic',
    armor: 74,
    magicResist: 18,
    windupTime: 0.5,
    cooldown: 1.55,
    scoreValue: 325,
    hasWeakPoint: true,
    isRanged: false,
  },
  boss_zombie: {
    kind: 'boss_zombie',
    name: 'Goliath Rotjaw',
    maxHp: 900,
    speed: 3.6,
    radius: 2.45,
    attackRange: 6.4,
    attackDamage: 32,
    damageType: 'physical',
    armor: 40,
    magicResist: 20,
    windupTime: 0.48,
    cooldown: 1.1,
    scoreValue: 1200,
    hasWeakPoint: false,
    isRanged: false,
    isBoss: true,
  },
  boss_hellhound: {
    kind: 'boss_hellhound',
    name: 'Cerberus, Gate Hound',
    maxHp: 1350,
    speed: 5.8,
    radius: 2.4,
    attackRange: 12.5,
    attackDamage: 35,
    damageType: 'hybrid',
    armor: 32,
    magicResist: 48,
    windupTime: 0.42,
    cooldown: 1.0,
    scoreValue: 1800,
    hasWeakPoint: false,
    isRanged: true,
    isBoss: true,
  },
  boss_golem: {
    kind: 'boss_golem',
    name: 'Ignis Lava Colossus',
    maxHp: 1950,
    speed: 3.15,
    radius: 2.9,
    attackRange: 16.0,
    attackDamage: 40,
    damageType: 'hybrid',
    armor: 85,
    magicResist: 18,
    windupTime: 0.52,
    cooldown: 1.15,
    scoreValue: 2600,
    hasWeakPoint: true,
    isRanged: true,
    isBoss: true,
  },
  boss_skeleton3: {
    kind: 'boss_skeleton3',
    name: 'Tri-Skull Sovereign',
    maxHp: 2600,
    speed: 3.9,
    radius: 2.65,
    attackRange: 17.5,
    attackDamage: 38,
    damageType: 'magic',
    armor: 28,
    magicResist: 72,
    windupTime: 0.45,
    cooldown: 0.95,
    scoreValue: 3500,
    hasWeakPoint: false,
    isRanged: true,
    isBoss: true,
  },
  boss_satan: {
    kind: 'boss_satan',
    name: 'Satan, Lord of the Abyss',
    maxHp: 4200,
    speed: 4.9,
    radius: 2.9,
    attackRange: 19.0,
    attackDamage: 42,
    damageType: 'hybrid',
    armor: 52,
    magicResist: 52,
    windupTime: 0.4,
    cooldown: 0.85,
    scoreValue: 6000,
    hasWeakPoint: false,
    isRanged: true,
    isBoss: true,
  },
};

export const UPGRADE_TREE: Record<UpgradeNodeId, UpgradeNodeSpec> = {
  // --- Weapon & Combat Evolution Tree (Offered on Wave Pedestals) ---
  w_twin_arc: {
    id: 'w_twin_arc',
    category: 'weapon',
    name: 'Twin Arc Split',
    desc: 'Ranged attacks fire extra angled shots; melee swings launch a forward shock crescent.',
    tier: 1,
    maxRank: 2,
    requires: [],
    accentHex: '#38bdf8',
  },
  w_elemental: {
    id: 'w_elemental',
    category: 'weapon',
    name: 'Arcane & Blight Edge',
    desc: 'Weapon hits chill (-40% enemy speed), ignite magic burn ticks, and boost magic potency.',
    tier: 1,
    maxRank: 2,
    requires: [],
    accentHex: '#4ade80',
  },
  w_overclock: {
    id: 'w_overclock',
    category: 'weapon',
    name: 'Combo Overclock',
    desc: 'Secondary moves refund 35% of Primary cooldown; hits shave cooldown off Secondaries.',
    tier: 1,
    maxRank: 2,
    requires: [],
    accentHex: '#facc15',
  },
  w_ricochet: {
    id: 'w_ricochet',
    category: 'weapon',
    name: 'Chain Ricochet',
    desc: 'Shots bounce to nearby foes; melee strikes arc chain lightning to adjacent targets.',
    tier: 2,
    maxRank: 2,
    requires: ['w_twin_arc'],
    accentHex: '#a78bfa',
  },
  w_pierce: {
    id: 'w_pierce',
    category: 'weapon',
    name: 'Armor & MR Shatter',
    desc: 'Shots pierce foes; hits shred 35%/70% of enemy Armor & Magic Resist.',
    tier: 2,
    maxRank: 2,
    requires: ['w_overclock'],
    accentHex: '#67e8f9',
  },
  w_explosive: {
    id: 'w_explosive',
    category: 'weapon',
    name: 'Volatile Detonation',
    desc: 'Every 3rd attack and all Heavy Secondaries trigger an explosive AoE blast.',
    tier: 2,
    maxRank: 2,
    requires: ['w_elemental'],
    accentHex: '#f97316',
  },
  w_siphon: {
    id: 'w_siphon',
    category: 'weapon',
    name: 'Soul Siphon',
    desc: 'Every 4th kill refills Dash instantly and extends active Potion healing duration.',
    tier: 3,
    maxRank: 2,
    requires: ['w_ricochet'],
    accentHex: '#f43f5e',
  },
  w_orbit: {
    id: 'w_orbit',
    category: 'weapon',
    name: 'Spectral Orbitals',
    desc: 'Summons 2 orbiting phantom blades per rank that slice nearby enemies continuously.',
    tier: 3,
    maxRank: 2,
    requires: ['w_explosive'],
    accentHex: '#c084fc',
  },

  // --- Character Evolution Tree (Shrines dropped after Boss Kills!) ---
  c_awakening: {
    id: 'c_awakening',
    category: 'character',
    name: 'Potion Satchel',
    desc: '+1 Potion slot, +1 Potion immediately, and Potions heal 35% faster over time.',
    tier: 1,
    maxRank: 2,
    requires: [],
    accentHex: '#f43f5e',
  },
  c_phantom_dash: {
    id: 'c_phantom_dash',
    category: 'character',
    name: 'Phantom Decoy',
    desc: 'Dashing leaves an exploding shadow decoy behind that damages and slows pursuers.',
    tier: 1,
    maxRank: 1,
    requires: [],
    accentHex: '#818cf8',
  },
  c_thorns: {
    id: 'c_thorns',
    category: 'character',
    name: 'Retribution Pulse',
    desc: 'Taking damage unleashes a radial knockback shockwave that pushes attackers back.',
    tier: 1,
    maxRank: 2,
    requires: [],
    accentHex: '#fb923c',
  },
  c_rush: {
    id: 'c_rush',
    category: 'character',
    name: 'Executioner Momentum',
    desc: 'Each kill grants stacking +8% Move & Attack Speed for 4s (stacks up to 5x).',
    tier: 1,
    maxRank: 2,
    requires: [],
    accentHex: '#facc15',
  },
  c_double_dash: {
    id: 'c_double_dash',
    category: 'character',
    name: 'Twin Shadow Step',
    desc: 'Gain an extra Dash charge (2 total) and recover Dash cooldown 20% quicker.',
    tier: 2,
    maxRank: 1,
    requires: ['c_phantom_dash'],
    accentHex: '#38bdf8',
  },
  c_aegis: {
    id: 'c_aegis',
    category: 'character',
    name: 'Aegis Ward',
    desc: 'Gain a recharging 30-HP energy barrier that absorbs hits and regenerates out of danger.',
    tier: 2,
    maxRank: 2,
    requires: ['c_thorns'],
    accentHex: '#a855f7',
  },
  c_alchemist: {
    id: 'c_alchemist',
    category: 'character',
    name: 'Fury Draught',
    desc: 'Activating a Potion also triggers a Shockwave and grants 4s of Fury (+40% attack rate).',
    tier: 2,
    maxRank: 1,
    requires: ['c_awakening'],
    accentHex: '#4ade80',
  },
  c_reaper: {
    id: 'c_reaper',
    category: 'character',
    name: 'Abyssal Convergence',
    desc: 'Swapping weapons or dashing fires homing soul bolts at the nearest enemies.',
    tier: 3,
    maxRank: 1,
    requires: ['c_double_dash', 'c_aegis'],
    accentHex: '#e11d48',
  },
};

export function createDefaultCustomization(): CharacterCustomization {
  return {
    skinColor: SKIN_PALETTE[0].hex,
    gender: 'neuter',
    clothing: 'shadow_cloak',
  };
}

export function computePlayerResistances(
  wearableId: WearableId | null,
  fonStacks = 0,
  jakshoStacks = 0
): { armorPct: number; mrPct: number } {
  const spec = wearableId ? WEARABLES[wearableId] : null;
  let armor = spec ? spec.armorPct : 0;
  let mr = spec ? spec.mrPct : 0;

  if (wearableId === 'force_of_nature' && fonStacks > 0) {
    mr += Math.min(4, fonStacks) * 0.04;
  }
  if (wearableId === 'jaksho' && jakshoStacks > 0) {
    const bonus = Math.min(8, jakshoStacks) * 0.03;
    armor += bonus;
    mr += bonus;
  }

  return {
    armorPct: Math.min(PLAYER_RESIST_CAP, Math.max(0, armor)),
    mrPct: Math.min(PLAYER_RESIST_CAP, Math.max(0, mr)),
  };
}

export function computeRunStats(
  upgrades: Partial<Record<UpgradeNodeId, number>>,
  rushStacks = 0,
  wearableId: WearableId | null = null,
  fonStacks = 0,
  jakshoStacks = 0
) {
  const awakening = upgrades.c_awakening ?? 0;
  const doubleDash = upgrades.c_double_dash ?? 0;
  const aegis = upgrades.c_aegis ?? 0;
  const rushRank = upgrades.c_rush ?? 0;

  const rushBonus = rushRank > 0 ? Math.min(5, rushStacks) * 0.08 * rushRank : 0;
  const fonSpeedBonus =
    wearableId === 'force_of_nature' ? Math.min(4, fonStacks) * 0.05 : 0;
  const visageHp = wearableId === 'spirit_visage' ? 25 : 0;
  const healAmp = wearableId === 'spirit_visage' ? 1.35 : 1.0;
  const hasteMult = wearableId === 'frozen_heart' ? 0.85 : 1.0;

  const { armorPct, mrPct } = computePlayerResistances(wearableId, fonStacks, jakshoStacks);

  return {
    maxHp: BASE_PLAYER_MAX_HP + awakening * 15 + visageHp,
    maxShieldHp: aegis * 30,
    maxPotions: 3 + awakening,
    potionHealTotal: Math.round((BASE_POTION_HEAL_TOTAL + awakening * 10) * healAmp),
    potionDuration: Math.max(3.5, BASE_POTION_DURATION - awakening * 1.1),
    healAmp,
    cooldownMult: hasteMult,
    moveSpeed: BASE_PLAYER_MOVE_SPEED * (1 + rushBonus + fonSpeedBonus),
    attackRateMult: 1 + rushBonus,
    maxDashCharges: 1 + doubleDash,
    dashCooldown: BASE_PLAYER_DASH_COOLDOWN * (doubleDash > 0 ? 0.8 : 1.0) * hasteMult,
    orbitalCount: (upgrades.w_orbit ?? 0) * 2,
    armorPct,
    mrPct,
  };
}

export function computeNoHitScoreMultiplier(noHitKills: number): number {
  return 1 + Math.min(12, Math.max(0, noHitKills)) * 0.08;
}

export function rollChestPotions(
  noHitKills = 0,
  randFn: () => number = Math.random
): number {
  const r = randFn();
  const bonusChance = Math.min(0.35, Math.max(0, noHitKills) * 0.03);
  if (r < 0.2 + bonusChance) return 3;
  if (r < 0.72) return 2;
  return 1;
}

export interface EnemyDropRoll {
  extraPickup: PickupKind | null;
}

/**
 * Enemies NEVER drop weapons or gold. Potions are super rare (2.5% normal / 20% boss)
 * since wave/boss chests are the main healing source.
 */
export function rollEnemyDrops(
  kind: EnemyKind,
  randFn: () => number = Math.random
): EnemyDropRoll {
  const spec = ENEMY_ARCHETYPES[kind];
  let extraPickup: PickupKind | null = null;
  if (!spec.isBoss) {
    const r = randFn();
    if (r < 0.025) {
      extraPickup = 'potion';
    } else if (r < 0.115) {
      const boosts: PickupKind[] = ['boost_speed', 'boost_rage', 'boost_shield'];
      extraPickup = boosts[Math.floor(randFn() * boosts.length) % boosts.length];
    }
  } else {
    extraPickup = randFn() < 0.2 ? 'potion' : 'boost_rage';
  }
  return { extraPickup };
}

/**
 * Generates 3–4 in-world Reward Pedestals after clearing a wave:
 *  - 2 Weapons (not owned, scaled to map/wave tier)
 *  - 1 Wearable Armor Item (different from current)
 *  - 1 Weapon Evolution Tome (eligible weapon node, or 3rd weapon if maxed)
 */
export function generateWaveRewardPedestals(
  mapId: MapId,
  afterWave: number,
  ownedWeapons: WeaponId[],
  currentWearable: WearableId | null,
  activeUpgrades: Partial<Record<UpgradeNodeId, number>>,
  randFn: () => number = Math.random
): PedestalRewardItem[] {
  const maxTier = Math.min(4, mapId + (afterWave >= 3 ? 1 : 0));
  const ownedSet = new Set(ownedWeapons);
  const allWeapons = Object.values(WEAPONS);

  let weaponPool = allWeapons.filter((w) => !ownedSet.has(w.id) && w.tier <= maxTier);
  if (weaponPool.length < 3) {
    weaponPool = allWeapons.filter((w) => !ownedSet.has(w.id));
  }
  if (weaponPool.length < 3) {
    weaponPool = allWeapons.filter((w) => w.id !== 'sword');
  }
  const shuffledWeapons = [...weaponPool].sort(() => randFn() - 0.5);

  const items: PedestalRewardItem[] = [];
  for (let i = 0; i < Math.min(2, shuffledWeapons.length); i++) {
    items.push({ kind: 'weapon', weaponId: shuffledWeapons[i].id });
  }

  // 1 Wearable Protection Item
  const wearablePool = Object.values(WEARABLES).filter((w) => w.id !== currentWearable);
  if (wearablePool.length > 0) {
    const pickedWearable =
      wearablePool[Math.floor(randFn() * wearablePool.length) % wearablePool.length];
    items.push({ kind: 'wearable', wearableId: pickedWearable.id });
  }

  // 1 Weapon Evolution Tome (or 3rd weapon if all maxed)
  const eligibleNodes = Object.values(UPGRADE_TREE).filter((node) => {
    if (node.category !== 'weapon') return false;
    const rank = activeUpgrades[node.id] ?? 0;
    if (rank >= node.maxRank) return false;
    return node.requires.every((req) => (activeUpgrades[req] ?? 0) > 0);
  });
  if (eligibleNodes.length > 0) {
    const pickedNode =
      eligibleNodes[Math.floor(randFn() * eligibleNodes.length) % eligibleNodes.length];
    items.push({ kind: 'upgrade', upgradeId: pickedNode.id });
  } else if (shuffledWeapons.length >= 3) {
    items.push({ kind: 'weapon', weaponId: shuffledWeapons[2].id });
  }

  return items;
}

/**
 * Generates up to 3 Character Evolution Shrines after defeating a map boss.
 */
export function generateBossShrineChoices(
  activeUpgrades: Partial<Record<UpgradeNodeId, number>>,
  randFn: () => number = Math.random
): UpgradeNodeId[] {
  const eligible = Object.values(UPGRADE_TREE).filter((node) => {
    if (node.category !== 'character') return false;
    const rank = activeUpgrades[node.id] ?? 0;
    if (rank >= node.maxRank) return false;
    return node.requires.every((req) => (activeUpgrades[req] ?? 0) > 0);
  });
  const shuffled = [...eligible].sort(() => randFn() - 0.5);
  return shuffled.slice(0, 3).map((n) => n.id);
}

export function clampDt(rawDt: number): number {
  if (!Number.isFinite(rawDt) || rawDt < 0) return 0;
  return Math.min(rawDt, 0.05);
}

export function normalize2D(x: number, z: number): Vec2 {
  const len = Math.hypot(x, z);
  if (len < 1e-6) return { x: 0, z: 0 };
  return { x: x / len, z: z / len };
}

export function clampToArena(pos: Vec2, radius: number, arenaRadius = ARENA_RADIUS): Vec2 {
  const maxR = Math.max(0.5, arenaRadius - radius);
  const dist = Math.hypot(pos.x, pos.z);
  if (dist <= maxR) return { x: pos.x, z: pos.z };
  const scale = maxR / dist;
  return { x: pos.x * scale, z: pos.z * scale };
}

export function computeSnapVelocity(
  inputX: number,
  inputZ: number,
  currentVx: number,
  currentVz: number,
  maxSpeed: number,
  dt: number
): Vec2 {
  const dir = normalize2D(inputX, inputZ);
  const targetVx = dir.x * maxSpeed;
  const targetVz = dir.z * maxSpeed;
  const hasInput = Math.abs(dir.x) > 0 || Math.abs(dir.z) > 0;
  const responsiveness = hasInput ? 28 : 34;
  const alpha = 1 - Math.exp(-responsiveness * dt);
  return {
    x: currentVx + (targetVx - currentVx) * alpha,
    z: currentVz + (targetVz - currentVz) * alpha,
  };
}

export function shortestAngleDiff(a: number, b: number): number {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export function isPointInCone(
  originX: number,
  originZ: number,
  facingAngle: number,
  targetX: number,
  targetZ: number,
  targetRadius: number,
  range: number,
  arcRad: number
): boolean {
  const dx = targetX - originX;
  const dz = targetZ - originZ;
  const dist = Math.hypot(dx, dz);
  if (dist > range + targetRadius) return false;
  if (arcRad >= Math.PI * 1.99) return true;
  if (dist <= targetRadius * 0.9) return true;
  const angleToTarget = Math.atan2(dx, dz);
  const diff = Math.abs(shortestAngleDiff(facingAngle, angleToTarget));
  const angularPad = Math.atan2(targetRadius, Math.max(0.5, dist));
  return diff <= arcRad * 0.5 + angularPad;
}

export function distancePointToSegment2D(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number
): number {
  const abx = bx - ax;
  const abz = bz - az;
  const lenSq = abx * abx + abz * abz;
  if (lenSq < 1e-8) return Math.hypot(px - ax, pz - az);
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq));
  const cx = ax + t * abx;
  const cz = az + t * abz;
  return Math.hypot(px - cx, pz - cz);
}

export function computeLoLMitigationFactor(resist: number): number {
  const safe = Math.max(0, resist);
  return 100 / (100 + safe);
}

export function computeEnemyDamage(params: {
  baseDamage: number;
  damageType?: DamageType;
  enemyKind: EnemyKind;
  enemyFacing: number;
  enemyX: number;
  enemyZ: number;
  hitOriginX: number;
  hitOriginZ: number;
  coreExposed: boolean;
  bypassArmor?: boolean;
  shatterRank?: number;
  magicAmpRank?: number;
}): { damage: number; damageType: DamageType; isWeakPoint: boolean; isArmored: boolean } {
  const spec = ENEMY_ARCHETYPES[params.enemyKind];
  const dmgType: DamageType = params.damageType ?? 'physical';
  const shatterRank = Math.max(0, params.shatterRank ?? 0);
  const magicAmpRank = Math.max(0, params.magicAmpRank ?? 0);

  let amount = params.baseDamage;
  if (magicAmpRank > 0 && (dmgType === 'magic' || dmgType === 'hybrid')) {
    amount *= 1 + magicAmpRank * (dmgType === 'magic' ? 0.14 : 0.08);
  }

  let isWeakPoint = false;
  let isArmored = false;

  if (spec.hasWeakPoint) {
    if (params.bypassArmor || params.coreExposed) {
      amount *= 2.4;
      isWeakPoint = true;
    } else {
      const dx = params.hitOriginX - params.enemyX;
      const dz = params.hitOriginZ - params.enemyZ;
      const hitDir = normalize2D(dx, dz);
      const fwdX = Math.sin(params.enemyFacing);
      const fwdZ = Math.cos(params.enemyFacing);
      const dot = hitDir.x * fwdX + hitDir.z * fwdZ;

      if (dot < -0.15) {
        amount *= 2.5;
        isWeakPoint = true;
      } else if (dot > 0.35) {
        amount *= 0.45;
        isArmored = true;
      }
    }
  }

  // LoL-style Armor & Magic Resist mitigation (skipped by True Damage or Weakpoint Bypass)
  let effectiveResist = 0;
  if (dmgType === 'physical') {
    effectiveResist = spec.armor;
  } else if (dmgType === 'magic') {
    effectiveResist = spec.magicResist;
  } else if (dmgType === 'hybrid') {
    effectiveResist = (spec.armor + spec.magicResist) * 0.5;
  }

  if (dmgType !== 'true') {
    const penFactor = isWeakPoint || params.bypassArmor
      ? 0.15
      : Math.max(0.25, 1 - shatterRank * 0.35);
    effectiveResist *= penFactor;
    const mult = computeLoLMitigationFactor(effectiveResist);
    amount *= mult;
    if (!isWeakPoint && mult <= 0.78) {
      isArmored = true;
    }
  }

  return {
    damage: Math.max(isArmored ? 4 : 1, Math.round(amount)),
    damageType: dmgType,
    isWeakPoint,
    isArmored,
  };
}

export function computePlayerDamageTaken(
  rawDamage: number,
  isBlocking: boolean,
  hasShieldBoost = false,
  damageType: DamageType = 'physical',
  armorPct = 0,
  mrPct = 0
): { damage: number; blocked: boolean; mitigated: boolean } {
  let mult = PLAYER_INCOMING_DAMAGE_MULT;
  let blocked = false;

  const clampedArm = Math.min(PLAYER_RESIST_CAP, Math.max(0, armorPct));
  const clampedMr = Math.min(PLAYER_RESIST_CAP, Math.max(0, mrPct));

  let resistReduction = 0;
  if (damageType === 'physical') {
    resistReduction = clampedArm;
  } else if (damageType === 'magic') {
    resistReduction = clampedMr;
  } else if (damageType === 'hybrid') {
    resistReduction = (clampedArm + clampedMr) * 0.5;
  }
  mult *= 1 - Math.min(PLAYER_RESIST_CAP, resistReduction);

  if (isBlocking) {
    mult *= 0.2;
    blocked = true;
  }
  if (hasShieldBoost) {
    mult *= 0.3;
    blocked = true;
  }
  return {
    damage: Math.max(1, Math.round(rawDamage * mult)),
    blocked,
    mitigated: resistReduction >= 0.15,
  };
}

export interface WavePlan {
  mapId: MapId;
  wave: number;
  totalEnemies: number;
  spawnInterval: number;
  maxConcurrent: number;
  pool: EnemyKind[];
}

export function buildWavePlan(mapId: MapId, wave: number): WavePlan {
  const safeWave = Math.max(1, Math.floor(wave));
  const totalEnemies = 5 + safeWave * 3 + (mapId - 1) * 3;
  const spawnInterval = Math.max(0.42, 1.75 - safeWave * 0.14 - (mapId - 1) * 0.14);
  const maxConcurrent = Math.min(20, 4 + safeWave * 2 + (mapId - 1) * 2);

  let pool: EnemyKind[];
  if (mapId === 1) {
    pool = ['zombie_sword', 'zombie_club'];
    if (safeWave >= 2) pool.push('spider', 'skeleton', 'wisp_lantern');
    if (safeWave >= 3) pool.push('zombie_bomber', 'cultist', 'bog_shaman');
    if (safeWave >= 5) pool.push('wraith');
  } else if (mapId === 2) {
    pool = ['skeleton', 'imp', 'zombie_bomber', 'cinder_hound'];
    if (safeWave >= 2) pool.push('skeleton_archer', 'spider_spitter');
    if (safeWave >= 3) pool.push('hell_knight', 'robot_pistol', 'hell_warlock', 'robot_tesla');
    if (safeWave >= 4) pool.push('wraith');
  } else if (mapId === 3) {
    pool = ['magma_imp', 'hell_knight', 'spider_spitter', 'magma_slime'];
    if (safeWave >= 2) pool.push('ash_gargoyle', 'robot_pyro', 'obsidian_sentinel');
    if (safeWave >= 3) pool.push('robot_sniper', 'wraith', 'robot_tesla');
    if (safeWave >= 4) pool.push('abyss_brute');
  } else if (mapId === 4) {
    pool = ['void_reaper', 'plague_archon', 'skeleton_archer', 'spectral_banshee'];
    if (safeWave >= 2) pool.push('abyss_brute', 'spider_spitter', 'plague_alchemist');
    if (safeWave >= 3) pool.push('ash_gargoyle', 'robot_pyro', 'abyss_paladin');
    if (safeWave >= 4) pool.push('robot_sniper');
  } else {
    pool = ['hell_knight', 'magma_imp', 'void_reaper', 'abyss_paladin'];
  }

  return {
    mapId,
    wave: safeWave,
    totalEnemies,
    spawnInterval,
    maxConcurrent,
    pool,
  };
}

export function computeOffscreenSpawnPoint(
  playerX: number,
  playerZ: number,
  angleRad: number,
  minOffscreenDist = 23.5,
  maxOffscreenDist = 26.5
): Vec2 {
  const r = minOffscreenDist + (maxOffscreenDist - minOffscreenDist) * 0.5;
  const x = Math.sin(angleRad) * r;
  const z = Math.cos(angleRad) * r;
  const dx = x - playerX;
  const dz = z - playerZ;
  if (Math.hypot(dx, dz) < 16) {
    return { x: -x, z: -z };
  }
  return { x, z };
}

export function sanitizeCustomization(c: Partial<CharacterCustomization> | undefined): CharacterCustomization {
  const validSkin = SKIN_PALETTE.some((s) => s.hex === c?.skinColor)
    ? c!.skinColor!
    : SKIN_PALETTE[0].hex;
  const validGender = c?.gender === 'male' || c?.gender === 'female' || c?.gender === 'neuter'
    ? c.gender
    : 'neuter';
  const validCloth = CLOTHING_OPTIONS.some((cl) => cl.id === c?.clothing)
    ? c!.clothing!
    : 'shadow_cloak';
  return {
    skinColor: validSkin,
    gender: validGender,
    clothing: validCloth,
  };
}
