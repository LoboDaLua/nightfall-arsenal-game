import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARENA_RADIUS,
  BASE_PLAYER_DASH_COOLDOWN,
  BASE_PLAYER_MAX_HP,
  ENEMY_ARCHETYPES,
  MAPS,
  MAX_ATTACK_TOKENS,
  MAX_EQUIPPED_WEAPONS,
  PLAYER_INCOMING_DAMAGE_MULT,
  PLAYER_RESIST_CAP,
  UPGRADE_TREE,
  WEAPONS,
  WEARABLES,
  buildWavePlan,
  clampDt,
  clampToArena,
  computeEnemyDamage,
  computeOffscreenSpawnPoint,
  computePlayerDamageTaken,
  computePlayerResistances,
  computeRunStats,
  computeSnapVelocity,
  distancePointToSegment2D,
  generateBossShrineChoices,
  generateWaveRewardPedestals,
  isPointInCone,
  rollChestPotions,
  rollEnemyDrops,
} from './rules';

test('clampDt caps large spikes at 0.05s and rejects negatives', () => {
  assert.equal(clampDt(0.016), 0.016);
  assert.equal(clampDt(0.45), 0.05);
  assert.equal(clampDt(-0.2), 0);
  assert.equal(clampDt(Number.NaN), 0);
});

test('all 25 weapons and 8 wearables exist with distinct moves & damage types', () => {
  const ids = Object.keys(WEAPONS);
  assert.equal(ids.length, 25);
  for (const id of ids) {
    const w = WEAPONS[id as keyof typeof WEAPONS];
    assert.ok(w.primary.name.length > 0);
    assert.ok(w.secondary.name.length > 0);
    assert.notEqual(w.primary.name, w.secondary.name);
    assert.ok(['physical', 'magic', 'hybrid', 'true'].includes(w.damageType));
  }
  assert.equal(WEAPONS.grimoire.damageType, 'magic');
  assert.equal(WEAPONS.void_orb.damageType, 'magic');
  assert.equal(WEAPONS.frostbrand.damageType, 'hybrid');
  assert.equal(WEAPONS.sword.damageType, 'physical');

  const wearableIds = Object.keys(WEARABLES);
  assert.equal(wearableIds.length, 8);
  for (const wId of wearableIds) {
    const item = WEARABLES[wId as keyof typeof WEARABLES];
    assert.ok(item.armorPct <= PLAYER_RESIST_CAP);
    assert.ok(item.mrPct <= PLAYER_RESIST_CAP);
  }
});

test('all 5 maps and 35 enemy archetypes (24 + 10 new + split mite) exist with escalating difficulty', () => {
  assert.equal(Object.keys(MAPS).length, 5);
  assert.equal(MAPS[1].waves, 5);
  assert.equal(MAPS[1].bossKind, 'boss_zombie');
  assert.equal(MAPS[2].bossKind, 'boss_hellhound');
  assert.equal(MAPS[3].bossKind, 'boss_golem');
  assert.equal(MAPS[4].bossKind, 'boss_skeleton3');
  assert.equal(MAPS[5].isBossOnly, true);
  assert.equal(MAPS[5].bossKind, 'boss_satan');
  assert.ok(MAPS[4].enemyHpMult > MAPS[3].enemyHpMult);
  assert.ok(MAPS[3].enemyHpMult > MAPS[2].enemyHpMult);
  assert.ok(MAPS[2].enemyHpMult > MAPS[1].enemyHpMult);
  assert.equal(Object.keys(ENEMY_ARCHETYPES).length, 35);
  assert.ok(ENEMY_ARCHETYPES.robot_tesla.hasWeakPoint);
  assert.ok(ENEMY_ARCHETYPES.obsidian_sentinel.armor > ENEMY_ARCHETYPES.obsidian_sentinel.magicResist);
  assert.ok(ENEMY_ARCHETYPES.spectral_banshee.magicResist > ENEMY_ARCHETYPES.spectral_banshee.armor);
});

test('enemies never drop gold or weapons; potions remain super rare and chests drop 1-3 potions', () => {
  const drop = rollEnemyDrops('zombie_sword', () => 0.01);
  assert.ok(!('dropGoldAmount' in drop));
  assert.ok(!('dropWeapon' in drop));
  assert.equal(drop.extraPickup, 'potion');

  const nonRare = rollEnemyDrops('zombie_sword', () => 0.05);
  assert.equal(nonRare.extraPickup, 'boost_speed');

  const miss = rollEnemyDrops('zombie_sword', () => 0.99);
  assert.equal(miss.extraPickup, null);

  assert.equal(rollChestPotions(0, () => 0.1), 3);
  assert.equal(rollChestPotions(0, () => 0.5), 2);
  assert.equal(rollChestPotions(0, () => 0.9), 1);
});

test('player Armor and Magic Resist clamp strictly at 45% cap and Spirit Visage amplifies heals', () => {
  const capRes = computePlayerResistances('jaksho', 0, 12);
  assert.equal(capRes.armorPct, 0.42);
  assert.equal(capRes.mrPct, 0.42);

  const fonRes = computePlayerResistances('force_of_nature', 4, 0);
  assert.equal(fonRes.armorPct, 0);
  assert.equal(fonRes.mrPct, 0.45);

  const baseStats = computeRunStats({});
  const visageStats = computeRunStats({}, 0, 'spirit_visage');
  assert.equal(visageStats.maxHp, BASE_PLAYER_MAX_HP + 25);
  assert.ok(visageStats.potionHealTotal > baseStats.potionHealTotal);
});

