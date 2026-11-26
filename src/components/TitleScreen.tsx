interface TitleScreenProps {
  bestScore: number;
  touchControlsEnabled: boolean;
  onStart: () => void;
  onOpenCustomize: () => void;
  onToggleTouch: () => void;
}

export function TitleScreen({
  bestScore,
  touchControlsEnabled,
  onStart,
  onOpenCustomize,
  onToggleTouch,
}: TitleScreenProps) {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-10 z-20">
      {/* Upper-Left Lockup over calm dark nocturnal sky */}
      <div className="max-w-xl pt-2 sm:pt-4 pointer-events-auto">
        <svg
          viewBox="0 0 420 118"
          className="w-full max-w-[400px] h-auto drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)]"
          role="img"
          aria-label="Nightfall Arsenal"
        >
          {/* Crescent Moon & Crossed Weapons Emblem */}
          <circle cx="48" cy="54" r="34" fill="#131c33" stroke="#7dd3fc" strokeWidth="2.5" />
          <path
            d="M52 25C36 27 25 40 25 56C25 71 36 83 51 85C41 79 36 68 36 55C36 42 42 31 52 25Z"
            fill="#dbeafe"
          />
          <path d="M36 74L72 30L76 34L40 78Z" fill="#f59e0b" stroke="#05070e" strokeWidth="2" />
          <path d="M35 34L75 74L71 78L31 38Z" fill="#7dd3fc" stroke="#05070e" strokeWidth="2" />

          {/* Title Wordmark */}
          <text
            x="98"
            y="53"
            fill="#f8fafc"
            stroke="#05070e"
            strokeWidth="5"
            paintOrder="stroke fill"
            fontFamily="ui-monospace, monospace"
            fontWeight="900"
            fontSize="36"
            letterSpacing="2"
          >
            NIGHTFALL
          </text>
          <text
            x="100"
            y="88"
            fill="#f59e0b"
            stroke="#05070e"
            strokeWidth="4.5"
            paintOrder="stroke fill"
            fontFamily="ui-monospace, monospace"
            fontWeight="900"
            fontSize="28"
            letterSpacing="5"
          >
            ARSENAL
          </text>
        </svg>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onStart();
            }}
            className="ps1-button px-7 py-3.5 text-base sm:text-lg font-black tracking-widest uppercase text-amber-200 border-amber-400 cursor-pointer"
          >
            Enter Clearing
          </button>

          <button
            type="button"
            data-testid="open-customize-btn"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenCustomize();
            }}
            className="ps1-button px-5 py-3.5 text-xs sm:text-sm font-black tracking-wider uppercase text-emerald-200 border-emerald-400 cursor-pointer"
          >
            Customize Look
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleTouch();
            }}
            aria-pressed={touchControlsEnabled}
            className={`ps1-button px-4 py-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase cursor-pointer ${
              touchControlsEnabled
                ? 'border-sky-400 text-sky-200 bg-sky-950/90'
                : 'border-slate-500 text-slate-300'
            }`}
          >
            Phone Controls: {touchControlsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold tracking-widest uppercase hud-text-stroke tabular-nums">
          {bestScore > 0 && <span className="text-slate-300">Best Score: {bestScore}</span>}
          <span className="text-sky-300">5 Realms · 25 Weapons · 8 Relics</span>
        </div>
      </div>

      {/* Bottom Safe-Margin Single Flat Control Hint */}
      <div className="w-full text-center pb-1">
        <p className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-slate-300/90 hud-text-stroke">
          WASD Move · LMB/J Primary · RMB/K Secondary · E Interact · G Next Wave · H Potion · Q/1-3 Swap · Space Dash · Esc Pause
        </p>
      </div>
    </div>
  );
}
