import type { HudSnapshot } from '../game/types';

interface PauseModalProps {
  hud: HudSnapshot;
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export function PauseModal({ hud, onResume, onRestart, onTitle }: PauseModalProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="ps1-panel w-full max-w-sm p-6 text-center">
        <h2
          id="pause-title"
          className="text-2xl font-black tracking-widest uppercase text-amber-300"
        >
          PAUSED
        </h2>
        <div className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-300 tabular-nums">
          Map {hud.mapId}: {hud.mapName}
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="ps1-button py-3 text-sm font-black tracking-widest uppercase text-sky-200 border-sky-400 cursor-pointer"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="ps1-button py-3 text-sm font-black tracking-widest uppercase text-slate-200 cursor-pointer"
          >
            Restart Run
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="ps1-button py-3 text-sm font-black tracking-widest uppercase text-slate-300 border-slate-600 cursor-pointer"
          >
            Title Screen
          </button>
        </div>
      </div>
    </div>
  );
}

interface EndRunModalProps {
  hud: HudSnapshot;
  onRetry: () => void;
  onOpenCustomize: () => void;
  onTitle: () => void;
}

export function GameOverModal({ hud, onRetry, onOpenCustomize, onTitle }: EndRunModalProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
    >
      <div className="ps1-panel w-full max-w-md p-6 text-center">
        <h2
          id="gameover-title"
          className="text-3xl font-black tracking-widest uppercase text-rose-400"
        >
          FALLEN IN THE NIGHT
        </h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Map {hud.mapId}: {hud.mapName}
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-slate-950/85 border border-slate-700 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              MAP / WAVE
            </div>
            <div className="text-lg font-black text-amber-300 tabular-nums mt-0.5">
              {hud.mapId}-{hud.wave}
            </div>
          </div>

          <div className="bg-slate-950/85 border border-slate-700 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              SLAIN
            </div>
            <div className="text-lg font-black text-sky-300 tabular-nums mt-0.5">
              {hud.kills}
            </div>
          </div>

          <div className="bg-slate-950/85 border border-slate-700 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              WEAPONS
            </div>
            <div className="text-lg font-black text-emerald-300 tabular-nums mt-0.5">
              {hud.ownedWeapons.length}
            </div>
          </div>

          <div className="bg-slate-950/85 border border-slate-700 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              UPGRADES
            </div>
            <div className="text-lg font-black text-purple-300 tabular-nums mt-0.5">
              {Object.values(hud.activeUpgrades).reduce((a, b) => a + (b ?? 0), 0)}
            </div>
          </div>
        </div>

        <div className="mt-3 bg-slate-950/85 border border-slate-700 p-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            SCORE / BEST
          </span>
          <span className="text-lg font-black text-slate-100 tabular-nums">
            {hud.score} / {hud.bestScore}
          </span>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            data-start="true"
            onClick={onRetry}
            className="flex-1 ps1-button py-3 text-sm font-black tracking-widest uppercase text-amber-200 border-amber-400 cursor-pointer"
          >
            New Run
          </button>
          <button
            type="button"
            onClick={onOpenCustomize}
            className="flex-1 ps1-button py-3 text-sm font-black tracking-widest uppercase text-emerald-200 border-emerald-400 cursor-pointer"
          >
            Look
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="flex-1 ps1-button py-3 text-sm font-black tracking-widest uppercase text-slate-300 border-slate-600 cursor-pointer"
          >
            Title
          </button>
        </div>
      </div>
    </div>
  );
}

export function VictoryModal({ hud, onRetry, onOpenCustomize, onTitle }: EndRunModalProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      data-testid="victory-modal"
    >
      <div className="ps1-panel w-full max-w-md p-6 text-center border-amber-400">
        <h2
          id="victory-title"
          className="text-3xl font-black tracking-widest uppercase text-amber-300"
        >
          ABYSS CONQUERED
        </h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
          Satan Has Fallen · All 5 Realms Cleared
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/85 border border-slate-700 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              SLAIN
            </div>
            <div className="text-xl font-black text-sky-300 tabular-nums mt-0.5">
              {hud.kills}
            </div>
          </div>

          <div className="bg-slate-950/85 border border-slate-700 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              ARSENAL
            </div>
            <div className="text-xl font-black text-emerald-300 tabular-nums mt-0.5">
              {hud.ownedWeapons.length}
            </div>
          </div>

          <div className="bg-slate-950/85 border border-slate-700 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              TIME
            </div>
            <div className="text-xl font-black text-amber-300 tabular-nums mt-0.5">
              {Math.floor(hud.elapsedSeconds)}s
            </div>
          </div>
        </div>

        <div className="mt-3 bg-slate-950/85 border border-slate-700 p-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            FINAL SCORE / BEST
          </span>
          <span className="text-lg font-black text-amber-200 tabular-nums">
            {hud.score} / {hud.bestScore}
          </span>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            data-start="true"
            onClick={onRetry}
            className="flex-1 ps1-button py-3 text-sm font-black tracking-widest uppercase text-amber-200 border-amber-400 cursor-pointer"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onOpenCustomize}
            className="flex-1 ps1-button py-3 text-sm font-black tracking-widest uppercase text-emerald-200 border-emerald-400 cursor-pointer"
          >
            Look
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="flex-1 ps1-button py-3 text-sm font-black tracking-widest uppercase text-slate-300 border-slate-600 cursor-pointer"
          >
            Title
          </button>
        </div>
      </div>
    </div>
  );
}
