import { WEAPONS, WEARABLES } from '../game/rules';
import type { DamageType, HudSnapshot, WeaponId } from '../game/types';
import { WeaponIcon, WearableIcon } from './WeaponIcon';

interface GameHudProps {
  hud: HudSnapshot;
  onToggleMute: () => void;
  onToggleTouch: () => void;
  onPause: () => void;
  onUsePotion: () => void;
  onSelectWeapon: (id: WeaponId) => void;
  onInteract: () => void;
  onStartNextWave: () => void;
}

const DAMAGE_TYPE_BADGE: Record<DamageType, { label: string; className: string }> = {
  physical: { label: 'PHYS', className: 'text-orange-300 border-orange-400/70 bg-orange-950/70' },
  magic: { label: 'MAGIC', className: 'text-sky-300 border-sky-400/70 bg-sky-950/70' },
  hybrid: { label: 'HYBRID', className: 'text-yellow-200 border-yellow-400/70 bg-yellow-950/70' },
  true: { label: 'TRUE', className: 'text-slate-100 border-slate-300/80 bg-slate-800/80' },
};

export function GameHud({
  hud,
  onToggleMute,
  onToggleTouch,
  onPause,
  onUsePotion,
  onSelectWeapon,
  onInteract,
  onStartNextWave,
}: GameHudProps) {
  const weapon = WEAPONS[hud.weaponId];
  const wearable = hud.wearableId ? WEARABLES[hud.wearableId] : null;
  const dmgBadge = DAMAGE_TYPE_BADGE[weapon.damageType];
  const hpRatio = Math.max(0, Math.min(1, hud.hp / Math.max(1, hud.maxHp)));
  const isLowHp = hud.hp <= Math.max(22, Math.round(hud.maxHp * 0.3));
  const shieldRatio =
    hud.maxShieldHp > 0 ? Math.max(0, Math.min(1, hud.shieldHp / hud.maxShieldHp)) : 0;
  const bossHpRatio =
    hud.bossMaxHp > 0 ? Math.max(0, Math.min(1, hud.bossHp / hud.bossMaxHp)) : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-2.5 sm:p-5">
      {/* Critical Low HP subtle peripheral edge indicator */}
      {isLowHp && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 90px rgba(220, 38, 38, 0.45)',
          }}
        />
      )}

      {/* TOP SECTION: Top Bar + Non-overlapping Boss Bar & Banner */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          {/* Top-Left: Vitality, Shield, Resists, Wearable & Potions */}
          <div className="ps1-panel px-2 sm:px-3 py-1.5 sm:py-2 min-w-[138px] sm:min-w-[244px]">
            <div className="flex items-baseline justify-between gap-1.5 sm:gap-3">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-slate-400">
                HP
              </span>
              <div className="flex items-baseline gap-1.5">
                {hud.hotRemaining > 0 && (
                  <span className="text-[9px] font-black uppercase text-emerald-300 tabular-nums animate-pulse">
                    +{Math.ceil(hud.hotRemaining)}
                  </span>
                )}
                <span
                  className={`text-base sm:text-2xl font-black tabular-nums leading-none ${
                    isLowHp ? 'text-rose-400' : 'text-slate-100'
                  }`}
                  data-testid="hud-hp"
                >
                  {hud.hp}
                  <span className="hidden sm:inline text-xs text-slate-400">/{hud.maxHp}</span>
                </span>
              </div>
            </div>

            <div className="mt-1 h-2 sm:h-2.5 w-full bg-slate-950 border border-slate-700 p-0.5">
              <div
                className={`h-full transition-[width] duration-100 ${
                  isLowHp ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.round(hpRatio * 100)}%` }}
              />
            </div>

            {hud.maxShieldHp > 0 && (
              <div className="mt-1 h-1.5 w-full bg-slate-950 border border-purple-700/80">
                <div
                  className="h-full bg-purple-400 transition-[width] duration-100"
                  style={{ width: `${Math.round(shieldRatio * 100)}%` }}
                />
              </div>
            )}

            <div className="mt-1.5 flex items-center justify-between gap-1.5 text-[8px] sm:text-[10px] font-black tracking-wider uppercase tabular-nums whitespace-nowrap">
              <div className="flex items-center gap-1">
                <span className="text-sky-200" data-testid="hud-resists">
                  <span className="sm:hidden">A{Math.round(hud.armorPct * 100)}·M{Math.round(hud.mrPct * 100)}%</span>
                  <span className="hidden sm:inline">ARM {Math.round(hud.armorPct * 100)}% · MR {Math.round(hud.mrPct * 100)}%</span>
                </span>
                {hud.noHitScoreMult > 1.05 && (
                  <span
                    className="hidden sm:inline px-1 bg-amber-950/90 border border-amber-400/70 text-amber-200 text-[8px] sm:text-[9px]"
                    title="No-damage kill streak score multiplier"
                  >
                    x{hud.noHitScoreMult.toFixed(1)}
                  </span>
                )}
              </div>

              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-potion-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onUsePotion();
                }}
                className={`pointer-events-auto px-1.5 py-0.5 border text-[8px] sm:text-[10px] font-black uppercase cursor-pointer whitespace-nowrap ${
                  hud.potions > 0
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 hover:bg-emerald-900'
                    : 'bg-slate-950 border-slate-700 text-slate-500'
                }`}
                title="Drink Healing Potion (H)"
              >
                <span className="sm:hidden">Vial {hud.potions}/{hud.maxPotions}</span>
                <span className="hidden sm:inline">[H] Vial {hud.potions}/{hud.maxPotions}</span>
              </button>
            </div>

          {/* Wearable Relic & Passive Status Row */}
          <div className="mt-1 flex items-center justify-between gap-1 text-[9px] font-black uppercase">
            {wearable ? (
              <div
                className="flex items-center gap-1 min-w-0 text-slate-200"
                title={`${wearable.name}: ${wearable.passiveDesc}`}
                data-testid="hud-wearable"
              >
                <WearableIcon wearableId={wearable.id} className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[112px] sm:max-w-[140px]" style={{ color: wearable.accentHex }}>
                  {wearable.name}
                </span>
              </div>
            ) : (
              <span className="text-slate-500 tracking-wider" data-testid="hud-wearable">
                Relic: Empty
              </span>
            )}

            <div className="flex items-center gap-1 shrink-0 tabular-nums">
              {hud.bansheeShieldReady && (
                <span className="px-1 bg-purple-950 border border-purple-400 text-purple-200">
                  VEIL
                </span>
              )}
              {hud.jakshoStacks > 0 && (
                <span className="px-1 bg-fuchsia-950 border border-fuchsia-400 text-fuchsia-200">
                  JAK x{hud.jakshoStacks}
                </span>
              )}
              {hud.fonStacks > 0 && (
                <span className="px-1 bg-sky-950 border border-sky-400 text-sky-200">
                  FON x{hud.fonStacks}
                </span>
              )}
              {hud.spellbladeReady && (
                <span className="px-1 bg-cyan-950 border border-cyan-400 text-cyan-200">
                  FROST
                </span>
              )}
            </div>
          </div>

          {(hud.boosts.speedTimer > 0 ||
            hud.boosts.rageTimer > 0 ||
            hud.boosts.shieldTimer > 0 ||
            hud.rushStacks > 0) && (
            <div className="mt-1 flex flex-wrap gap-1 text-[9px] font-black uppercase tabular-nums">
              {hud.boosts.speedTimer > 0 && (
                <span className="px-1 bg-sky-950 border border-sky-400 text-sky-200">
                  SPD {Math.ceil(hud.boosts.speedTimer)}s
                </span>
              )}
              {hud.boosts.rageTimer > 0 && (
                <span className="px-1 bg-rose-950 border border-rose-400 text-rose-200">
                  FURY {Math.ceil(hud.boosts.rageTimer)}s
                </span>
              )}
              {hud.boosts.shieldTimer > 0 && (
                <span className="px-1 bg-indigo-950 border border-indigo-400 text-indigo-200">
                  WARD {Math.ceil(hud.boosts.shieldTimer)}s
                </span>
              )}
              {hud.rushStacks > 0 && (
                <span className="px-1 bg-amber-950 border border-amber-400 text-amber-200">
                  RUSH x{hud.rushStacks}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top-Center: Map / Wave / Foes / Score */}
        <div className="flex items-center gap-1.5 sm:gap-6 pt-0.5 sm:pt-1">
          <div className="text-center">
            <div className="text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-slate-400 hud-text-stroke">
              MAP
            </div>
            <div
              className="text-sm sm:text-2xl font-black text-purple-300 tabular-nums hud-text-stroke leading-none"
              data-testid="hud-map"
            >
              {hud.mapId}/5
            </div>
          </div>

          <div className="text-center">
            <div className="text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-slate-400 hud-text-stroke">
              WAVE
            </div>
            <div
              className="text-sm sm:text-2xl font-black text-amber-300 tabular-nums hud-text-stroke leading-none"
              data-testid="hud-wave"
            >
              {hud.isBossWave ? 'BOSS' : `${hud.wave}/${hud.totalWavesInMap}`}
            </div>
          </div>

          <div className="text-center">
            <div className="text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-slate-400 hud-text-stroke">
              FOES
            </div>
            <div className="text-sm sm:text-2xl font-black text-sky-300 tabular-nums hud-text-stroke leading-none">
              {hud.waveKillsRemaining}
            </div>
          </div>

          <div className="text-center">
            <div className="text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-slate-400 hud-text-stroke">
              SCORE
            </div>
            <div
              className="text-sm sm:text-2xl font-black text-slate-100 tabular-nums hud-text-stroke leading-none"
              data-testid="hud-score"
            >
              {hud.score}
            </div>
          </div>

          {hud.combo >= 2 && (
            <div className="text-center hidden md:block">
              <div className="text-[10px] font-bold tracking-widest uppercase text-amber-400 hud-text-stroke">
                COMBO
              </div>
              <div className="text-2xl font-black text-amber-300 tabular-nums hud-text-stroke leading-none">
                {hud.combo}x
              </div>
            </div>
          )}
        </div>

        {/* Top-Right: Square Utility Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0">
            <button
              type="button"
              tabIndex={-1}
              aria-label={hud.touchControlsEnabled ? 'Disable phone touch controls' : 'Enable phone touch controls'}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleTouch();
              }}
              className={`ps1-button w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center cursor-pointer ${
                hud.touchControlsEnabled ? 'border-sky-400 text-sky-200' : 'text-slate-300'
              }`}
              title="Phone Controls"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="7" y="2.5" width="10" height="19" rx="1.5" />
                <circle cx="12" cy="18" r="1" fill="currentColor" />
              </svg>
            </button>

            <button
              type="button"
              tabIndex={-1}
              aria-label={hud.muted ? 'Unmute audio' : 'Mute audio'}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleMute();
              }}
              className="ps1-button w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-200 cursor-pointer"
              title="Mute (M)"
            >
              {hud.muted ? (
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H3V15H6L11 19V5Z" />
                  <path d="M16 9L21 15M21 9L16 15" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H3V15H6L11 19V5Z" />
                  <path d="M15.5 8.5C16.8 9.8 16.8 14.2 15.5 15.5" />
                  <path d="M18.5 6C21 8.5 21 15.5 18.5 18" />
                </svg>
              )}
            </button>

            <button
              type="button"
              tabIndex={-1}
              aria-label="Pause game"
              onClick={(e) => {
                e.currentTarget.blur();
                onPause();
              }}
              className="ps1-button w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-200 cursor-pointer"
              title="Pause (Esc / P)"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Boss Bar + Transient Banner cleanly below Top Bar with zero overlap */}
        <div className="mx-auto flex flex-col items-center gap-1.5 pointer-events-none w-[92vw] max-w-md">
          {hud.isBossWave && hud.bossName && (
            <div className="w-full ps1-panel px-3 py-1.5 border-rose-500/80" data-testid="boss-hp-bar">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-300">
                <span>{hud.bossName}</span>
                <span className="tabular-nums">
                  {hud.bossHp}/{hud.bossMaxHp}
                </span>
              </div>
              <div className="mt-1 h-2.5 w-full bg-slate-950 border border-rose-900">
                <div
                  className="h-full bg-rose-500 transition-[width] duration-100"
                  style={{ width: `${Math.round(bossHpRatio * 100)}%` }}
                />
              </div>
            </div>
          )}

          {hud.bannerText && (
            <div className="px-3 py-1 bg-slate-950/90 border-2 border-amber-400/80 text-[10px] sm:text-xs font-black tracking-widest uppercase text-amber-200 text-center max-w-full truncate">
              {hud.bannerText}
            </div>
          )}
        </div>
      </div>

      {/* INTERACTABLE PROMPT + NEXT WAVE QUICK ACTION */}
      <div className="flex flex-col items-center gap-2 mt-auto mb-1.5">
        {hud.nearbyPrompt && (
          <div
            className="pointer-events-auto ps1-panel px-3 py-2 max-w-[92vw] sm:max-w-md w-full border-2 flex items-center justify-between gap-3"
            style={{ borderColor: hud.nearbyPrompt.accentHex }}
            data-testid="nearby-prompt"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {hud.nearbyPrompt.badge && (
                  <span
                    className="px-1.5 py-0.5 text-[9px] font-black uppercase border border-slate-600 bg-slate-950"
                    style={{ color: hud.nearbyPrompt.accentHex }}
                  >
                    {hud.nearbyPrompt.badge}
                  </span>
                )}
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-100 truncate">
                  {hud.nearbyPrompt.title}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] sm:text-[11px] font-bold text-slate-300 leading-snug">
                {hud.nearbyPrompt.subtitle}
              </p>
              {hud.nearbyPrompt.swapWarning && (
                <p className="mt-0.5 text-[10px] font-black uppercase text-amber-300">
                  {hud.nearbyPrompt.swapWarning}
                </p>
              )}
            </div>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onInteract();
              }}
              className="ps1-button shrink-0 px-3 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-200 border-amber-400 cursor-pointer"
            >
              [E] {hud.nearbyPrompt.actionLabel}
            </button>
          </div>
        )}

        {(hud.waveRewardState === 'claiming' || hud.waveRewardState === 'ready') && (
          <button
            type="button"
            tabIndex={-1}
            data-testid="next-wave-btn"
            onClick={(e) => {
              e.currentTarget.blur();
              onStartNextWave();
            }}
            className={`pointer-events-auto ps1-button px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest cursor-pointer ${
              hud.waveRewardState === 'ready'
                ? 'border-emerald-400 text-emerald-200 bg-emerald-950/90'
                : 'border-slate-500 text-slate-200'
            }`}
          >
            {hud.wave >= hud.totalWavesInMap ? '[G] Summon Boss' : '[G] Start Next Wave'}
          </button>
        )}

        {/* BOTTOM HUD: Owned Arsenal Strip + Active Weapon Moveset */}
        {!hud.touchControlsEnabled && (
          <div className="flex flex-col items-center gap-1.5">
            {hud.ownedWeapons.length > 1 && (
              <div className="pointer-events-auto flex flex-wrap justify-center gap-1.5 max-w-[95vw]">
                {hud.ownedWeapons.map((wId, idx) => {
                  const active = wId === hud.weaponId;
                  return (
                    <button
                      key={wId}
                      type="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onSelectWeapon(wId);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1 border-2 text-[10px] font-black uppercase cursor-pointer ${
                        active
                          ? 'bg-slate-800 border-amber-400 text-amber-200'
                          : 'bg-slate-950/85 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                      title={`Equip ${WEAPONS[wId].name} (${idx + 1})`}
                    >
                      <span className="text-slate-400">{idx + 1}</span>
                      <WeaponIcon weaponId={wId} className="w-4 h-4" />
                      <span className="hidden sm:inline">{WEAPONS[wId].name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="ps1-panel px-3.5 py-2 flex items-center gap-4 max-w-[95vw]">
              <div className="flex items-center gap-2.5 pr-3 border-r border-slate-700">
                <WeaponIcon weaponId={hud.weaponId} className="w-8 h-8 shrink-0" />
                <div>
                  <div className="text-xs font-black tracking-wider uppercase text-slate-100 leading-tight">
                    {weapon.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[9px] font-black tracking-wider uppercase">
                    <span className="text-sky-300">T{weapon.tier}</span>
                    <span className={`px-1 border ${dmgBadge.className}`}>{dmgBadge.label}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="min-w-[88px]">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-300">
                    <span>[LMB] {weapon.primary.name}</span>
                  </div>
                  <div className="mt-1 h-2 bg-slate-950 border border-slate-700">
                    <div
                      className="h-full bg-sky-400"
                      style={{ width: `${Math.round((1 - hud.primaryCooldownRatio) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="min-w-[92px]">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-300">
                    <span>[RMB] {weapon.secondary.name}</span>
                  </div>
                  <div className="mt-1 h-2 bg-slate-950 border border-slate-700">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${Math.round((1 - hud.secondaryCooldownRatio) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="min-w-[74px] hidden sm:block">
                  <div className="text-[10px] font-bold uppercase text-slate-300 tabular-nums">
                    [SPC] Dash {hud.maxDashCharges > 1 ? `x${hud.dashCharges}` : ''}
                  </div>
                  <div className="mt-1 h-2 bg-slate-950 border border-slate-700">
                    <div
                      className="h-full bg-indigo-400"
                      style={{ width: `${Math.round((1 - hud.dashCooldownRatio) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
