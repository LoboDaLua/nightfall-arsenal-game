import type {
  FloorMaterial,
  MapId,
  ShopSpellOffer,
  ShopWandOffer,
  SpellId,
  SpellSpec,
  WandChassisSpec,
  WandInstance,
  WeaponId,
} from './types';

export const SPELLS: Record<SpellId, SpellSpec> = {
  // --- Composable Melee & Projectile Spells ---
  slash: {
    id: 'slash',
    name: 'Blade Slash',
    category: 'melee',
    tier: 1,
    shopCost: 22,
    manaCost: 6,
    castDelayDelta: 0.24,
    rechargeDelta: 0.04,
    damage: 26,
    speed: 0,
    range: 3.3,
    arcRad: Math.PI * 0.85,
    knockback: 5.5,
    spreadRad: 0.05,
    life: 0.14,
    accentHex: '#7dd3fc',
    accentInt: 0x7dd3fc,
    desc: 'Wide steel cleave in front of the caster.',
  },
  smash: {
    id: 'smash',
    name: 'Heavy Smash',
    category: 'melee',
    tier: 1,
    shopCost: 28,
    manaCost: 12,
    castDelayDelta: 0.42,
    rechargeDelta: 0.12,
    damage: 46,
    speed: 0,
    range: 3.6,
    arcRad: Math.PI * 0.95,
    knockback: 12.5,
    spreadRad: 0.05,
    life: 0.16,
    accentHex: '#f59e0b',
    accentInt: 0xf59e0b,
    desc: 'Crushing cleave with massive knockback.',
  },
  guard_bash: {
    id: 'guard_bash',
    name: 'Guard Bash',
    category: 'utility',
    tier: 1,
    shopCost: 26,
    manaCost: 10,
    castDelayDelta: 0.28,
    rechargeDelta: 0.08,
    damage: 20,
    speed: 0,
    range: 2.6,
    arcRad: Math.PI,
    knockback: 9.5,
    spreadRad: 0,
    life: 0.9,
    accentHex: '#fbbf24',
    accentInt: 0xfbbf24,
    desc: 'Raises a parry ward for 0.9s and bashes nearby foes.',
  },
  venom_bite: {
    id: 'venom_bite',
    name: 'Venom Fang',
    category: 'melee',
    tier: 1,
    shopCost: 24,
    manaCost: 8,
    castDelayDelta: 0.2,
    rechargeDelta: 0.02,
    damage: 24,
    speed: 0,
    range: 3.0,
    arcRad: Math.PI * 0.72,
    knockback: 3.5,
    spreadRad: 0.04,
    life: 0.12,
    accentHex: '#4ade80',
    accentInt: 0x4ade80,
    desc: 'Quick bite that inflicts lingering poison ticks.',
  },
  fang_toss: {
    id: 'fang_toss',
    name: 'Fang Bolt',
    category: 'projectile',
    tier: 1,
    shopCost: 26,
    manaCost: 9,
    castDelayDelta: 0.22,
    rechargeDelta: 0.04,
    damage: 28,
    speed: 22,
    range: 14,
    arcRad: 0.1,
    knockback: 4.0,
    spreadRad: 0.06,
    life: 0.7,
    accentHex: '#4ade80',
    accentInt: 0x4ade80,
    desc: 'Hurls a venomous fang that poisons on impact.',
  },
  spark_bolt: {
    id: 'spark_bolt',
    name: 'Spark Bolt',
    category: 'projectile',
    tier: 1,
    shopCost: 24,
    manaCost: 8,
    castDelayDelta: 0.18,
    rechargeDelta: 0.02,
    damage: 26,
    speed: 32,
    range: 18,
    arcRad: 0.08,
    knockback: 3.5,
    spreadRad: 0.04,
    life: 0.65,
    accentHex: '#facc15',
    accentInt: 0xfacc15,
    desc: 'Crisp arcane-electric bolt; conducts across Water pools.',
  },
  buckshot: {
    id: 'buckshot',
    name: 'Buckshot Burst',
    category: 'projectile',
    tier: 2,
    shopCost: 36,
    manaCost: 18,
    castDelayDelta: 0.44,
    rechargeDelta: 0.12,
    damage: 15,
    speed: 28,
    range: 12,
    arcRad: 0.5,
    knockback: 7.0,
    spreadRad: 0.34,
    life: 0.45,
    accentHex: '#fb7185',
    accentInt: 0xfb7185,
    desc: 'Fires 5 pellets in a tight spread.',
  },
  heavy_slug: {
    id: 'heavy_slug',
    name: 'Heavy Slug',
    category: 'projectile',
    tier: 2,
    shopCost: 38,
    manaCost: 20,
    castDelayDelta: 0.48,
    rechargeDelta: 0.14,
    damage: 64,
    speed: 36,
    range: 17,
    arcRad: 0.08,
    knockback: 12.0,
    spreadRad: 0.02,
    life: 0.55,
    accentHex: '#fda4af',
    accentInt: 0xfda4af,
    desc: 'Armor-cracking slug that roots targets for 1.1s.',
  },
  piercing_bolt: {
    id: 'piercing_bolt',
    name: 'Runic Bolt',
    category: 'projectile',
    tier: 2,
    shopCost: 34,
    manaCost: 15,
    castDelayDelta: 0.3,
    rechargeDelta: 0.06,
    damage: 42,
    speed: 34,
    range: 20,
    arcRad: 0.08,
    knockback: 5.5,
    spreadRad: 0.02,
    life: 0.72,
    accentHex: '#a78bfa',
    accentInt: 0xa78bfa,
    desc: 'High-velocity piercing crossbow bolt.',
  },
  blast_bolt: {
    id: 'blast_bolt',
    name: 'Blast Bolt',
    category: 'projectile',
    tier: 2,
    shopCost: 42,
    manaCost: 24,
    castDelayDelta: 0.46,
    rechargeDelta: 0.14,
    damage: 58,
    speed: 30,
    range: 18,
    arcRad: 0.1,
    knockback: 9.0,
    spreadRad: 0.04,
    life: 0.65,
    accentHex: '#f97316',
    accentInt: 0xf97316,
    desc: 'Detonates in a fiery blast; ignites Oil pools.',
  },
  flame_jet: {
    id: 'flame_jet',
    name: 'Flamethrower Jet',
    category: 'projectile',
    tier: 2,
    shopCost: 34,
    manaCost: 7,
    castDelayDelta: 0.12,
    rechargeDelta: 0.02,
    damage: 17,
    speed: 18,
    range: 8.5,
    arcRad: 0.36,
    knockback: 1.5,
    spreadRad: 0.22,
    life: 0.44,
    accentHex: '#f97316',
    accentInt: 0xf97316,
    desc: 'Rapid fire stream that burns foes and ignites Oil.',
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    category: 'projectile',
    tier: 3,
    shopCost: 48,
    manaCost: 26,
    castDelayDelta: 0.48,
    rechargeDelta: 0.14,
    damage: 66,
    speed: 21,
    range: 16,
    arcRad: 0.16,
    knockback: 8.5,
    spreadRad: 0.04,
    life: 0.76,
    accentHex: '#fb923c',
    accentInt: 0xfb923c,
    desc: 'Explosive orb of magma; ignites Oil pools on impact.',
  },
  soul_crescent: {
    id: 'soul_crescent',
    name: 'Soul Crescent',
    category: 'projectile',
    tier: 2,
    shopCost: 38,
    manaCost: 16,
    castDelayDelta: 0.32,
    rechargeDelta: 0.08,
    damage: 48,
    speed: 23,
    range: 15,
    arcRad: 0.28,
    knockback: 5.0,
    spreadRad: 0.03,
    life: 0.7,
    accentHex: '#c084fc',
    accentInt: 0xc084fc,
    desc: 'Piercing spectral crescent wave.',
  },
  chakram: {
    id: 'chakram',
    name: 'Blood Chakram',
    category: 'projectile',
    tier: 3,
    shopCost: 46,
    manaCost: 18,
    castDelayDelta: 0.3,
    rechargeDelta: 0.08,
    damage: 36,
    speed: 24,
    range: 14,
    arcRad: 0.18,
    knockback: 3.0,
    spreadRad: 0.04,
    life: 1.15,
    accentHex: '#fda4af',
    accentInt: 0xfda4af,
    desc: 'Piercing boomerang disc that slices twice.',
  },
  long_shot: {
    id: 'long_shot',
    name: 'Rift Rifle Shot',
    category: 'projectile',
    tier: 3,
    shopCost: 52,
    manaCost: 28,
    castDelayDelta: 0.65,
    rechargeDelta: 0.22,
    damage: 94,
    speed: 52,
    range: 28,
    arcRad: 0.05,
    knockback: 9.0,
    spreadRad: 0,
    life: 0.62,
    accentHex: '#f43f5e',
    accentInt: 0xf43f5e,
    desc: 'Armor-piercing high-caliber sniper shot.',
  },
  snare_mine: {
    id: 'snare_mine',
    name: 'Snare Mine',
    category: 'utility',
    tier: 2,
    shopCost: 36,
    manaCost: 18,
    castDelayDelta: 0.34,
    rechargeDelta: 0.08,
    damage: 68,
    speed: 0,
    range: 2.4,
    arcRad: Math.PI * 2,
    knockback: 2.0,
    spreadRad: 0,
    life: 24,
    accentHex: '#f43f5e',
    accentInt: 0xf43f5e,
    desc: 'Drops a steel bear-trap that roots enemies for 2.2s.',
  },
  rail_beam: {
    id: 'rail_beam',
    name: 'Railgun Beam',
    category: 'projectile',
    tier: 4,
    shopCost: 66,
    manaCost: 34,
    castDelayDelta: 0.56,
    rechargeDelta: 0.18,
    damage: 92,
    speed: 54,
    range: 26,
    arcRad: 0.06,
    knockback: 9.5,
    spreadRad: 0,
    life: 0.6,
    accentHex: '#22d3ee',
    accentInt: 0x22d3ee,
    desc: 'Electrified plasma lance; chains shock across Water pools.',
  },
  hex_skull: {
    id: 'hex_skull',
    name: 'Homing Hex Skull',
    category: 'projectile',
    tier: 3,
    shopCost: 50,
    manaCost: 16,
    castDelayDelta: 0.28,
    rechargeDelta: 0.06,
    damage: 36,
    speed: 19,
    range: 18,
    arcRad: 0.25,
    knockback: 3.5,
    spreadRad: 0.14,
    life: 1.25,
    accentHex: '#4ade80',
    accentInt: 0x4ade80,
    desc: 'Summons a homing abyssal skull.',
  },
  water_splash: {
    id: 'water_splash',
    name: 'Aqua Flask',
    category: 'utility',
    tier: 1,
    shopCost: 26,
    manaCost: 12,
    castDelayDelta: 0.22,
    rechargeDelta: 0.04,
    damage: 14,
    speed: 18,
    range: 12,
    arcRad: 0.2,
    knockback: 4.0,
    spreadRad: 0.06,
    life: 0.55,
    accentHex: '#38bdf8',
    accentInt: 0x38bdf8,
    desc: 'Creates Water pool: neutralizes Toxic Sludge & conducts Electricity.',
  },
  oil_flask: {
    id: 'oil_flask',
    name: 'Tar & Oil Flask',
    category: 'utility',
    tier: 1,
    shopCost: 28,
    manaCost: 12,
    castDelayDelta: 0.22,
    rechargeDelta: 0.04,
    damage: 10,
    speed: 18,
    range: 12,
    arcRad: 0.2,
    knockback: 2.0,
    spreadRad: 0.06,
    life: 0.55,
    accentHex: '#78350f',
    accentInt: 0x78350f,
    desc: 'Creates slippery Oil pool that ignites violently with Fire.',
  },
  chainsaw: {
    id: 'chainsaw',
    name: 'Chainsaw',
    category: 'melee',
    tier: 2,
    shopCost: 48,
    manaCost: 2,
    castDelayDelta: -0.25,
    rechargeDelta: -0.22,
    damage: 18,
    speed: 0,
    range: 2.4,
    arcRad: Math.PI * 0.65,
    knockback: 2.0,
    spreadRad: 0,
    life: 0.08,
    accentHex: '#e2e8f0',
    accentInt: 0xe2e8f0,
    desc: 'Rapid close slash that shaves Cast Delay and Recharge Time!',
  },
  add_mana: {
    id: 'add_mana',
    name: 'Add Mana',
    category: 'modifier',
    tier: 2,
    shopCost: 52,
    manaCost: -30,
    castDelayDelta: 0.14,
    rechargeDelta: 0,
    damage: 0,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 0,
    spreadRad: 0,
    life: 0,
    accentHex: '#38bdf8',
    accentInt: 0x38bdf8,
    desc: 'Restores +30 Mana to this casting block (+0.14s cast delay).',
  },
  cleanse_sigil: {
    id: 'cleanse_sigil',
    name: 'Quicksilver Cleanse',
    category: 'utility',
    tier: 2,
    shopCost: 44,
    manaCost: 24,
    castDelayDelta: 0.2,
    rechargeDelta: 0.06,
    damage: 24,
    speed: 0,
    range: 4.2,
    arcRad: Math.PI * 2,
    knockback: 10,
    spreadRad: 0,
    life: 0.2,
    accentHex: '#e0f2fe',
    accentInt: 0xe0f2fe,
    desc: 'Purges all Root/Slow/Silence CC and knocks back nearby foes.',
  },

  // --- High-Risk Friendly-Fire Spells ---
  sawblade_disc: {
    id: 'sawblade_disc',
    name: 'Giga Sawblade',
    category: 'projectile',
    tier: 3,
    shopCost: 54,
    manaCost: 28,
    castDelayDelta: 0.36,
    rechargeDelta: 0.1,
    damage: 78,
    speed: 22,
    range: 14,
    arcRad: 0.2,
    knockback: 4.0,
    spreadRad: 0.03,
    life: 1.35,
    selfHazard: true,
    accentHex: '#cbd5e1',
    accentInt: 0xcbd5e1,
    desc: 'WARNING: Friendly fire! Boomerang buzzsaw shreds enemies AND you.',
  },
  plasma_cutter: {
    id: 'plasma_cutter',
    name: 'Plasma Beam Cutter',
    category: 'projectile',
    tier: 3,
    shopCost: 58,
    manaCost: 30,
    castDelayDelta: 0.4,
    rechargeDelta: 0.12,
    damage: 88,
    speed: 19,
    range: 11,
    arcRad: 0.15,
    knockback: 6.0,
    spreadRad: 0.02,
    life: 0.85,
    selfHazard: true,
    accentHex: '#22d3ee',
    accentInt: 0x22d3ee,
    desc: 'WARNING: Volatile plasma orb damages nearby enemies AND caster.',
  },
  giga_nuke: {
    id: 'giga_nuke',
    name: 'Abyssal Nuke',
    category: 'projectile',
    tier: 4,
    shopCost: 82,
    manaCost: 65,
    castDelayDelta: 0.85,
    rechargeDelta: 0.45,
    damage: 210,
    speed: 14,
    range: 13,
    arcRad: 0.25,
    knockback: 16.0,
    spreadRad: 0.05,
    life: 0.85,
    selfHazard: true,
    accentHex: '#f43f5e',
    accentInt: 0xf43f5e,
    desc: 'WARNING: Cataclysmic blast hits a 6.5m radius including YOU!',
  },

  // --- Trigger & Timer Spells ---
  spark_trigger: {
    id: 'spark_trigger',
    name: 'Spark Bolt w/ Trigger',
    category: 'trigger',
    tier: 2,
    shopCost: 48,
    manaCost: 14,
    castDelayDelta: 0.22,
    rechargeDelta: 0.04,
    damage: 22,
    speed: 31,
    range: 18,
    arcRad: 0.08,
    knockback: 3.0,
    spreadRad: 0.03,
    life: 0.65,
    triggerMode: 'impact',
    accentHex: '#a855f7',
    accentInt: 0xa855f7,
    desc: 'On impact, casts the next spell block from the impact point!',
  },
  fireball_timer: {
    id: 'fireball_timer',
    name: 'Fireball w/ Timer',
    category: 'trigger',
    tier: 3,
    shopCost: 58,
    manaCost: 26,
    castDelayDelta: 0.4,
    rechargeDelta: 0.1,
    damage: 44,
    speed: 20,
    range: 14,
    arcRad: 0.16,
    knockback: 7.0,
    spreadRad: 0.04,
    life: 0.55,
    triggerMode: 'timer',
    accentHex: '#fb923c',
    accentInt: 0xfb923c,
    desc: 'After 0.55s flight, bursts and casts the next spell block there!',
  },

  // --- Modifiers & Multicasts (converted from the 8 Weapon Evolution Nodes!) ---
  mod_double_cast: {
    id: 'mod_double_cast',
    name: 'Double Cast',
    category: 'multicast',
    tier: 1,
    shopCost: 45,
    manaCost: 4,
    castDelayDelta: 0.04,
    rechargeDelta: 0.02,
    damage: 0,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 0,
    spreadRad: 0.12,
    life: 0,
    multicastCount: 2,
    accentHex: '#38bdf8',
    accentInt: 0x38bdf8,
    desc: 'Simultaneously casts the next 2 spells in a spread fan.',
  },
  mod_triple_cast: {
    id: 'mod_triple_cast',
    name: 'Triple Cast',
    category: 'multicast',
    tier: 3,
    shopCost: 78,
    manaCost: 8,
    castDelayDelta: 0.06,
    rechargeDelta: 0.04,
    damage: 0,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 0,
    spreadRad: 0.18,
    life: 0,
    multicastCount: 3,
    accentHex: '#67e8f9',
    accentInt: 0x67e8f9,
    desc: 'Simultaneously casts the next 3 spells in a wide volley.',
  },
  mod_venom_trail: {
    id: 'mod_venom_trail',
    name: 'Venom & Frost Trail',
    category: 'modifier',
    tier: 1,
    shopCost: 42,
    manaCost: 8,
    castDelayDelta: 0.02,
    rechargeDelta: 0,
    damage: 6,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 0,
    spreadRad: 0,
    life: 0,
    accentHex: '#4ade80',
    accentInt: 0x4ade80,
    desc: 'Spells in this block chill (-40% speed) and inflict poison ticks.',
  },
  mod_chain_bounce: {
    id: 'mod_chain_bounce',
    name: 'Chain Ricochet',
    category: 'modifier',
    tier: 2,
    shopCost: 56,
    manaCost: 12,
    castDelayDelta: 0.04,
    rechargeDelta: 0,
    damage: 4,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 0,
    spreadRad: 0,
    life: 0,
    accentHex: '#a78bfa',
    accentInt: 0xa78bfa,
    desc: 'Projectiles bounce to another enemy and melee arcs chain lightning.',
  },
  mod_reduce_recharge: {
    id: 'mod_reduce_recharge',
    name: 'Reduce Recharge',
    category: 'modifier',
    tier: 1,
    shopCost: 46,
    manaCost: 10,
    castDelayDelta: -0.14,
    rechargeDelta: -0.35,
    damage: 0,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 0,
    spreadRad: 0,
    life: 0,
    accentHex: '#facc15',
    accentInt: 0xfacc15,
    desc: 'Shaves -0.14s Cast Delay and -0.35s Wand Recharge Time.',
  },
  mod_orbit_larpa: {
    id: 'mod_orbit_larpa',
    name: 'Orbiting Larpa',
    category: 'modifier',
    tier: 3,
    shopCost: 68,
    manaCost: 18,
    castDelayDelta: 0.08,
    rechargeDelta: 0.04,
    damage: 8,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 0,
    spreadRad: 0,
    life: 0,
    accentHex: '#c084fc',
    accentInt: 0xc084fc,
    desc: 'Projects twin orbiting blades around fired projectiles & caster.',
  },
  mod_pierce_shot: {
    id: 'mod_pierce_shot',
    name: 'Piercing Shot',
    category: 'modifier',
    tier: 2,
    shopCost: 54,
    manaCost: 14,
    castDelayDelta: 0.04,
    rechargeDelta: 0.02,
    damage: 6,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 0,
    spreadRad: 0,
    life: 0,
    accentHex: '#67e8f9',
    accentInt: 0x67e8f9,
    desc: 'Projectiles pierce through enemies and shatter armor.',
  },
  mod_volatile_blast: {
    id: 'mod_volatile_blast',
    name: 'Volatile Detonation',
    category: 'modifier',
    tier: 2,
    shopCost: 58,
    manaCost: 16,
    castDelayDelta: 0.06,
    rechargeDelta: 0.04,
    damage: 18,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 3,
    spreadRad: 0,
    life: 0,
    accentHex: '#f97316',
    accentInt: 0xf97316,
    desc: 'Spells explode on impact in a 3.2m blast and ignite Oil.',
  },
  mod_soul_siphon: {
    id: 'mod_soul_siphon',
    name: 'Soul Siphon Mod',
    category: 'modifier',
    tier: 3,
    shopCost: 62,
    manaCost: 10,
    castDelayDelta: 0,
    rechargeDelta: -0.08,
    damage: 5,
    speed: 0,
    range: 0,
    arcRad: 0,
    knockback: 0,
    spreadRad: 0,
    life: 0,
    accentHex: '#f43f5e',
    accentInt: 0xf43f5e,
    desc: 'Kills with this block restore +12 Mana and extend active Potion heal.',
  },
};

