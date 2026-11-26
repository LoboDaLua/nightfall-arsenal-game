import { useEffect, useRef, useState } from 'react';
import { CustomizationModal } from './components/CustomizationModal';
import { GameHud } from './components/GameHud';
import { GameOverModal, PauseModal, VictoryModal } from './components/Modals';
import { TitleScreen } from './components/TitleScreen';
import { TouchControls } from './components/TouchControls';
import { GameEngine } from './game/GameEngine';
import { BASE_PLAYER_MAX_HP, MAPS, createDefaultCustomization } from './game/rules';
import type { CharacterCustomization, HudSnapshot } from './game/types';

const INITIAL_HUD: HudSnapshot = {
  screen: 'title',
  mapId: 1,
  mapName: MAPS[1].name,
  mapSubtitle: MAPS[1].subtitle,
  hp: BASE_PLAYER_MAX_HP,
  maxHp: BASE_PLAYER_MAX_HP,
  shieldHp: 0,
  maxShieldHp: 0,
  hotRemaining: 0,
  potions: 1,
  maxPotions: 3,
  score: 0,
  bestScore: 0,
  noHitKills: 0,
  noHitScoreMult: 1,
  kills: 0,
  wave: 1,
  totalWavesInMap: MAPS[1].waves,
  waveKillsRemaining: 8,
  isBossWave: false,
  bossName: null,
  bossHp: 0,
  bossMaxHp: 0,
  combo: 0,
  weaponId: 'sword',
  ownedWeapons: ['sword'],
  wearableId: null,
  armorPct: 0,
  mrPct: 0,
  bansheeShieldReady: false,
  jakshoStacks: 0,
  fonStacks: 0,
  spellbladeReady: false,
  activeUpgrades: {},
  primaryCooldownRatio: 0,
  secondaryCooldownRatio: 0,
  dashCooldownRatio: 0,
  dashCharges: 1,
  maxDashCharges: 1,
  isBlocking: false,
  boosts: {
    speedTimer: 0,
    rageTimer: 0,
    shieldTimer: 0,
  },
  rushStacks: 0,
  elapsedSeconds: 0,
  activeEnemyCount: 0,
  bannerText: null,
  nearbyPrompt: null,
  waveRewardState: 'none',
  muted: false,
  touchControlsEnabled: false,
};

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [customization, setCustomization] = useState<CharacterCustomization>(() =>
    createDefaultCustomization()
  );
  const [customOpen, setCustomOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.modalOpen = customOpen ? 'true' : 'false';
    return () => {
      document.body.dataset.modalOpen = 'false';
    };
  }, [customOpen]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isCoarsePointer =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
    const params = new URLSearchParams(window.location.search);
    const forceTouch = params.get('touch') === '1';
    const autostart = params.get('autostart') === '1';

    const engine = new GameEngine(
      mount,
      (snapshot) => {
        setHud(snapshot);
      },
      isCoarsePointer || forceTouch,
      (look) => {
        setCustomization(look);
      }
    );
    engineRef.current = engine;

    if (autostart) {
      engine.startNewRun();
    }

    return () => {
      engineRef.current = null;
      engine.dispose();
    };
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#060913]">
      {/* Isolated WebGL Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {hud.screen === 'title' && (
        <TitleScreen
          bestScore={hud.bestScore}
          touchControlsEnabled={hud.touchControlsEnabled}
          onStart={() => engineRef.current?.startNewRun()}
          onOpenCustomize={() => setCustomOpen(true)}
          onToggleTouch={() =>
            engineRef.current?.setTouchControlsEnabled(!hud.touchControlsEnabled)
          }
        />
      )}

      {(hud.screen === 'playing' || hud.screen === 'paused') && (
        <GameHud
          hud={hud}
          onToggleMute={() => engineRef.current?.toggleMute()}
          onToggleTouch={() =>
            engineRef.current?.setTouchControlsEnabled(!hud.touchControlsEnabled)
          }
          onPause={() => engineRef.current?.pause()}
          onUsePotion={() => engineRef.current?.usePotion()}
          onSelectWeapon={(id) => engineRef.current?.equipWeapon(id)}
          onInteract={() => engineRef.current?.interactNearest()}
          onStartNextWave={() => engineRef.current?.triggerNextWave()}
        />
      )}

      {hud.screen === 'playing' && hud.touchControlsEnabled && (
        <TouchControls
          hud={hud}
          onMove={(x, z) => engineRef.current?.setTouchMove(x, z)}
          onPrimary={() => engineRef.current?.triggerPrimary()}
          onSecondary={() => engineRef.current?.triggerSecondary()}
          onDash={() => engineRef.current?.triggerDash()}
          onUsePotion={() => engineRef.current?.usePotion()}
          onCycleWeapon={() => engineRef.current?.cycleWeapon(1)}
          onInteract={() => engineRef.current?.interactNearest()}
          onStartNextWave={() => engineRef.current?.triggerNextWave()}
        />
      )}

      {hud.screen === 'paused' && (
        <PauseModal
          hud={hud}
          onResume={() => engineRef.current?.resume()}
          onRestart={() => engineRef.current?.startNewRun()}
          onTitle={() => engineRef.current?.returnToTitle()}
        />
      )}

      {hud.screen === 'gameover' && !customOpen && (
        <GameOverModal
          hud={hud}
          onRetry={() => engineRef.current?.startNewRun()}
          onOpenCustomize={() => setCustomOpen(true)}
          onTitle={() => engineRef.current?.returnToTitle()}
        />
      )}

      {hud.screen === 'victory' && !customOpen && (
        <VictoryModal
          hud={hud}
          onRetry={() => engineRef.current?.startNewRun()}
          onOpenCustomize={() => setCustomOpen(true)}
          onTitle={() => engineRef.current?.returnToTitle()}
        />
      )}

      {customOpen && (
        <CustomizationModal
          customization={customization}
          onUpdateCustomization={(custom) => engineRef.current?.setCustomization(custom)}
          onClose={() => setCustomOpen(false)}
        />
      )}
    </main>
  );
}
