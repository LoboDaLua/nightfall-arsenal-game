import { useRef, useState } from 'react';
import { WEAPONS } from '../game/rules';
import type { HudSnapshot } from '../game/types';
import { WeaponIcon } from './WeaponIcon';

interface TouchControlsProps {
  hud: HudSnapshot;
  onMove: (x: number, z: number) => void;
  onPrimary: () => void;
  onSecondary: () => void;
  onDash: () => void;
  onUsePotion: () => void;
  onCycleWeapon: () => void;
  onInteract: () => void;
  onStartNextWave: () => void;
}

export function TouchControls({
  hud,
  onMove,
  onPrimary,
  onSecondary,
  onDash,
  onUsePotion,
  onCycleWeapon,
  onInteract,
  onStartNextWave,
}: TouchControlsProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const weapon = WEAPONS[hud.weaponId];
  const maxRadius = 40;

  const updateStick = (clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    setKnob({ x: dx, y: dy });
    onMove(dx / maxRadius, dy / maxRadius);
  };

  const resetStick = () => {
    pointerIdRef.current = null;
    setKnob({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 p-3 sm:p-6 flex items-end justify-between pointer-events-none z-20"
      data-testid="touch-controls"
    >
      {/* Left Virtual Thumbstick */}
      <div
        ref={padRef}
        role="application"
        aria-label="Movement thumbstick"
        className="pointer-events-auto relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-slate-500/80 bg-slate-950/65 touch-none flex items-center justify-center"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          pointerIdRef.current = e.pointerId;
          updateStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (pointerIdRef.current === e.pointerId) {
            updateStick(e.clientX, e.clientY);
          }
        }}
        onPointerUp={(e) => {
          if (pointerIdRef.current === e.pointerId) resetStick();
        }}
        onPointerCancel={resetStick}
      >
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-sky-300 bg-sky-900/85 shadow-md"
          style={{
            transform: `translate(${knob.x}px, ${knob.y}px)`,
          }}
        />
      </div>

      {/* Center Compact Interact / Next Wave / Weapon Switch + Potion Button */}
      <div className="flex flex-col items-center gap-1.5 pb-1">
        {hud.nearbyPrompt && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInteract();
            }}
            onClick={onInteract}
            className="pointer-events-auto ps1-button px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-200 border-amber-400"
          >
            {hud.nearbyPrompt.actionLabel}
          </button>
        )}

        {(hud.waveRewardState === 'claiming' || hud.waveRewardState === 'ready') && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onStartNextWave();
            }}
            onClick={onStartNextWave}
            className="pointer-events-auto ps1-button px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-200 border-emerald-400"
          >
            {hud.wave >= hud.totalWavesInMap ? 'Summon Boss' : 'Next Wave'}
          </button>
        )}

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onUsePotion();
          }}
          onClick={onUsePotion}
          className={`pointer-events-auto ps1-button px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
            hud.potions > 0
              ? 'text-emerald-200 border-emerald-400'
              : 'text-slate-500 border-slate-700 opacity-75'
          }`}
        >
          Heal ({hud.potions})
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onCycleWeapon();
          }}
          onClick={onCycleWeapon}
          className="pointer-events-auto ps1-panel px-2.5 py-1 flex items-center gap-1.5 cursor-pointer"
          aria-label={`Active weapon ${weapon.name}, tap to swap`}
        >
          <WeaponIcon weaponId={hud.weaponId} className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] font-black uppercase text-slate-200 max-w-[96px] truncate">
            {weapon.name}
          </span>
        </button>
      </div>

      {/* Right Action Buttons Cluster */}
      <div className="pointer-events-auto grid grid-cols-2 gap-2 items-end">
        <button
          type="button"
          aria-label="Dash"
          onPointerDown={(e) => {
            e.preventDefault();
            onDash();
          }}
          onClick={onDash}
          className="ps1-button w-14 h-11 rounded-lg text-[10px] font-black uppercase tracking-wider text-indigo-200 border-indigo-400"
        >
          Dash
        </button>

        <button
          type="button"
          aria-label={`Secondary attack: ${weapon.secondary.name}`}
          onPointerDown={(e) => {
            e.preventDefault();
            onSecondary();
          }}
          onClick={onSecondary}
          className="ps1-button w-16 h-12 rounded-lg text-[10px] font-black uppercase tracking-wider text-amber-200 border-amber-400 flex flex-col items-center justify-center px-1 leading-tight"
        >
          <span>{weapon.secondary.name}</span>
        </button>

        <button
          type="button"
          aria-label={`Primary attack: ${weapon.primary.name}`}
          onPointerDown={(e) => {
            e.preventDefault();
            onPrimary();
          }}
          onClick={onPrimary}
          className="col-span-2 ps1-button h-12 rounded-lg text-xs font-black uppercase tracking-wider text-sky-100 border-sky-400"
        >
          {weapon.primary.name}
        </button>
      </div>
    </div>
  );
}