export const WAND_CHASSIS: Record<WeaponId, WandChassisSpec> = {
  sword: {
    chassisId: 'sword',
    name: 'Apprentice Iron Wand',
    tier: 1,
    shopCost: 42,
    capacity: 4,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.24,
    rechargeTime: 0.55,
    manaMax: 95,
    manaChargeSpeed: 26,
    spreadRad: 0.04,
    alwaysCast: null,
    defaultSpells: ['slash', 'spark_bolt'],
    accentHex: '#7dd3fc',
    accentInt: 0x7dd3fc,
  },
  club: {
    chassisId: 'club',
    name: 'Bastion Oak Staff',
    tier: 1,
    shopCost: 65,
    capacity: 4,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.34,
    rechargeTime: 0.72,
    manaMax: 115,
    manaChargeSpeed: 28,
    spreadRad: 0.05,
    alwaysCast: null,
    defaultSpells: ['smash', 'guard_bash'],
    accentHex: '#f59e0b',
    accentInt: 0xf59e0b,
  },
  fangs: {
    chassisId: 'fangs',
    name: 'Venom Fang Rod',
    tier: 1,
    shopCost: 68,
    capacity: 4,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.18,
    rechargeTime: 0.48,
    manaMax: 105,
    manaChargeSpeed: 30,
    spreadRad: 0.06,
    alwaysCast: 'mod_venom_trail',
    defaultSpells: ['venom_bite', 'fang_toss'],
    accentHex: '#4ade80',
    accentInt: 0x4ade80,
  },
  pistol: {
    chassisId: 'pistol',
    name: 'Spark Flint Wand',
    tier: 1,
    shopCost: 75,
    capacity: 4,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.16,
    rechargeTime: 0.45,
    manaMax: 110,
    manaChargeSpeed: 34,
    spreadRad: 0.05,
    alwaysCast: null,
    defaultSpells: ['spark_bolt', 'spark_bolt'],
    accentHex: '#facc15',
    accentInt: 0xfacc15,
  },
  chain: {
    chassisId: 'chain',
    name: 'Chain Lash Scepter',
    tier: 1,
    shopCost: 82,
    capacity: 4,
    spellsPerCast: 2,
    shuffle: true,
    castDelay: 0.22,
    rechargeTime: 0.58,
    manaMax: 120,
    manaChargeSpeed: 32,
    spreadRad: 0.12,
    alwaysCast: null,
    defaultSpells: ['slash', 'chainsaw', 'spark_bolt'],
    accentHex: '#e2e8f0',
    accentInt: 0xe2e8f0,
  },
  axe: {
    chassisId: 'axe',
    name: 'Cleave Battle-Staff',
    tier: 2,
    shopCost: 92,
    capacity: 5,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.28,
    rechargeTime: 0.68,
    manaMax: 140,
    manaChargeSpeed: 34,
    spreadRad: 0.05,
    alwaysCast: 'mod_volatile_blast',
    defaultSpells: ['smash', 'slash'],
    accentHex: '#fb923c',
    accentInt: 0xfb923c,
  },
  crossbow: {
    chassisId: 'crossbow',
    name: 'Arbalest Focus',
    tier: 2,
    shopCost: 98,
    capacity: 5,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.2,
    rechargeTime: 0.52,
    manaMax: 150,
    manaChargeSpeed: 38,
    spreadRad: 0.01,
    alwaysCast: null,
    defaultSpells: ['mod_pierce_shot', 'piercing_bolt', 'blast_bolt'],
    accentHex: '#a78bfa',
    accentInt: 0xa78bfa,
  },
  shotgun: {
    chassisId: 'shotgun',
    name: 'Scatterbore Rod',
    tier: 2,
    shopCost: 105,
    capacity: 5,
    spellsPerCast: 2,
    shuffle: true,
    castDelay: 0.22,
    rechargeTime: 0.62,
    manaMax: 155,
    manaChargeSpeed: 40,
    spreadRad: 0.16,
    alwaysCast: null,
    defaultSpells: ['buckshot', 'heavy_slug'],
    accentHex: '#fb7185',
    accentInt: 0xfb7185,
  },
  katana: {
    chassisId: 'katana',
    name: 'Moonlit Iaido Wand',
    tier: 2,
    shopCost: 112,
    capacity: 5,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.12,
    rechargeTime: 0.36,
    manaMax: 145,
    manaChargeSpeed: 44,
    spreadRad: 0.02,
    alwaysCast: null,
    defaultSpells: ['chainsaw', 'slash', 'soul_crescent'],
    accentHex: '#67e8f9',
    accentInt: 0x67e8f9,
  },
  halberd: {
    chassisId: 'halberd',
    name: 'Runic Halberd Staff',
    tier: 2,
    shopCost: 116,
    capacity: 5,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.24,
    rechargeTime: 0.56,
    manaMax: 165,
    manaChargeSpeed: 38,
    spreadRad: 0.03,
    alwaysCast: null,
    defaultSpells: ['spark_trigger', 'slash', 'piercing_bolt'],
    accentHex: '#38bdf8',
    accentInt: 0x38bdf8,
  },
  scythe: {
    chassisId: 'scythe',
    name: 'Reaper Soul Staff',
    tier: 3,
    shopCost: 130,
    capacity: 6,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.2,
    rechargeTime: 0.5,
    manaMax: 195,
    manaChargeSpeed: 46,
    spreadRad: 0.04,
    alwaysCast: 'mod_soul_siphon',
    defaultSpells: ['mod_double_cast', 'soul_crescent', 'slash'],
    accentHex: '#c084fc',
    accentInt: 0xc084fc,
  },
  flamethrower: {
    chassisId: 'flamethrower',
    name: 'Pyromancer Torch',
    tier: 3,
    shopCost: 132,
    capacity: 5,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.1,
    rechargeTime: 0.38,
    manaMax: 190,
    manaChargeSpeed: 52,
    spreadRad: 0.09,
    alwaysCast: null,
    defaultSpells: ['oil_flask', 'flame_jet', 'fireball'],
    accentHex: '#f97316',
    accentInt: 0xf97316,
  },
  sniper: {
    chassisId: 'sniper',
    name: 'Rift Marksman Wand',
    tier: 3,
    shopCost: 142,
    capacity: 6,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.32,
    rechargeTime: 0.66,
    manaMax: 210,
    manaChargeSpeed: 46,
    spreadRad: 0,
    alwaysCast: null,
    defaultSpells: ['spark_trigger', 'long_shot', 'snare_mine'],
    accentHex: '#f43f5e',
    accentInt: 0xf43f5e,
  },
  chakram: {
    chassisId: 'chakram',
    name: 'Crimson Ring Wand',
    tier: 3,
    shopCost: 145,
    capacity: 6,
    spellsPerCast: 2,
    shuffle: false,
    castDelay: 0.18,
    rechargeTime: 0.44,
    manaMax: 205,
    manaChargeSpeed: 50,
    spreadRad: 0.08,
    alwaysCast: null,
    defaultSpells: ['mod_chain_bounce', 'chakram', 'chakram'],
    accentHex: '#fda4af',
    accentInt: 0xfda4af,
  },
  minigun: {
    chassisId: 'minigun',
    name: 'Clockwork Gatling Wand',
    tier: 4,
    shopCost: 172,
    capacity: 6,
    spellsPerCast: 3,
    shuffle: true,
    castDelay: 0.07,
    rechargeTime: 0.32,
    manaMax: 240,
    manaChargeSpeed: 68,
    spreadRad: 0.12,
    alwaysCast: null,
    defaultSpells: ['add_mana', 'spark_bolt', 'spark_bolt', 'chainsaw'],
    accentHex: '#fde047',
    accentInt: 0xfde047,
  },
  railgun: {
    chassisId: 'railgun',
    name: 'Stormcore Rail Wand',
    tier: 4,
    shopCost: 185,
    capacity: 6,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.24,
    rechargeTime: 0.56,
    manaMax: 260,
    manaChargeSpeed: 60,
    spreadRad: 0,
    alwaysCast: 'mod_pierce_shot',
    defaultSpells: ['water_splash', 'rail_beam', 'mod_reduce_recharge'],
    accentHex: '#22d3ee',
    accentInt: 0x22d3ee,
  },
  grimoire: {
    chassisId: 'grimoire',
    name: 'Eldritch Codex',
    tier: 4,
    shopCost: 180,
    capacity: 7,
    spellsPerCast: 2,
    shuffle: false,
    castDelay: 0.16,
    rechargeTime: 0.44,
    manaMax: 270,
    manaChargeSpeed: 64,
    spreadRad: 0.05,
    alwaysCast: 'mod_double_cast',
    defaultSpells: ['fireball_timer', 'hex_skull', 'hex_skull', 'add_mana'],
    accentHex: '#4ade80',
    accentInt: 0x4ade80,
  },
  greatsword: {
    chassisId: 'greatsword',
    name: 'Hellfire Greatstaff',
    tier: 4,
    shopCost: 192,
    capacity: 6,
    spellsPerCast: 1,
    shuffle: false,
    castDelay: 0.3,
    rechargeTime: 0.62,
    manaMax: 265,
    manaChargeSpeed: 58,
    spreadRad: 0.04,
    alwaysCast: 'mod_volatile_blast',
    defaultSpells: ['smash', 'fireball', 'mod_double_cast'],
    accentHex: '#ff6b35',
    accentInt: 0xff6b35,
  },
};

