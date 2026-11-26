import type { WeaponId } from './types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private noiseBuffer: AudioBuffer | null = null;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(m: boolean): void {
    this.muted = m;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    if (!this.noiseBuffer && this.ctx) {
      const sampleRate = this.ctx.sampleRate;
      const len = Math.floor(sampleRate * 0.45);
      const buf = this.ctx.createBuffer(1, len, sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }
    return this.ctx;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    gainPeak: number,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const jitter = 0.94 + Math.random() * 0.12;
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freqStart * jitter), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(24, freqEnd * jitter), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoise(duration: number, filterFreq: number, q: number, gainPeak: number, delay = 0): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.setValueAtTime(q, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  public playAttack(weapon: WeaponId, secondary: boolean): void {
    switch (weapon) {
      case 'sword':
        if (secondary) {
          this.playNoise(0.16, 1800, 1.5, 0.16);
          this.playTone(540, 180, 0.14, 'sawtooth', 0.11);
        } else {
          this.playNoise(0.12, 2200, 1.2, 0.14);
          this.playTone(420, 150, 0.1, 'triangle', 0.09);
        }
        break;
      case 'club':
        if (secondary) {
          this.playTone(320, 480, 0.12, 'square', 0.11);
          this.playTone(620, 560, 0.16, 'triangle', 0.08, 0.02);
        } else {
          this.playNoise(0.18, 520, 0.9, 0.2);
          this.playTone(190, 58, 0.18, 'sawtooth', 0.16);
        }
        break;
      case 'chain':
        if (secondary) {
          this.playNoise(0.2, 2800, 2.5, 0.16);
          this.playTone(760, 240, 0.14, 'sawtooth', 0.1);
        } else {
          this.playNoise(0.24, 1900, 1.8, 0.15);
          this.playTone(340, 520, 0.18, 'square', 0.07);
        }
        break;
      case 'fangs':
        if (secondary) {
          this.playNoise(0.12, 3200, 2.4, 0.12);
          this.playTone(640, 920, 0.1, 'sine', 0.08);
        } else {
          this.playNoise(0.09, 2600, 2.0, 0.13);
          this.playTone(520, 310, 0.09, 'sawtooth', 0.08);
        }
        break;
      case 'pistol':
        if (secondary) {
          for (let i = 0; i < 3; i++) {
            this.playNoise(0.08, 1600, 0.8, 0.18, i * 0.045);
            this.playTone(260, 75, 0.08, 'square', 0.12, i * 0.045);
          }
        } else {
          this.playNoise(0.09, 1700, 0.9, 0.2);
          this.playTone(280, 70, 0.09, 'square', 0.14);
        }
        break;
      case 'sniper':
        if (secondary) {
          this.playTone(220, 360, 0.08, 'square', 0.1);
          this.playTone(740, 880, 0.07, 'sine', 0.08, 0.05);
        } else {
          this.playNoise(0.28, 1100, 0.7, 0.28);
          this.playTone(420, 48, 0.24, 'sawtooth', 0.22);
        }
        break;
      case 'axe':
        if (secondary) {
          this.playNoise(0.28, 950, 1.0, 0.22);
          this.playTone(220, 95, 0.22, 'sawtooth', 0.15);
        } else {
          this.playNoise(0.16, 750, 0.9, 0.2);
          this.playTone(240, 80, 0.15, 'sawtooth', 0.16);
        }
        break;
      case 'scythe':
        if (secondary) {
          this.playNoise(0.2, 2400, 1.8, 0.16);
          this.playTone(520, 260, 0.2, 'sine', 0.12);
        } else {
          this.playNoise(0.15, 2000, 1.6, 0.15);
          this.playTone(390, 180, 0.14, 'triangle', 0.11);
        }
        break;
      case 'shotgun':
        this.playNoise(secondary ? 0.26 : 0.22, 880, 0.65, 0.28);
        this.playTone(secondary ? 180 : 210, 45, 0.2, 'sawtooth', 0.22);
        break;
      case 'crossbow':
        this.playTone(secondary ? 580 : 680, 220, 0.1, 'triangle', 0.12);
        this.playNoise(0.08, 2800, 1.5, 0.12);
        break;
      case 'flamethrower':
        if (secondary) {
          this.playNoise(0.24, 650, 0.8, 0.2);
          this.playTone(310, 110, 0.2, 'sawtooth', 0.13);
        } else {
          this.playNoise(0.11, 1100, 0.9, 0.14);
        }
        break;
      case 'katana':
        this.playNoise(0.09, 3400, 2.2, 0.15);
        this.playTone(secondary ? 960 : 760, 320, 0.11, 'sine', 0.11);
        break;
      case 'halberd':
        this.playNoise(0.16, 1500, 1.3, 0.18);
        this.playTone(secondary ? 460 : 320, 110, 0.15, 'sawtooth', 0.14);
        break;
      case 'chakram':
        this.playNoise(0.12, 3000, 2.2, 0.14);
        this.playTone(720, 1080, 0.12, 'triangle', 0.1);
        break;
      case 'railgun':
        this.playNoise(0.22, 2200, 1.0, 0.24);
        this.playTone(secondary ? 280 : 940, secondary ? 80 : 190, 0.2, 'sawtooth', 0.18);
        break;
      case 'grimoire':
        this.playTone(secondary ? 380 : 540, 210, 0.16, 'sine', 0.13);
        this.playNoise(0.14, 1400, 1.4, 0.11);
        break;
      case 'minigun':
        this.playNoise(0.06, 1500, 0.8, 0.16);
        this.playTone(230, 85, 0.06, 'square', 0.11);
        break;
      case 'greatsword':
        this.playNoise(0.24, 620, 0.8, 0.26);
        this.playTone(secondary ? 140 : 190, 48, 0.24, 'sawtooth', 0.2);
        break;
      case 'arcane_staff':
        this.playTone(secondary ? 320 : 680, secondary ? 120 : 1120, secondary ? 0.24 : 0.14, 'sine', 0.13);
        this.playNoise(0.12, 2400, 1.8, 0.1);
        break;
      case 'void_orb':
        this.playTone(secondary ? 240 : 180, secondary ? 60 : 95, secondary ? 0.28 : 0.22, 'sawtooth', 0.15);
        this.playNoise(0.18, 420, 1.2, 0.15);
        break;
      case 'stormcaller_wand':
        this.playNoise(secondary ? 0.26 : 0.12, 3400, 1.4, secondary ? 0.24 : 0.16);
        this.playTone(secondary ? 480 : 980, secondary ? 110 : 420, 0.14, 'square', 0.12);
        break;
      case 'frostbrand':
        this.playNoise(0.14, 2800, 2.0, 0.16);
        this.playTone(secondary ? 540 : 760, 290, 0.15, 'triangle', 0.13);
        break;
      case 'cursed_censer':
        this.playNoise(0.18, 1300, 1.5, 0.14);
        this.playTone(secondary ? 280 : 420, 190, 0.18, 'sine', 0.12);
        break;
      case 'runic_gauntlets':
        this.playNoise(0.1, 900, 0.9, 0.18);
        this.playTone(secondary ? 260 : 340, 90, 0.12, 'sawtooth', 0.15);
        break;
      case 'starfire_bow':
        this.playTone(secondary ? 640 : 880, secondary ? 320 : 1420, 0.14, 'triangle', 0.13);
        this.playNoise(0.1, 2900, 1.8, 0.12);
        break;
    }
  }

  public playHit(weakPoint: boolean, armored: boolean): void {
    if (weakPoint) {
      this.playTone(680, 1280, 0.14, 'square', 0.14);
      this.playNoise(0.14, 2100, 1.1, 0.18);
    } else if (armored) {
      this.playTone(980, 1340, 0.09, 'triangle', 0.12);
      this.playNoise(0.06, 3600, 3.0, 0.1);
    } else {
      this.playNoise(0.09, 950, 1.0, 0.14);
      this.playTone(170, 68, 0.1, 'triangle', 0.13);
    }
  }

  public playExplosion(): void {
    this.playNoise(0.32, 340, 0.7, 0.3);
    this.playTone(140, 36, 0.3, 'sawtooth', 0.24);
  }

  public playKill(): void {
    this.playNoise(0.18, 700, 0.8, 0.18);
    this.playTone(210, 52, 0.18, 'sawtooth', 0.15);
  }

  public playPickup(): void {
    this.playTone(440, 587, 0.08, 'square', 0.1);
    this.playTone(587, 880, 0.12, 'square', 0.1, 0.07);
  }

  public playPedestalClaim(): void {
    this.playTone(523, 784, 0.1, 'triangle', 0.11);
    this.playTone(784, 1175, 0.14, 'sine', 0.11, 0.06);
  }

  public playPortalWarp(): void {
    this.playNoise(0.32, 1600, 1.2, 0.16);
    this.playTone(220, 880, 0.34, 'sine', 0.15);
    this.playTone(330, 1320, 0.28, 'triangle', 0.12, 0.08);
  }

  public playSpellShieldPop(): void {
    this.playTone(1046, 440, 0.16, 'sine', 0.14);
    this.playNoise(0.14, 2800, 2.0, 0.13);
  }

  public playMagicZap(): void {
    this.playTone(960, 420, 0.09, 'square', 0.09);
  }

  public playHeal(): void {
    this.playTone(523, 659, 0.09, 'sine', 0.11);
    this.playTone(659, 1046, 0.14, 'sine', 0.11, 0.07);
  }

  public playPotion(): void {
    this.playTone(440, 660, 0.1, 'sine', 0.12);
    this.playTone(660, 880, 0.14, 'triangle', 0.1, 0.08);
  }

  public playBoost(): void {
    this.playTone(330, 660, 0.1, 'triangle', 0.11);
    this.playTone(495, 990, 0.14, 'triangle', 0.11, 0.07);
    this.playTone(660, 1320, 0.16, 'sine', 0.1, 0.13);
  }

  public playUpgrade(): void {
    this.playTone(440, 660, 0.08, 'square', 0.09);
    this.playTone(660, 990, 0.1, 'square', 0.09, 0.06);
  }

  public playChest(): void {
    this.playTone(392, 523, 0.1, 'square', 0.1);
    this.playTone(523, 784, 0.14, 'square', 0.11, 0.09);
    this.playTone(784, 1046, 0.18, 'sine', 0.11, 0.18);
  }

  public playBossRoar(): void {
    this.playNoise(0.45, 280, 0.7, 0.28);
    this.playTone(110, 42, 0.45, 'sawtooth', 0.24);
  }

  public playVictory(): void {
    this.playTone(523, 659, 0.12, 'triangle', 0.12);
    this.playTone(659, 784, 0.14, 'triangle', 0.12, 0.12);
    this.playTone(784, 1046, 0.28, 'sine', 0.14, 0.24);
  }

  public playDash(): void {
    this.playNoise(0.11, 1400, 1.3, 0.12);
    this.playTone(260, 420, 0.09, 'triangle', 0.07);
  }

  public playTrapSnap(): void {
    this.playNoise(0.15, 2400, 1.5, 0.2);
    this.playTone(480, 120, 0.15, 'square', 0.15);
  }

  public playBlockParry(): void {
    this.playTone(780, 540, 0.14, 'square', 0.16);
    this.playTone(1160, 880, 0.12, 'triangle', 0.12, 0.02);
  }

  public playPlayerHurt(): void {
    this.playTone(150, 55, 0.22, 'sawtooth', 0.2);
    this.playNoise(0.16, 480, 0.9, 0.18);
  }

  public playWaveStart(): void {
    this.playTone(220, 330, 0.18, 'triangle', 0.12);
    this.playTone(330, 440, 0.24, 'triangle', 0.12, 0.14);
  }

  public playGameOver(): void {
    this.playTone(260, 196, 0.22, 'sawtooth', 0.15);
    this.playTone(196, 130, 0.35, 'sawtooth', 0.16, 0.2);
  }
}

export const soundEngine = new SoundEngine();