test('wave reward pedestals offer weapons, wearable, and weapon upgrade; boss shrines offer character upgrades', () => {
  const pedestals = generateWaveRewardPedestals(
    2,
    3,
    ['sword', 'pistol'],
    'thornmail',
    { w_twin_arc: 1 },
    () => 0.4
  );
  assert.ok(pedestals.length >= 3 && pedestals.length <= 4);
  const hasWeapon = pedestals.some((p) => p.kind === 'weapon');
  const hasWearable = pedestals.some((p) => p.kind === 'wearable');
  const hasUpgrade = pedestals.some((p) => p.kind === 'upgrade');
  assert.equal(hasWeapon, true);
  assert.equal(hasWearable, true);
  assert.equal(hasUpgrade, true);
  for (const p of pedestals) {
    if (p.kind === 'weapon') {
      assert.notEqual(p.weaponId, 'sword');
      assert.notEqual(p.weaponId, 'pistol');
    } else if (p.kind === 'wearable') {
      assert.notEqual(p.wearableId, 'thornmail');
    } else {
      assert.equal(UPGRADE_TREE[p.upgradeId].category, 'weapon');
    }
  }

  const shrines = generateBossShrineChoices({ c_phantom_dash: 1 }, () => 0.4);
  assert.equal(shrines.length, 3);
  for (const s of shrines) {
    assert.equal(UPGRADE_TREE[s].category, 'character');
  }

  assert.equal(MAX_EQUIPPED_WEAPONS, 3);
  assert.ok(MAX_ATTACK_TOKENS >= 8);
  assert.equal(BASE_PLAYER_DASH_COOLDOWN, 1.84);
  assert.equal(WEAPONS.sword.primary.cooldown, 0.72);
});

test('LoL armor vs magic resist mitigation and weak-point crits work accurately', () => {
  // Obsidian Sentinel has 78 Armor vs 16 MR -> magic should deal substantially more than physical
  const physHit = computeEnemyDamage({
    baseDamage: 100,
    damageType: 'physical',
    enemyKind: 'obsidian_sentinel',
    enemyFacing: 0,
    enemyX: 0,
    enemyZ: 0,
    hitOriginX: 0,
    hitOriginZ: 4,
    coreExposed: false,
  });
  const magicHit = computeEnemyDamage({
    baseDamage: 100,
    damageType: 'magic',
    enemyKind: 'obsidian_sentinel',
    enemyFacing: 0,
    enemyX: 0,
    enemyZ: 0,
    hitOriginX: 0,
    hitOriginZ: 4,
    coreExposed: false,
  });
  assert.equal(physHit.isArmored, true);
  assert.ok(magicHit.damage > physHit.damage);

  // Shatter upgrade reduces Armor & MR resistance
  const shatteredPhys = computeEnemyDamage({
    baseDamage: 100,
    damageType: 'physical',
    enemyKind: 'obsidian_sentinel',
    enemyFacing: 0,
    enemyX: 0,
    enemyZ: 0,
    hitOriginX: 0,
    hitOriginZ: 4,
    coreExposed: false,
    shatterRank: 2,
  });
  assert.ok(shatteredPhys.damage > physHit.damage);

  const rearHit = computeEnemyDamage({
    baseDamage: 40,
    damageType: 'physical',
    enemyKind: 'boss_golem',
    enemyFacing: 0,
    enemyX: 0,
    enemyZ: 0,
    hitOriginX: 0,
    hitOriginZ: -4,
    coreExposed: false,
  });
  assert.equal(rearHit.isWeakPoint, true);
  assert.ok(rearHit.damage > 80);
});

test('player damage mitigation, geometry, and new enemy wave plans behave accurately', () => {
  assert.equal(PLAYER_INCOMING_DAMAGE_MULT, 1.5);
  assert.equal(computePlayerDamageTaken(30, false, false, 'physical', 0, 0).damage, 45);
  assert.equal(computePlayerDamageTaken(30, false, false, 'physical', 0.4, 0).damage, 27);
  assert.equal(computePlayerDamageTaken(30, true, false, 'physical', 0, 0).damage, 9);
  assert.equal(computePlayerDamageTaken(30, false, true, 'physical', 0, 0).damage, 13);

  const v = computeSnapVelocity(1, 0, 0, 0, 10, 0.04);
  assert.ok(v.x > 6.5);
  const clamped = clampToArena({ x: 40, z: 0 }, 0.65, ARENA_RADIUS);
  assert.ok(Math.hypot(clamped.x, clamped.z) <= ARENA_RADIUS - 0.65 + 1e-6);

  assert.equal(isPointInCone(0, 0, 0, 0, 2.5, 0.6, 3.0, Math.PI * 0.5), true);
  assert.ok(distancePointToSegment2D(2, 0.5, 0, 0, 5, 0) <= 0.51);

  assert.ok(buildWavePlan(1, 3).pool.includes('bog_shaman'));
  assert.ok(buildWavePlan(2, 3).pool.includes('robot_tesla'));
  assert.ok(buildWavePlan(3, 2).pool.includes('obsidian_sentinel'));
  assert.ok(buildWavePlan(4, 3).pool.includes('abyss_paladin'));
  assert.ok(buildWavePlan(4, 2).pool.includes('plague_alchemist'));

  const spawn = computeOffscreenSpawnPoint(0, 0, 0.5);
  assert.ok(Math.hypot(spawn.x, spawn.z) >= 22);
});