let wandUidCounter = 1;

export function createWandInstance(
  chassisId: WeaponId,
  overrideSpells?: (SpellId | null)[],
  uidOverride?: string
): WandInstance {
  const c = WAND_CHASSIS[chassisId];
  const slots: (SpellId | null)[] = Array.from({ length: c.capacity }, () => null);
  const src = overrideSpells ?? c.defaultSpells;
  for (let i = 0; i < Math.min(c.capacity, src.length); i++) {
    slots[i] = src[i] ?? null;
  }
  return {
    uid: uidOverride ?? `wand_${chassisId}_${wandUidCounter++}`,
    chassisId,
    name: c.name,
    tier: c.tier,
    shopCost: c.shopCost,
    capacity: c.capacity,
    spellsPerCast: c.spellsPerCast,
    shuffle: c.shuffle,
    castDelay: c.castDelay,
    rechargeTime: c.rechargeTime,
    manaMax: c.manaMax,
    mana: c.manaMax,
    manaChargeSpeed: c.manaChargeSpeed,
    spreadRad: c.spreadRad,
    alwaysCast: c.alwaysCast,
    slots,
    castCursor: 0,
    wrappedThisCycle: false,
  };
}

export function cloneWand(w: WandInstance): WandInstance {
  return {
    ...w,
    slots: [...w.slots],
  };
}

export interface SpellBlockModifiers {
  damageBonus: number;
  knockbackBonus: number;
  spreadAdd: number;
  venomTrail: boolean;
  chainBounce: number;
  pierce: boolean;
  volatileBlast: boolean;
  soulSiphon: boolean;
  orbitLarpa: boolean;
}

export interface EvaluatedSpellAction {
  spellId: SpellId;
  spreadAngleOffset: number;
  modifiers: SpellBlockModifiers;
  payload: EvaluatedSpellAction[] | null;
}

export interface WandCastEvaluation {
  actions: EvaluatedSpellAction[];
  manaSpent: number;
  castDelay: number;
  rechargeTime: number;
  rechargeTriggered: boolean;
  wrapped: boolean;
  nextWand: WandInstance;
}

function emptyModifiers(): SpellBlockModifiers {
  return {
    damageBonus: 0,
    knockbackBonus: 0,
    spreadAdd: 0,
    venomTrail: false,
    chainBounce: 0,
    pierce: false,
    volatileBlast: false,
    soulSiphon: false,
    orbitLarpa: false,
  };
}

function applyModifierSpec(mods: SpellBlockModifiers, spellId: SpellId): void {
  const s = SPELLS[spellId];
  mods.damageBonus += s.damage;
  mods.knockbackBonus += s.knockback;
  mods.spreadAdd += s.spreadRad;
  if (spellId === 'mod_venom_trail') mods.venomTrail = true;
  if (spellId === 'mod_chain_bounce') mods.chainBounce += 1;
  if (spellId === 'mod_pierce_shot') mods.pierce = true;
  if (spellId === 'mod_volatile_blast') mods.volatileBlast = true;
  if (spellId === 'mod_soul_siphon') mods.soulSiphon = true;
  if (spellId === 'mod_orbit_larpa') mods.orbitLarpa = true;
}

/**
 * Authentic Noita Casting-Block Evaluator:
 * - Processes optional Always-Cast spell first for free
 * - Evaluates spellsPerCast + Multicast expansions + Modifier accumulation
 * - Binds Trigger/Timer payload sub-blocks
 * - Performs Spell Wrapping back to slot 0 when a modifier/multicast runs off the end
 */
export function evaluateWandCast(
  wand: WandInstance,
  randFn: () => number = Math.random
): WandCastEvaluation {
  const nextWand = cloneWand(wand);
  const nonEmptyIndices: number[] = [];
  for (let i = 0; i < nextWand.slots.length; i++) {
    if (nextWand.slots[i] !== null) nonEmptyIndices.push(i);
  }

  if (nonEmptyIndices.length === 0 && !nextWand.alwaysCast) {
    return {
      actions: [],
      manaSpent: 0,
      castDelay: nextWand.castDelay,
      rechargeTime: nextWand.rechargeTime,
      rechargeTriggered: false,
      wrapped: false,
      nextWand,
    };
  }

  // Build ordered slot sequence (shuffle permutes when starting fresh cycle)
  const sequence = [...nonEmptyIndices];
  if (nextWand.shuffle && sequence.length > 1) {
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(randFn() * (i + 1)) % (i + 1);
      const tmp = sequence[i];
      sequence[i] = sequence[j];
      sequence[j] = tmp;
    }
  }

  let cursor = Math.max(0, Math.min(sequence.length - 1, nextWand.castCursor));
  if (sequence.length === 0) cursor = 0;

  let remainingMana = nextWand.mana;
  let manaSpent = 0;
  let castDelay = nextWand.castDelay;
  let rechargeTime = nextWand.rechargeTime;
  let rechargeTriggered = false;
  let wrapped = false;

  const blockMods = emptyModifiers();
  const actions: EvaluatedSpellAction[] = [];

  if (nextWand.alwaysCast) {
    const ac = SPELLS[nextWand.alwaysCast];
    if (ac.category === 'modifier') {
      applyModifierSpec(blockMods, ac.id);
    } else if (ac.category !== 'multicast') {
      actions.push({
        spellId: ac.id,
        spreadAngleOffset: 0,
        modifiers: { ...blockMods },
        payload: null,
      });
    }
  }

  const visitedSteps = new Set<number>();

  const drawNextSpell = (): SpellId | null => {
    if (sequence.length === 0) return null;
    if (cursor >= sequence.length) {
      if (nextWand.wrappedThisCycle) {
        rechargeTriggered = true;
        return null;
      }
      // Spell Wrapping! Wrap back to slot 0 once per cycle.
      nextWand.wrappedThisCycle = true;
      wrapped = true;
      rechargeTriggered = true;
      cursor = 0;
    }
    if (visitedSteps.has(cursor) && wrapped) {
      return null;
    }
    visitedSteps.add(cursor);
    const slotIdx = sequence[cursor];
    cursor += 1;
    if (cursor >= sequence.length) {
      rechargeTriggered = true;
    }
    return nextWand.slots[slotIdx];
  };

  const evaluateSubBlock = (drawsBudget: number, depth: number): EvaluatedSpellAction[] => {
    const out: EvaluatedSpellAction[] = [];
    let draws = drawsBudget;
    let safety = 0;
    const localMods = { ...blockMods };

    while (draws > 0 && safety < 24) {
      safety += 1;
      const spellId = drawNextSpell();
      if (!spellId) break;
      const spec = SPELLS[spellId];

      // Mana check (Add Mana has negative manaCost so always succeeds!)
      if (spec.manaCost > 0 && remainingMana < spec.manaCost) {
        continue;
      }
      remainingMana = Math.min(nextWand.manaMax, remainingMana - spec.manaCost);
      manaSpent += spec.manaCost;
      castDelay += spec.castDelayDelta;
      rechargeTime += spec.rechargeDelta;

      if (spec.category === 'modifier') {
        applyModifierSpec(localMods, spellId);
        // Modifiers do not consume a draw slot!
        continue;
      }

      if (spec.category === 'multicast') {
        draws -= 1;
        draws += spec.multicastCount ?? 2;
        localMods.spreadAdd += spec.spreadRad;
        continue;
      }

      if (spec.category === 'trigger') {
        draws -= 1;
        const payload = depth < 2 ? evaluateSubBlock(1, depth + 1) : null;
        out.push({
          spellId,
          spreadAngleOffset: (randFn() - 0.5) * (nextWand.spreadRad + localMods.spreadAdd),
          modifiers: { ...localMods },
          payload: payload && payload.length > 0 ? payload : null,
        });
        continue;
      }

      // Projectile / Melee / Utility spell
      draws -= 1;
      out.push({
        spellId,
        spreadAngleOffset: (randFn() - 0.5) * (nextWand.spreadRad + localMods.spreadAdd),
        modifiers: { ...localMods },
        payload: null,
      });
    }

    return out;
  };

  const primaryBlock = evaluateSubBlock(Math.max(1, nextWand.spellsPerCast), 0);
  actions.push(...primaryBlock);

  if (rechargeTriggered || cursor >= sequence.length) {
    nextWand.castCursor = 0;
    nextWand.wrappedThisCycle = false;
    rechargeTriggered = true;
  } else {
    nextWand.castCursor = cursor;
  }
  nextWand.mana = Math.max(0, Math.min(nextWand.manaMax, remainingMana));

  return {
    actions,
    manaSpent,
    castDelay: Math.max(0.06, castDelay),
    rechargeTime: Math.max(0.12, rechargeTime),
    rechargeTriggered,
    wrapped,
    nextWand,
  };
}

export type SpellLocation =
  | { kind: 'wand'; wandIndex: number; slotIndex: number }
  | { kind: 'backpack'; index: number };

/**
 * Pure Holy Mountain / Tinkering Workbench spell mover/swapper.
 */
export function moveOrSwapWandSpell(
  wands: WandInstance[],
  backpack: SpellId[],
  from: SpellLocation,
  to: SpellLocation
): { wands: WandInstance[]; backpack: SpellId[] } {
  const nextWands = wands.map(cloneWand);
  const nextBackpack = [...backpack];

  const read = (loc: SpellLocation): SpellId | null => {
    if (loc.kind === 'wand') {
      return nextWands[loc.wandIndex]?.slots[loc.slotIndex] ?? null;
    }
    return nextBackpack[loc.index] ?? null;
  };

  const write = (loc: SpellLocation, val: SpellId | null) => {
    if (loc.kind === 'wand') {
      if (nextWands[loc.wandIndex] && loc.slotIndex >= 0 && loc.slotIndex < nextWands[loc.wandIndex].slots.length) {
        nextWands[loc.wandIndex].slots[loc.slotIndex] = val;
        nextWands[loc.wandIndex].castCursor = 0;
        nextWands[loc.wandIndex].wrappedThisCycle = false;
      }
    } else if (val !== null) {
      if (loc.index >= 0 && loc.index < nextBackpack.length) {
        nextBackpack[loc.index] = val;
      } else {
        nextBackpack.push(val);
      }
    } else if (loc.index >= 0 && loc.index < nextBackpack.length) {
      nextBackpack.splice(loc.index, 1);
    }
  };

  const fromSpell = read(from);
  const toSpell = read(to);
  if (fromSpell === null && toSpell === null) {
    return { wands: nextWands, backpack: nextBackpack };
  }

  if (from.kind === 'backpack' && to.kind === 'wand') {
    write(to, fromSpell);
    if (toSpell !== null) {
      nextBackpack[from.index] = toSpell;
    } else {
      nextBackpack.splice(from.index, 1);
    }
  } else if (from.kind === 'wand' && to.kind === 'backpack') {
    if (to.index >= 0 && to.index < nextBackpack.length) {
      write(from, toSpell);
      if (fromSpell !== null) nextBackpack[to.index] = fromSpell;
    } else if (fromSpell !== null) {
      write(from, null);
      nextBackpack.push(fromSpell);
    }
  } else {
    write(from, toSpell);
    write(to, fromSpell);
  }

  return { wands: nextWands, backpack: nextBackpack };
}

export type AlchemyReactionResult = 'none' | 'ignite_oil' | 'conduct_water' | 'neutralize_steam';

export function resolveFloorAlchemy(
  incoming: 'fire' | 'electric' | 'water' | 'oil' | 'acid',
  existing: FloorMaterial
): AlchemyReactionResult {
  if (incoming === 'fire' && existing === 'oil') return 'ignite_oil';
  if (incoming === 'electric' && existing === 'water') return 'conduct_water';
  if (incoming === 'water' && (existing === 'acid' || existing === 'tormented_soil' || existing === 'fire')) {
    return 'neutralize_steam';
  }
  if (incoming === 'fire' && existing === 'water') return 'neutralize_steam';
  return 'none';
}

export function generateHolyMountainOffers(
  mapId: MapId,
  afterWave: number,
  ownedChassisIds: WeaponId[],
  randFn: () => number = Math.random
): { wandOffers: ShopWandOffer[]; spellOffers: ShopSpellOffer[] } {
  const maxTier = Math.min(4, mapId + (afterWave >= 3 ? 1 : 0));
  const ownedSet = new Set(ownedChassisIds);
  const allChassis = Object.values(WAND_CHASSIS);

  let chassisPool = allChassis.filter((c) => !ownedSet.has(c.chassisId) && c.tier <= maxTier);
  if (chassisPool.length === 0) chassisPool = allChassis.filter((c) => c.tier <= maxTier);
  const pickedChassis = chassisPool[Math.floor(randFn() * chassisPool.length) % chassisPool.length];
  const wandOfferInst = createWandInstance(pickedChassis.chassisId);
  const wandOffers: ShopWandOffer[] = [
    {
      wand: wandOfferInst,
      cost: Math.round(pickedChassis.shopCost * (0.95 + (mapId - 1) * 0.1)),
      purchased: false,
    },
  ];

  // 4 Spells / Modifiers / Triggers for Holy Mountain shop
  const allSpells = Object.values(SPELLS).filter((s) => s.tier <= maxTier);
  const modOrTriggerPool = allSpells.filter(
    (s) => s.category === 'modifier' || s.category === 'multicast' || s.category === 'trigger'
  );
  const attackPool = allSpells.filter(
    (s) => s.category === 'projectile' || s.category === 'melee' || s.category === 'utility'
  );

  const chosenSpells: SpellSpec[] = [];
  const shuffledMods = [...modOrTriggerPool].sort(() => randFn() - 0.5);
  const shuffledAttacks = [...attackPool].sort(() => randFn() - 0.5);

  for (const s of shuffledMods.slice(0, 2)) chosenSpells.push(s);
  for (const s of shuffledAttacks) {
    if (chosenSpells.length >= 4) break;
    if (!chosenSpells.some((c) => c.id === s.id)) chosenSpells.push(s);
  }

  const spellOffers: ShopSpellOffer[] = chosenSpells.map((s) => ({
    spellId: s.id,
    cost: Math.round(s.shopCost * (0.95 + (mapId - 1) * 0.08)),
    purchased: false,
  }));

  return { wandOffers, spellOffers };
}
