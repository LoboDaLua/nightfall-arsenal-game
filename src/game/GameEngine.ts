import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { soundEngine } from './audio';
import {
  createAcidPoolMesh,
  createChestMesh,
  createContactShadow,
  createEnemyRig,
  createMapArena,
  createNextWaveRuneMesh,
  createPedestalMesh,
  createPickupPropMesh,
  createPlayerRig,
  createShrineMesh,
  createSnareTrapMesh,
  createWeaponMesh,
  type ArenaEnvironment,
  type EnemyRig,
  type PlayerRig,
} from './models';
import {
  ARENA_RADIUS,
  ENEMY_ARCHETYPES,
  ENEMY_HEALTHBAR_VISIBLE_SECONDS,
  MAPS,
  MAX_ATTACK_TOKENS,
  MAX_EQUIPPED_WEAPONS,
  PLAYER_DASH_DURATION,
  PLAYER_DASH_SPEED,
  PLAYER_RADIUS,
  UPGRADE_TREE,
  WEAPONS,
  WEARABLES,
  buildWavePlan,
  clampDt,
  clampToArena,
  computeEnemyDamage,
  computeNoHitScoreMultiplier,
  computeOffscreenSpawnPoint,
  computePlayerDamageTaken,
  computeRunStats,
  computeSnapVelocity,
  createDefaultCustomization,
  distancePointToSegment2D,
  generateBossShrineChoices,
  generateWaveRewardPedestals,
  isPointInCone,
  normalize2D,
  rollChestPotions,
  rollEnemyDrops,
  sanitizeCustomization,
  shortestAngleDiff,
  type WavePlan,
} from './rules';
import { createProceduralTextures, type ProceduralTextures } from './textures';
import type {
  CharacterCustomization,
  DamageType,
  EnemyKind,
  GameScreenState,
  HudSnapshot,
  MapId,
  NearbyInteractableSnapshot,
  PedestalRewardItem,
  PickupKind,
  UpgradeNodeId,
  WaveRewardState,
  WeaponId,
  WearableId,
} from './types';

interface ActiveEnemy {
  id: number;
  kind: EnemyKind;
  rig: EnemyRig;
  x: number;
  z: number;
  vx: number;
  vz: number;
  facing: number;
  hp: number;
  maxHp: number;
  ghostHp: number;
  recentHitTimer: number;
  lastHitWasWeakPoint: boolean;
  damageMult: number;
  speedMult: number;
  state: 'chase' | 'windup' | 'attack' | 'recover' | 'leap' | 'phase' | 'ko';
  stateTimer: number;
  attackCooldown: number;
  hasToken: boolean;
  hitFlashTimer: number;
  poisonTicks: number;
  poisonTickTimer: number;
  chillTimer: number;
  rootTimer: number;
  coreExposedTimer: number;
  phaseCooldown: number;
  projDodgeCounter: number;
  leapStartX: number;
  leapStartZ: number;
  leapTargetX: number;
  leapTargetZ: number;
  webLine: THREE.Line | null;
  telegraphRing: THREE.Mesh | null;
  burstShotsLeft: number;
  burstTimer: number;
  bossPattern: number;
  koTimer: number;
  squashY: number;
}

type ProjectileKind =
  | 'pistol'
  | 'sniper'
  | 'fang'
  | 'scythe_wave'
  | 'shotgun'
  | 'slug'
  | 'bolt'
  | 'blast_bolt'
  | 'flame'
  | 'fireball'
  | 'chakram'
  | 'rail'
  | 'skull'
  | 'soul_bolt'
  | 'arc_crescent'
  | 'arcane_bolt'
  | 'void_orb'
  | 'frost_wave'
  | 'blight_wave'
  | 'star_arrow'
  | 'star_shard'
  | 'palm_wave'
  | 'enemy_bullet'
  | 'enemy_sniper'
  | 'enemy_arrow'
  | 'enemy_acid'
  | 'enemy_fire'
  | 'enemy_boulder'
  | 'enemy_green_orb'
  | 'enemy_wisp'
  | 'enemy_blight'
  | 'enemy_flask'
  | 'enemy_paladin_wave';

interface Projectile {
  active: boolean;
  fromPlayer: boolean;
  kind: ProjectileKind;
  damageType: DamageType;
  x: number;
  z: number;
  vx: number;
  vz: number;
  damage: number;
  knockback: number;
  life: number;
  maxLife: number;
  radius: number;
  pierce: boolean;
  bouncesLeft: number;
  homing: boolean;
  tickAccum: number;
  hitIds: Set<number>;
  mesh: THREE.Mesh;
}

interface WorldPickup {
  id: number;
  kind: PickupKind;
  x: number;
  z: number;
  vx: number;
  vz: number;
  vy: number;
  y: number;
  life: number;
  group: THREE.Group;
  propMesh: THREE.Group;
  ringMesh: THREE.Mesh;
}

interface HazardZone {
  x: number;
  z: number;
  radius: number;
  life: number;
  tickTimer: number;
  damage: number;
  damageType: DamageType;
  fromPlayer: boolean;
  chill: boolean;
  isMeteor: boolean;
  detonated: boolean;
  colorHex: number;
  mesh: THREE.Mesh;
}

interface ActiveTrap {
  id: number;
  x: number;
  z: number;
  life: number;
  mesh: THREE.Group;
}

interface SlashVfx {
  mesh: THREE.Mesh;
  timer: number;
  maxTimer: number;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
}

interface ActivePedestal {
  id: number;
  x: number;
  z: number;
  reward: PedestalRewardItem;
  claimed: boolean;
  sinking: boolean;
  sinkProgress: number;
  riseProgress: number;
  root: THREE.Group;
  displayGroup: THREE.Group;
  ring: THREE.Mesh;
}

interface ActiveChest {
  id: number;
  x: number;
  z: number;
  opened: boolean;
  riseProgress: number;
  root: THREE.Group;
  lidGroup: THREE.Group;
}

interface ActiveShrine {
  id: number;
  x: number;
  z: number;
  nodeId: UpgradeNodeId;
  claimed: boolean;
  sinking: boolean;
  sinkProgress: number;
  riseProgress: number;
  root: THREE.Group;
  crystal: THREE.Mesh;
}

interface LifebarDomSlot {
  root: HTMLDivElement;
  statusRow: HTMLDivElement;
  ghostBar: HTMLDivElement;
  hpBar: HTMLDivElement;
}

interface DamagePopupSlot {
  el: HTMLDivElement;
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const PARTICLE_POOL_SIZE = 160;
const PROJECTILE_POOL_SIZE = 84;
const LIFEBAR_POOL_SIZE = 22;
const POPUP_POOL_SIZE = 32;
const PORTAL_PAD_X = 0;
const PORTAL_PAD_Z = -18.6;
const BEST_SCORE_KEY = 'nightfall_arsenal_best_v1';
const LOOK_STORAGE_KEY = 'nightfall_arsenal_look_v2';

const _vec3 = new THREE.Vector3();
const _projVec = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scaleVec = new THREE.Vector3();
const _color = new THREE.Color();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _mouseNdc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

export class GameEngine {
  private container: HTMLElement;
  private onHudUpdate: (snapshot: HudSnapshot) => void;
  private onLookUpdate?: (custom: CharacterCustomization) => void;

  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private textures: ProceduralTextures;
  private envRT: THREE.WebGLRenderTarget;
  private clock = new THREE.Clock();

  private combatOverlayRoot: HTMLDivElement;
  private warpFlashOverlay: HTMLDivElement;
  private lifebarPool: LifebarDomSlot[] = [];
  private popupPool: DamagePopupSlot[] = [];
  private popupCursor = 0;

  private playerRig: PlayerRig;
  private arena: ArenaEnvironment;
  private playerAimLine: THREE.Line;

  private particles: Particle[] = [];
  private particleCursor = 0;
  private particleInstanced: THREE.InstancedMesh;

  private projectiles: Projectile[] = [];
  private enemies: ActiveEnemy[] = [];
  private pickups: WorldPickup[] = [];
  private hazards: HazardZone[] = [];
  private traps: ActiveTrap[] = [];
  private slashVfxs: SlashVfx[] = [];
  private pedestals: ActivePedestal[] = [];
  private chests: ActiveChest[] = [];
  private shrines: ActiveShrine[] = [];
  private nextWaveRune: { x: number; z: number; mesh: THREE.Group } | null = null;
  private activeAttackTokens = 0;
  private nextEntityId = 1;

  // Permanent Appearance & High Score ONLY (run stats reset every run!)
  private customization: CharacterCustomization = createDefaultCustomization();
  private bestScore = 0;

  // Per-Run Progression & State (resets every run)
  private screen: GameScreenState = 'title';
  private mapId: MapId = 1;
  private ownedWeapons: WeaponId[] = ['sword'];
  private wearableId: WearableId | null = null;
  private activeUpgrades: Partial<Record<UpgradeNodeId, number>> = {};

  // LoL-Inspired Wearable Passives
  private bansheeReady = true;
  private bansheeCooldown = 0;
  private jakshoStacks = 0;
  private jakshoTimer = 0;
  private jakshoDrained = false;
  private jakshoResetTimer = 0;
  private fonStacks = 0;
  private fonTimer = 0;
  private spellbladeReady = false;
  private sunfireTimer = 0;
  private sunfireTicks = 0;

  // In-World Reward & Portal State
  private waveRewardState: WaveRewardState = 'none';
  private waveClearDelayTimer = 0;
  private pedestalClaimed = false;
  private chestOpened = false;
  private shrineClaimed = false;
  private portalActive = false;
  private portalWarpTimer = 0;

  private playerX = 0;
  private playerZ = 0;
  private playerVx = 0;
  private playerVz = 0;
  private playerFacing = 0;
  private playerHp = 80;
  private playerMaxHp = 80;
  private shieldHp = 0;
  private shieldRegenDelay = 0;
  private hotRemaining = 0;
  private hotRate = 7.5;
  private potions = 1;
  private playerInvulnTimer = 0;
  private playerHitFlashTimer = 0;
  private playerWalkCycle = 0;
  private playerSquashY = 1;

  private weaponId: WeaponId = 'sword';
  private primaryCooldown = 0;
  private secondaryCooldown = 0;
  private attackPhase: 'idle' | 'windup' | 'active' | 'recovery' = 'idle';
  private attackIsSecondary = false;
  private attackPhaseTimer = 0;
  private attackHitIds = new Set<number>();
  private attackCount = 0;
  private gauntletComboStep = 0;
  private orbitalTimer = 0;
  private blockTimer = 0;
  private dashTimer = 0;
  private dashCharges = 1;
  private dashRechargeTimer = 0;
  private dashDirX = 0;
  private dashDirZ = 1;

  private boostSpeedTimer = 0;
  private boostRageTimer = 0;
  private boostShieldTimer = 0;
  private rushStacks = 0;
  private rushTimer = 0;

  // Input & buffering
  private keys = new Set<string>();
  private pointerWorldX = 0;
  private pointerWorldZ = 4;
  private hasMouseMoved = false;
  private bufferedPrimary = 0;
  private bufferedSecondary = 0;
  private bufferedDash = 0;
  private touchMoveX = 0;
  private touchMoveZ = 0;
  private touchAimX = 0;
  private touchAimZ = 0;
  private touchControlsEnabled = false;

  // Wave & score state
  private wave = 1;
  private wavePlan: WavePlan = buildWavePlan(1, 1);
  private waveSpawned = 0;
  private waveKills = 0;
  private isBossWave = false;
  private spawnTimer = 0.25;
  private score = 0;
  private kills = 0;
  private noHitKills = 0;
  private combo = 0;
  private comboTimer = 0;
  private elapsedSeconds = 0;
  private bannerText: string | null = null;
  private bannerTimer = 0;

  private hitstopTimer = 0;
  private cameraTrauma = 0;
  private titleOrbitAngle = 0;
  private camPos = new THREE.Vector3(0, 16, 15);
  private camLook = new THREE.Vector3(0, 0.8, 0);

  private frameId = 0;
  private disposed = false;
  private hudEmitAccum = 0;
  private resizeObserver: ResizeObserver;

  constructor(
    container: HTMLElement,
    onHudUpdate: (snapshot: HudSnapshot) => void,
    initialTouchMode = false,
    onLookUpdate?: (custom: CharacterCustomization) => void
  ) {
    this.container = container;
    this.onHudUpdate = onHudUpdate;
    this.onLookUpdate = onLookUpdate;
    this.touchControlsEnabled = initialTouchMode;

    this.loadPersistence();

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const rect = container.getBoundingClientRect();
    const w = Math.max(1, rect.width || window.innerWidth);
    const h = Math.max(1, rect.height || window.innerHeight);
    this.renderer.setSize(w, h);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.setAttribute('data-testid', 'game-canvas');
    container.appendChild(this.renderer.domElement);

    // Lightweight pooled DOM overlay for crisp PS1 world-space lifebars & damage numbers
    this.combatOverlayRoot = document.createElement('div');
    this.combatOverlayRoot.style.cssText =
      'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:5;';
    this.combatOverlayRoot.setAttribute('data-testid', 'combat-overlay');
    container.appendChild(this.combatOverlayRoot);

    this.warpFlashOverlay = document.createElement('div');
    this.warpFlashOverlay.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:6;opacity:0;transition:opacity 180ms ease-out;background:radial-gradient(circle,#e9d5ff 0%,#7c3aed 65%,#05070e 100%);';
    container.appendChild(this.warpFlashOverlay);

    this.initCombatDomPools();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(46, w / h, 0.5, 120);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    pmrem.dispose();

    const hemi = new THREE.HemisphereLight(0x5b7db8, 0x161b26, 0.95);
    this.scene.add(hemi);

    const moonLight = new THREE.DirectionalLight(0xa5c8ff, 1.85);
    moonLight.position.set(-18, 28, -14);
    if (!this.isSoftwareGl) {
      moonLight.castShadow = true;
      moonLight.shadow.mapSize.set(1024, 1024);
      moonLight.shadow.camera.near = 2;
      moonLight.shadow.camera.far = 75;
      const d = 24;
      moonLight.shadow.camera.left = -d;
      moonLight.shadow.camera.right = d;
      moonLight.shadow.camera.top = d;
      moonLight.shadow.camera.bottom = -d;
      moonLight.shadow.bias = -0.0005;
      moonLight.shadow.normalBias = 0.02;
    }
    this.scene.add(moonLight);

    const rimLight = new THREE.DirectionalLight(0xff8e53, 0.55);
    rimLight.position.set(16, 12, 18);
    this.scene.add(rimLight);

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextures(maxAniso);
    this.arena = createMapArena(1, this.textures, this.isSoftwareGl);
    this.scene.add(this.arena.group);
    this.applyMapAtmosphere(1);

    this.playerRig = createPlayerRig(this.textures, this.customization);
    this.scene.add(this.playerRig.root);

    const aimGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 1.0, 0.6),
      new THREE.Vector3(0, 1.0, 22),
    ]);
    this.playerAimLine = new THREE.Line(
      aimGeo,
      new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.55 })
    );
    this.playerAimLine.visible = false;
    this.playerRig.root.add(this.playerAimLine);

    const partGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const partMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.particleInstanced = new THREE.InstancedMesh(partGeo, partMat, PARTICLE_POOL_SIZE);
    this.particleInstanced.frustumCulled = false;
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      this.particles.push({
        active: false, x: 0, y: -50, z: 0, vx: 0, vy: 0, vz: 0,
        life: 0, maxLife: 0.4, size: 1, color: new THREE.Color(0xffffff),
      });
      _mat4.makeTranslation(0, -50, 0);
      this.particleInstanced.setMatrixAt(i, _mat4);
      this.particleInstanced.setColorAt(i, _color.setHex(0xffffff));
    }
    this.particleInstanced.instanceMatrix.needsUpdate = true;
    if (this.particleInstanced.instanceColor) this.particleInstanced.instanceColor.needsUpdate = true;
    this.scene.add(this.particleInstanced);

    const projGeo = new THREE.OctahedronGeometry(0.22, 0);
    for (let i = 0; i < PROJECTILE_POOL_SIZE; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const mesh = new THREE.Mesh(projGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.projectiles.push({
        active: false, fromPlayer: true, kind: 'pistol', damageType: 'physical',
        x: 0, z: 0, vx: 0, vz: 0, damage: 25, knockback: 4,
        life: 0, maxLife: 1, radius: 0.25, pierce: false, bouncesLeft: 0, homing: false,
        tickAccum: 0, hitIds: new Set(), mesh,
      });
    }

    this.spawnTitleShowcaseActors();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cw = Math.max(1, Math.floor(entry.contentRect.width));
        const ch = Math.max(1, Math.floor(entry.contentRect.height));
        this.camera.aspect = cw / ch;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(cw, ch);
      }
    });
    this.resizeObserver.observe(container);

    this.bindInputListeners();
    this.syncBodyState();
    this.emitHud();
    this.emitLook();
    this.startLoop();
  }

  private initCombatDomPools(): void {
    for (let i = 0; i < LIFEBAR_POOL_SIZE; i++) {
      const root = document.createElement('div');
      root.style.cssText =
        'position:absolute;left:0;top:0;width:52px;display:none;will-change:transform;';
      root.setAttribute('data-testid', 'enemy-lifebar');

      const statusRow = document.createElement('div');
      statusRow.style.cssText =
        'font-size:9px;font-weight:900;line-height:1;display:flex;gap:3px;justify-content:center;margin-bottom:2px;text-shadow:-1px -1px 0 #05070e,1px 1px 0 #05070e;';

      const frame = document.createElement('div');
      frame.style.cssText =
        'position:relative;width:100%;height:7px;background:#090d16;border:2px solid #05070e;box-shadow:0 2px 4px rgba(0,0,0,0.85);overflow:hidden;';

      const ghostBar = document.createElement('div');
      ghostBar.style.cssText =
        'position:absolute;inset:0;background:#f8fafc;transform-origin:left center;transform:scaleX(1);';

      const hpBar = document.createElement('div');
      hpBar.style.cssText =
        'position:absolute;inset:0;background:#ef4444;transform-origin:left center;transform:scaleX(1);';

      frame.append(ghostBar, hpBar);
      root.append(statusRow, frame);
      this.combatOverlayRoot.appendChild(root);
      this.lifebarPool.push({ root, statusRow, ghostBar, hpBar });
    }

    for (let i = 0; i < POPUP_POOL_SIZE; i++) {
      const el = document.createElement('div');
      el.style.cssText =
        'position:absolute;left:0;top:0;display:none;font-family:ui-monospace,monospace;font-weight:900;white-space:nowrap;will-change:transform,opacity;text-shadow:-2px -2px 0 #05070e,2px -2px 0 #05070e,-2px 2px 0 #05070e,2px 2px 0 #05070e;';
      el.setAttribute('data-testid', 'damage-popup');
      this.combatOverlayRoot.appendChild(el);
      this.popupPool.push({
        el,
        active: false,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.7,
      });
    }
  }

  private hideAllCombatDom(): void {
    for (const bar of this.lifebarPool) {
      bar.root.style.display = 'none';
    }
    for (const p of this.popupPool) {
      p.active = false;
      p.el.style.display = 'none';
    }
  }

  private spawnDamagePopup(
    x: number,
    y: number,
    z: number,
    text: string,
    opts: { color: string; fontSize?: number; duration?: number }
  ): void {
    const slot = this.popupPool[this.popupCursor];
    this.popupCursor = (this.popupCursor + 1) % POPUP_POOL_SIZE;
    slot.active = true;
    slot.x = x + (Math.random() - 0.5) * 0.65;
    slot.y = y;
    slot.z = z + (Math.random() - 0.5) * 0.45;
    slot.vx = (Math.random() - 0.5) * 1.1;
    slot.vy = 2.6 + Math.random() * 0.8;
    slot.maxLife = opts.duration ?? 0.68;
    slot.life = slot.maxLife;
    slot.el.textContent = text;
    slot.el.style.color = opts.color;
    slot.el.style.fontSize = `${opts.fontSize ?? 14}px`;
    slot.el.style.opacity = '1';
    slot.el.style.display = 'block';
  }

  private updateCombatOverlay(dt: number): void {
    if (this.screen !== 'playing') {
      for (const bar of this.lifebarPool) bar.root.style.display = 'none';
      for (const p of this.popupPool) {
        if (!p.active) continue;
        p.el.style.display = 'none';
      }
      return;
    }

    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    // 1. Update Recently Hit Non-Boss Enemy Lifebars
    let barIdx = 0;
    for (const e of this.enemies) {
      if (barIdx >= LIFEBAR_POOL_SIZE) break;
      const spec = ENEMY_ARCHETYPES[e.kind];
      if (spec.isBoss || e.state === 'ko' || e.recentHitTimer <= 0 || e.hp >= e.maxHp) {
        continue;
      }
      _projVec.set(e.x, spec.hasWeakPoint ? 2.45 : 2.1, e.z);
      _projVec.project(this.camera);
      if (_projVec.z < -1 || _projVec.z > 1) continue;

      const sx = (_projVec.x * 0.5 + 0.5) * w;
      const sy = (-_projVec.y * 0.5 + 0.5) * h;
      if (sx < -60 || sx > w + 60 || sy < -40 || sy > h + 40) continue;

      const slot = this.lifebarPool[barIdx++];
      slot.root.style.display = 'block';
      slot.root.style.transform = `translate3d(${Math.round(sx - 26)}px,${Math.round(sy)}px,0)`;
      const hpRatio = Math.max(0, Math.min(1, e.hp / Math.max(1, e.maxHp)));
      const ghostRatio = Math.max(hpRatio, Math.min(1, e.ghostHp / Math.max(1, e.maxHp)));
      slot.hpBar.style.transform = `scaleX(${hpRatio.toFixed(3)})`;
      slot.hpBar.style.background = hpRatio < 0.3 ? '#f43f5e' : '#ef4444';
      slot.ghostBar.style.transform = `scaleX(${ghostRatio.toFixed(3)})`;

      let statusHtml = '';
      if (e.chillTimer > 0) statusHtml += '<span style="color:#67e8f9">❄</span>';
      if (e.poisonTicks > 0) statusHtml += '<span style="color:#4ade80">☣</span>';
      if (e.rootTimer > 0) statusHtml += '<span style="color:#facc15">⚡</span>';
      if (slot.statusRow.innerHTML !== statusHtml) {
        slot.statusRow.innerHTML = statusHtml;
      }
    }
    for (let i = barIdx; i < LIFEBAR_POOL_SIZE; i++) {
      this.lifebarPool[i].root.style.display = 'none';
    }

    // 2. Update Floating Damage Popups
    for (const p of this.popupPool) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        p.el.style.display = 'none';
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy *= Math.exp(-3.2 * dt);

      _projVec.set(p.x, p.y, p.z);
      _projVec.project(this.camera);
      if (_projVec.z < -1 || _projVec.z > 1) {
        p.el.style.display = 'none';
        continue;
      }
      const sx = (_projVec.x * 0.5 + 0.5) * w;
      const sy = (-_projVec.y * 0.5 + 0.5) * h;
      const alpha = Math.min(1, p.life / (p.maxLife * 0.45));
      p.el.style.display = 'block';
      p.el.style.opacity = alpha.toFixed(2);
      p.el.style.transform = `translate3d(${Math.round(sx)}px,${Math.round(sy)}px,0) translate(-50%,-50%)`;
    }
  }

  private loadPersistence(): void {
    try {
      const savedBest = localStorage.getItem(BEST_SCORE_KEY);
      if (savedBest) this.bestScore = Math.max(0, Number.parseInt(savedBest, 10) || 0);

      const savedLook = localStorage.getItem(LOOK_STORAGE_KEY);
      if (savedLook) {
        const parsed = JSON.parse(savedLook) as Partial<CharacterCustomization>;
        this.customization = sanitizeCustomization(parsed);
      }
    } catch {
      this.customization = createDefaultCustomization();
    }
  }

  private saveLook(): void {
    try {
      localStorage.setItem(LOOK_STORAGE_KEY, JSON.stringify(this.customization));
    } catch {
      // Ignore storage errors
    }
    this.emitLook();
  }

  private emitLook(): void {
    if (this.onLookUpdate) {
      this.onLookUpdate({ ...this.customization });
    }
  }

  public getCustomization(): CharacterCustomization {
    return this.customization;
  }

  public setCustomization(custom: CharacterCustomization): void {
    this.customization = sanitizeCustomization(custom);
    this.playerRig.applyCustomization(this.customization);
    this.saveLook();
  }

  private applyMapAtmosphere(mapId: MapId): void {
    const spec = MAPS[mapId];
    this.scene.background = new THREE.Color(spec.skyHex);
    this.scene.fog = new THREE.FogExp2(spec.skyHex, spec.fogDensity);
  }

  private loadMap(mapId: MapId): void {
    this.mapId = mapId;
    this.scene.remove(this.arena.group);
    this.arena = createMapArena(mapId, this.textures, this.isSoftwareGl);
    this.scene.add(this.arena.group);
    this.applyMapAtmosphere(mapId);
    this.setPortalVisualActive(false);
  }

  private setPortalVisualActive(active: boolean): void {
    this.portalActive = active;
    if (this.arena.portalCore) {
      (this.arena.portalCore.material as THREE.MeshBasicMaterial).opacity = active ? 0.88 : 0.2;
    }
    if (this.arena.portalPad) {
      (this.arena.portalPad.material as THREE.MeshBasicMaterial).opacity = active ? 0.48 : 0.08;
    }
    if (this.arena.portalRing) {
      (this.arena.portalRing.material as THREE.MeshBasicMaterial).opacity = active ? 0.95 : 0.25;
    }
  }

  private bindInputListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointermove', this.handlePointerMove);
    dom.addEventListener('pointerdown', this.handlePointerDown);
    dom.addEventListener('contextmenu', this.handleContextMenu);
  }

  private unbindInputListeners(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointermove', this.handlePointerMove);
    dom.removeEventListener('pointerdown', this.handlePointerDown);
    dom.removeEventListener('contextmenu', this.handleContextMenu);
  }

  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
  };

  private handleWindowBlur = (): void => {
    this.keys.clear();
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) this.keys.clear();
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return;
    if (document.body.dataset.modalOpen === 'true') return;

    const code = e.code;
    this.keys.add(code);

    if (this.screen === 'title') {
      if (code === 'Enter' || code === 'Space') {
        e.preventDefault();
        this.startNewRun();
      }
      return;
    }

    if (code === 'Escape' || code === 'KeyP') {
      e.preventDefault();
      if (this.screen === 'playing') this.pause();
      else if (this.screen === 'paused') this.resume();
      return;
    }

    if (code === 'KeyM') {
      this.toggleMute();
      return;
    }

    if (this.screen === 'gameover' || this.screen === 'victory') {
      if (code === 'Enter') {
        e.preventDefault();
        this.startNewRun();
      }
      return;
    }

    if (this.screen !== 'playing') return;

    if (code === 'Space' || code === 'ShiftLeft') {
      e.preventDefault();
      this.bufferedDash = 0.14;
    } else if (code === 'KeyJ') {
      this.bufferedPrimary = 0.14;
    } else if (code === 'KeyK') {
      this.bufferedSecondary = 0.14;
    } else if (code === 'KeyH') {
      this.usePotion();
    } else if (code === 'KeyE' || code === 'KeyF') {
      this.interactNearest();
    } else if (code === 'KeyG') {
      this.triggerNextWave();
    } else if (code === 'KeyQ') {
      this.cycleWeapon(1);
    } else if (code.startsWith('Digit')) {
      const idx = Number.parseInt(code.replace('Digit', ''), 10) - 1;
      if (idx >= 0 && idx < this.ownedWeapons.length) {
        this.equipWeapon(this.ownedWeapons[idx]);
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (this.screen !== 'playing') return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    _mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_mouseNdc, this.camera);
    if (_raycaster.ray.intersectPlane(_groundPlane, _vec3)) {
      this.pointerWorldX = _vec3.x;
      this.pointerWorldZ = _vec3.z;
      this.hasMouseMoved = true;
    }
  };

  private handlePointerDown = (e: PointerEvent): void => {
    if (this.screen !== 'playing') return;
    this.handlePointerMove(e);
    if (e.button === 0) this.bufferedPrimary = 0.14;
    else if (e.button === 2) this.bufferedSecondary = 0.14;
  };

  public setTouchControlsEnabled(enabled: boolean): void {
    this.touchControlsEnabled = enabled;
    this.emitHud();
  }

  public setTouchMove(x: number, z: number): void {
    this.touchMoveX = x;
    this.touchMoveZ = z;
  }

  public setTouchAim(x: number, z: number): void {
    this.touchAimX = x;
    this.touchAimZ = z;
  }

  public triggerPrimary(): void {
    if (this.screen === 'playing') this.bufferedPrimary = 0.14;
  }

  public triggerSecondary(): void {
    if (this.screen === 'playing') this.bufferedSecondary = 0.14;
  }

  public triggerDash(): void {
    if (this.screen === 'playing') this.bufferedDash = 0.14;
  }

  public cycleWeapon(dir = 1): void {
    if (this.ownedWeapons.length <= 1) return;
    const cur = this.ownedWeapons.indexOf(this.weaponId);
    const next = (cur + dir + this.ownedWeapons.length) % this.ownedWeapons.length;
    this.equipWeapon(this.ownedWeapons[next]);
  }

  public equipWeapon(id: WeaponId): void {
    if (!this.ownedWeapons.includes(id) || this.weaponId === id) return;
    this.weaponId = id;
    this.playerRig.setWeapon(id);
    this.primaryCooldown = 0;
    this.secondaryCooldown = 0;
    this.attackPhase = 'idle';
    soundEngine.playPickup();

    // Character Capstone: Abyssal Convergence fires soul bolts on swap!
    if ((this.activeUpgrades.c_reaper ?? 0) > 0 && this.screen === 'playing') {
      this.fireHomingSoulBolts(2, 26);
    }
    this.emitHud();
  }

  public usePotion(): boolean {
    if (this.screen !== 'playing') return false;
    if (this.potions <= 0) {
      this.setBanner('NO POTIONS LEFT!', 1.1);
      return false;
    }
    if (this.playerHp >= this.playerMaxHp && (this.activeUpgrades.c_alchemist ?? 0) <= 0) {
      this.setBanner('HP ALREADY FULL', 1.1);
      return false;
    }

    const stats = this.currentStats();
    this.potions -= 1;
    this.hotRemaining += stats.potionHealTotal;
    this.hotRate = stats.potionHealTotal / stats.potionDuration;
    soundEngine.playPotion();
    this.spawnParticles(this.playerX, 1.0, this.playerZ, 14, 0xf43f5e, 6.5);
    this.setBanner(`POTION USED · HEALING +${stats.potionHealTotal} HP OVER TIME`, 1.7);

    if ((this.activeUpgrades.c_alchemist ?? 0) > 0) {
      this.boostRageTimer = Math.max(this.boostRageTimer, 4.0);
      this.triggerAoeExplosion(this.playerX, this.playerZ, 4.2, 34, 0x4ade80, false, 'magic');
    }

    this.emitHud();
    return true;
  }

  private currentStats() {
    return computeRunStats(
      this.activeUpgrades,
      this.rushStacks,
      this.wearableId,
      this.fonStacks,
      this.jakshoStacks
    );
  }

  // --- In-World Wave & Boss Rewards + Portal Interaction ---

  private enterWaveRewardPhase(): void {
    this.waveClearDelayTimer = 0;
    this.clearRewardProps();
    this.pedestalClaimed = false;
    this.chestOpened = false;
    this.waveRewardState = 'claiming';

    const rewards = generateWaveRewardPedestals(
      this.mapId,
      this.wave,
      this.ownedWeapons,
      this.wearableId,
      this.activeUpgrades
    );
    const xOffsets =
      rewards.length === 4 ? [-5.1, -1.7, 1.7, 5.1] : [-3.8, 0, 3.8];

    for (let i = 0; i < rewards.length; i++) {
      const reward = rewards[i];
      const px = xOffsets[i] ?? 0;
      const pz = -3.4;
      const built = createPedestalMesh(reward);
      built.root.position.set(px, -1.5, pz);
      this.scene.add(built.root);
      this.pedestals.push({
        id: this.nextEntityId++,
        x: px,
        z: pz,
        reward,
        claimed: false,
        sinking: false,
        sinkProgress: 0,
        riseProgress: 0,
        root: built.root,
        displayGroup: built.displayGroup,
        ring: built.ring,
      });
    }

    this.spawnWorldChest(-2.6, 1.8);
    const runeMesh = createNextWaveRuneMesh();
    runeMesh.position.set(2.8, 0, 2.2);
    this.scene.add(runeMesh);
    this.nextWaveRune = { x: 2.8, z: 2.2, mesh: runeMesh };

    soundEngine.playWaveStart();
    this.setBanner(
      this.wave >= MAPS[this.mapId].waves
        ? 'WAVE CLEARED · PICK 1 PEDESTAL & OPEN CHEST BEFORE THE BOSS!'
        : 'WAVE CLEARED · PICK 1 PEDESTAL & OPEN FREE CHEST',
      3.0
    );
    this.emitHud();
  }

  private spawnWorldChest(x: number, z: number): void {
    const built = createChestMesh();
    built.root.position.set(x, -1.2, z);
    this.scene.add(built.root);
    this.chests.push({
      id: this.nextEntityId++,
      x,
      z,
      opened: false,
      riseProgress: 0,
      root: built.root,
      lidGroup: built.lidGroup,
    });
  }

  private clearRewardProps(): void {
    for (const p of this.pedestals) this.scene.remove(p.root);
    this.pedestals.length = 0;
    for (const c of this.chests) this.scene.remove(c.root);
    this.chests.length = 0;
    for (const s of this.shrines) this.scene.remove(s.root);
    this.shrines.length = 0;
    if (this.nextWaveRune) {
      this.scene.remove(this.nextWaveRune.mesh);
      this.nextWaveRune = null;
    }
  }

  public getNearbyInteractable(): NearbyInteractableSnapshot | null {
    if (this.screen !== 'playing') return null;

    if (this.portalActive && Math.hypot(this.playerX - PORTAL_PAD_X, this.playerZ - PORTAL_PAD_Z) <= 3.1) {
      return {
        kind: 'portal',
        title: 'North Rift Portal',
        subtitle: `Warp to Map ${Math.min(5, this.mapId + 1)}: ${MAPS[Math.min(5, this.mapId + 1) as MapId].name}`,
        badge: 'PORTAL',
        accentHex: `#${MAPS[this.mapId].accentHex.toString(16).padStart(6, '0')}`,
        actionLabel: '[E] Enter Portal',
      };
    }

    let bestDist = 2.85;
    let best: NearbyInteractableSnapshot | null = null;

    for (const c of this.chests) {
      if (c.opened) continue;
      const d = Math.hypot(this.playerX - c.x, this.playerZ - c.z);
      if (d < bestDist) {
        bestDist = d;
        best = {
          kind: 'chest',
          title: 'Alchemist Potion Chest',
          subtitle: 'Free Relic Chest · Drops 1–3 Healing Potions',
          badge: 'FREE',
          accentHex: '#f43f5e',
          actionLabel: '[E] Open Chest',
        };
      }
    }

    for (const p of this.pedestals) {
      if (p.claimed || p.sinking) continue;
      const d = Math.hypot(this.playerX - p.x, this.playerZ - p.z);
      if (d < bestDist) {
        bestDist = d;
        if (p.reward.kind === 'weapon') {
          const w = WEAPONS[p.reward.weaponId];
          const needsSwap =
            this.ownedWeapons.length >= MAX_EQUIPPED_WEAPONS &&
            !this.ownedWeapons.includes(w.id);
          best = {
            kind: 'pedestal',
            title: w.name,
            subtitle: `${w.roleHint} · Tier ${w.tier}`,
            badge: w.damageType.toUpperCase(),
            accentHex: w.accentHex,
            actionLabel: needsSwap ? '[E] Swap Weapon' : '[E] Equip Weapon',
            swapWarning: needsSwap ? `Swaps with ${WEAPONS[this.weaponId].name}` : undefined,
          };
        } else if (p.reward.kind === 'wearable') {
          const wr = WEARABLES[p.reward.wearableId];
          const prev = this.wearableId && this.wearableId !== wr.id ? WEARABLES[this.wearableId].name : null;
          best = {
            kind: 'pedestal',
            title: wr.name,
            subtitle: `${wr.shortDesc} · ${wr.passiveDesc}`,
            badge: 'RELIC',
            accentHex: wr.accentHex,
            actionLabel: prev ? '[E] Swap Relic' : '[E] Equip Relic',
            swapWarning: prev ? `Swaps with ${prev}` : undefined,
          };
        } else {
          const u = UPGRADE_TREE[p.reward.upgradeId];
          best = {
            kind: 'pedestal',
            title: u.name,
            subtitle: u.desc,
            badge: 'TOME',
            accentHex: u.accentHex,
            actionLabel: '[E] Learn Evolution',
          };
        }
      }
    }

    for (const s of this.shrines) {
      if (s.claimed || s.sinking) continue;
      const d = Math.hypot(this.playerX - s.x, this.playerZ - s.z);
      if (d < bestDist) {
        bestDist = d;
        const u = UPGRADE_TREE[s.nodeId];
        best = {
          kind: 'shrine',
          title: u.name,
          subtitle: u.desc,
          badge: 'EVOLUTION',
          accentHex: u.accentHex,
          actionLabel: '[E] Claim Shrine',
        };
      }
    }

    if (this.nextWaveRune && this.waveRewardState !== 'none') {
      const d = Math.hypot(this.playerX - this.nextWaveRune.x, this.playerZ - this.nextWaveRune.z);
      if (d < bestDist) {
        const nextIsBoss = this.wave >= MAPS[this.mapId].waves;
        best = {
          kind: 'next_wave',
          title: nextIsBoss ? 'Boss Summon Rune' : `Wave ${this.wave + 1} Rune`,
          subtitle: nextIsBoss ? `Summon ${MAPS[this.mapId].bossName}` : 'Begin the next wave',
          badge: 'READY',
          accentHex: '#facc15',
          actionLabel: '[E] / [G] Start',
        };
      }
    }

    return best;
  }

  public interactNearest(): boolean {
    if (this.screen !== 'playing') return false;

    if (this.portalActive && Math.hypot(this.playerX - PORTAL_PAD_X, this.playerZ - PORTAL_PAD_Z) <= 3.1) {
      this.beginPortalWarp();
      return true;
    }

    // Prioritize Chest -> Pedestal -> Shrine -> Next Wave Rune
    let nearestChest: ActiveChest | null = null;
    let bestChestDist = 2.85;
    for (const c of this.chests) {
      if (c.opened) continue;
      const d = Math.hypot(this.playerX - c.x, this.playerZ - c.z);
      if (d < bestChestDist) {
        bestChestDist = d;
        nearestChest = c;
      }
    }

    let nearestPed: ActivePedestal | null = null;
    let bestPedDist = 2.85;
    for (const p of this.pedestals) {
      if (p.claimed || p.sinking) continue;
      const d = Math.hypot(this.playerX - p.x, this.playerZ - p.z);
      if (d < bestPedDist) {
        bestPedDist = d;
        nearestPed = p;
      }
    }

    let nearestShrine: ActiveShrine | null = null;
    let bestShrineDist = 2.85;
    for (const s of this.shrines) {
      if (s.claimed || s.sinking) continue;
      const d = Math.hypot(this.playerX - s.x, this.playerZ - s.z);
      if (d < bestShrineDist) {
        bestShrineDist = d;
        nearestShrine = s;
      }
    }

    if (nearestChest && bestChestDist <= bestPedDist && bestChestDist <= bestShrineDist) {
      this.openChest(nearestChest);
      return true;
    }
    if (nearestPed && bestPedDist <= bestShrineDist) {
      this.claimPedestal(nearestPed);
      return true;
    }
    if (nearestShrine) {
      this.claimShrine(nearestShrine);
      return true;
    }

    if (
      this.nextWaveRune &&
      Math.hypot(this.playerX - this.nextWaveRune.x, this.playerZ - this.nextWaveRune.z) < 2.85
    ) {
      this.triggerNextWave();
      return true;
    }

    return false;
  }

  private openChest(chest: ActiveChest): void {
    if (chest.opened) return;
    chest.opened = true;
    chest.lidGroup.rotation.x = -1.25;
    this.chestOpened = true;
    soundEngine.playChest();
    this.spawnParticles(chest.x, 0.8, chest.z, 16, 0xf43f5e, 7);

    const count = rollChestPotions(this.noHitKills);
    for (let i = 0; i < count; i++) {
      const a = (i / Math.max(1, count)) * Math.PI * 1.4 - 0.7;
      this.spawnWorldPickup('potion', chest.x + Math.sin(a) * 0.5, chest.z + Math.cos(a) * 0.5, {
        vx: Math.sin(a) * 3.4,
        vz: Math.cos(a) * 3.4,
        vy: 5.5,
      });
    }

    if (this.pedestalClaimed && this.waveRewardState === 'claiming') {
      this.waveRewardState = 'ready';
    }
    this.setBanner(`ALCHEMIST CHEST OPENED · +${count} POTION${count > 1 ? 'S' : ''}!`, 1.8);
    this.emitHud();
  }

  private claimPedestal(ped: ActivePedestal): void {
    if (ped.claimed || ped.sinking) return;

    const reward = ped.reward;
    if (reward.kind === 'weapon') {
      const wId = reward.weaponId;
      if (this.ownedWeapons.includes(wId)) {
        this.weaponId = wId;
        this.playerRig.setWeapon(wId);
        ped.claimed = true;
        ped.sinking = true;
      } else if (this.ownedWeapons.length >= MAX_EQUIPPED_WEAPONS) {
        // Swap with currently held weapon & leave dropped weapon on this pedestal!
        const droppedId = this.weaponId;
        const idx = this.ownedWeapons.indexOf(droppedId);
        if (idx >= 0) this.ownedWeapons[idx] = wId;
        else this.ownedWeapons[0] = wId;
        this.weaponId = wId;
        this.playerRig.setWeapon(wId);

        ped.reward = { kind: 'weapon', weaponId: droppedId };
        this.rebuildPedestalDisplay(ped);
        this.setBanner(`SWAPPED ${WEAPONS[droppedId].name.toUpperCase()} FOR ${WEAPONS[wId].name.toUpperCase()}`, 2.0);
      } else {
        this.ownedWeapons.push(wId);
        this.weaponId = wId;
        this.playerRig.setWeapon(wId);
        ped.claimed = true;
        ped.sinking = true;
        this.setBanner(`EQUIPPED ${WEAPONS[wId].name.toUpperCase()}`, 1.8);
      }
    } else if (reward.kind === 'wearable') {
      const nextWearable = reward.wearableId;
      const prevWearable = this.wearableId;
      this.equipWearable(nextWearable);
      if (prevWearable && prevWearable !== nextWearable) {
        ped.reward = { kind: 'wearable', wearableId: prevWearable };
        this.rebuildPedestalDisplay(ped);
        this.setBanner(`SWAPPED TO ${WEARABLES[nextWearable].name.toUpperCase()}`, 2.0);
      } else {
        ped.claimed = true;
        ped.sinking = true;
        this.setBanner(`RELIC EQUIPPED · ${WEARABLES[nextWearable].name.toUpperCase()}`, 2.0);
      }
    } else {
      const upId = reward.upgradeId;
      this.activeUpgrades[upId] = (this.activeUpgrades[upId] ?? 0) + 1;
      this.refreshPlayerDerivedStats();
      ped.claimed = true;
      ped.sinking = true;
      this.setBanner(`TOME LEARNED · ${UPGRADE_TREE[upId].name.toUpperCase()}`, 2.0);
    }

    // Sink all OTHER pedestals!
    for (const other of this.pedestals) {
      if (other.id !== ped.id && !other.sinking) {
        other.sinking = true;
      }
    }

    this.pedestalClaimed = true;
    if (this.chestOpened && this.waveRewardState === 'claiming') {
      this.waveRewardState = 'ready';
    }
    soundEngine.playPedestalClaim();
    this.spawnParticles(ped.x, 1.4, ped.z, 16, 0xfacc15, 6.5);
    this.emitHud();
  }

  private rebuildPedestalDisplay(ped: ActivePedestal): void {
    while (ped.displayGroup.children.length > 0) {
      ped.displayGroup.remove(ped.displayGroup.children[0]);
    }
    if (ped.reward.kind === 'weapon') {
      const w = createWeaponMesh(ped.reward.weaponId);
      w.scale.setScalar(0.85);
      w.position.set(0, 0, -0.32);
      ped.displayGroup.add(w);
    } else if (ped.reward.kind === 'wearable') {
      const spec = WEARABLES[ped.reward.wearableId];
      const mat = new THREE.MeshStandardMaterial({
        color: spec.accentInt,
        emissive: spec.accentInt,
        emissiveIntensity: 0.7,
        flatShading: true,
      });
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.26), mat);
      ped.displayGroup.add(plate);
    }
  }

  private equipWearable(id: WearableId | null): void {
    this.wearableId = id;
    this.playerRig.setWearable(id);
    this.bansheeReady = id === 'banshees_veil';
    this.bansheeCooldown = 0;
    this.playerRig.setBansheeShieldActive(this.bansheeReady);
    this.jakshoStacks = 0;
    this.jakshoTimer = 0;
    this.jakshoDrained = false;
    this.fonStacks = 0;
    this.fonTimer = 0;
    this.spellbladeReady = false;
    this.sunfireTicks = 0;
    this.refreshPlayerDerivedStats();
  }

  private claimShrine(shrine: ActiveShrine): void {
    if (shrine.claimed || shrine.sinking) return;
    shrine.claimed = true;
    shrine.sinking = true;
    this.shrineClaimed = true;

    this.activeUpgrades[shrine.nodeId] = (this.activeUpgrades[shrine.nodeId] ?? 0) + 1;
    if (shrine.nodeId === 'c_awakening') {
      const stats = this.currentStats();
      this.potions = Math.min(stats.maxPotions, this.potions + 1);
    }
    this.refreshPlayerDerivedStats(true);

    for (const other of this.shrines) {
      if (other.id !== shrine.id) other.sinking = true;
    }

    soundEngine.playUpgrade();
    this.spawnParticles(shrine.x, 1.8, shrine.z, 20, 0x38bdf8, 7.5);
    this.setBanner(
      `EVOLUTION CLAIMED: ${UPGRADE_TREE[shrine.nodeId].name.toUpperCase()} · ENTER NORTH PORTAL`,
      2.6
    );
    this.emitHud();
  }

  public triggerNextWave(): boolean {
    if (this.screen !== 'playing' || this.waveRewardState === 'none' || this.portalActive) {
      return false;
    }
    const nextIsBoss = this.wave >= MAPS[this.mapId].waves;
    this.clearRewardProps();
    this.waveRewardState = 'none';
    this.pedestalClaimed = false;
    this.chestOpened = false;

    if (nextIsBoss) {
      this.startBossEncounter();
    } else {
      this.wave += 1;
      this.wavePlan = buildWavePlan(this.mapId, this.wave);
      this.waveSpawned = 0;
      this.waveKills = 0;
      this.spawnTimer = 0.4;
      this.setBanner(`MAP ${this.mapId} · WAVE ${this.wave}/${MAPS[this.mapId].waves}`, 2.1);
      soundEngine.playWaveStart();
    }
    this.emitHud();
    return true;
  }

  private beginPortalWarp(): void {
    if (!this.portalActive || this.portalWarpTimer > 0) return;
    this.portalWarpTimer = 0.36;
    this.warpFlashOverlay.style.opacity = '0.92';
    soundEngine.playPortalWarp();
    this.spawnParticles(this.playerX, 1.2, this.playerZ, 24, MAPS[this.mapId].accentHex, 8);
  }

  private updateRewardsAndPortal(dt: number): void {
    const t = this.clock.elapsedTime;

    if (this.portalWarpTimer > 0) {
      this.portalWarpTimer -= dt;
      if (this.portalWarpTimer <= 0) {
        this.warpFlashOverlay.style.opacity = '0';
        this.advanceToNextMap();
        return;
      }
    }

    // Animate & auto-trigger Pedestals
    for (let i = this.pedestals.length - 1; i >= 0; i--) {
      const p = this.pedestals[i];
      if (!p.sinking && p.riseProgress < 1) {
        p.riseProgress = Math.min(1, p.riseProgress + dt * 2.8);
        p.root.position.y = -1.5 * (1 - p.riseProgress);
      }
      if (p.sinking) {
        p.sinkProgress = Math.min(1, p.sinkProgress + dt * 3.0);
        p.root.position.y = -1.6 * p.sinkProgress;
        if (p.sinkProgress >= 1) {
          this.scene.remove(p.root);
          this.pedestals.splice(i, 1);
          continue;
        }
      } else {
        p.displayGroup.rotation.y += dt * 1.4;
        p.displayGroup.position.y = 1.58 + Math.sin(t * 2.6 + p.id) * 0.1;
      }
    }

    // Animate Chests
    for (const c of this.chests) {
      if (c.riseProgress < 1) {
        c.riseProgress = Math.min(1, c.riseProgress + dt * 3.0);
        c.root.position.y = -1.2 * (1 - c.riseProgress);
      }
      if (!c.opened && Math.hypot(this.playerX - c.x, this.playerZ - c.z) <= 1.5) {
        this.openChest(c);
      }
    }

    // Animate Shrines
    for (let i = this.shrines.length - 1; i >= 0; i--) {
      const s = this.shrines[i];
      if (!s.sinking && s.riseProgress < 1) {
        s.riseProgress = Math.min(1, s.riseProgress + dt * 2.8);
        s.root.position.y = -1.6 * (1 - s.riseProgress);
      }
      if (s.sinking) {
        s.sinkProgress = Math.min(1, s.sinkProgress + dt * 3.0);
        s.root.position.y = -1.8 * s.sinkProgress;
        if (s.sinkProgress >= 1) {
          this.scene.remove(s.root);
          this.shrines.splice(i, 1);
          continue;
        }
      } else {
        s.crystal.rotation.y += dt * 1.8;
        s.crystal.position.y = 2.45 + Math.sin(t * 3 + s.id) * 0.12;
      }
    }

    // Animate Next Wave Rune & auto-start when stepping onto it after claiming both pedestal + chest
    if (this.nextWaveRune) {
      this.nextWaveRune.mesh.rotation.y += dt * 1.2;
      const dist = Math.hypot(this.playerX - this.nextWaveRune.x, this.playerZ - this.nextWaveRune.z);
      if (dist <= 1.35 && this.pedestalClaimed && this.chestOpened) {
        this.triggerNextWave();
        return;
      }
    }

    // Walk into energized North Portal to warp to next map!
    if (this.portalActive && Math.hypot(this.playerX - PORTAL_PAD_X, this.playerZ - PORTAL_PAD_Z) <= 2.25) {
      this.beginPortalWarp();
    }
  }

  public advanceToNextMap(): void {
    const nextId = Math.min(5, this.mapId + 1) as MapId;
    this.clearDynamicEntities();
    this.loadMap(nextId);

    this.screen = 'playing';
    this.waveRewardState = 'none';
    this.portalActive = false;
    this.shrineClaimed = false;
    this.playerX = 0;
    this.playerZ = 0;
    this.playerVx = 0;
    this.playerVz = 0;
    this.playerInvulnTimer = 0.8;
    this.refreshPlayerDerivedStats(true);

    const mapSpec = MAPS[nextId];
    if (mapSpec.isBossOnly) {
      this.wave = 1;
      this.wavePlan = buildWavePlan(nextId, 1);
      this.waveSpawned = 0;
      this.waveKills = 0;
      this.startBossEncounter();
    } else {
      this.wave = 1;
      this.wavePlan = buildWavePlan(nextId, 1);
      this.waveSpawned = 0;
      this.waveKills = 0;
      this.isBossWave = false;
      this.spawnTimer = 0.45;
      this.setBanner(`MAP ${nextId}: ${mapSpec.name.toUpperCase()}`, 2.4);
      soundEngine.playWaveStart();
    }

    this.syncBodyState();
    this.emitHud();
  }

  private refreshPlayerDerivedStats(topOffShield = false): void {
    const stats = this.currentStats();
    const oldMax = this.playerMaxHp;
    this.playerMaxHp = stats.maxHp;
    if (stats.maxHp > oldMax) {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + (stats.maxHp - oldMax));
    } else if (this.playerHp > this.playerMaxHp) {
      this.playerHp = this.playerMaxHp;
    }
    if (topOffShield || this.shieldHp > stats.maxShieldHp) {
      this.shieldHp = stats.maxShieldHp;
    }
    this.dashCharges = Math.min(stats.maxDashCharges, Math.max(this.dashCharges, 1));
    this.playerRig.setOrbitalCount(stats.orbitalCount);
  }

  public toggleMute(): void {
    soundEngine.toggleMute();
    this.emitHud();
  }

  public pause(): void {
    if (this.screen !== 'playing') return;
    this.screen = 'paused';
    this.keys.clear();
    this.hideAllCombatDom();
    this.syncBodyState();
    this.emitHud();
  }

  public resume(): void {
    if (this.screen !== 'paused') return;
    this.screen = 'playing';
    this.keys.clear();
    this.syncBodyState();
    this.emitHud();
  }

  public returnToTitle(): void {
    this.clearDynamicEntities();
    this.loadMap(1);
    this.screen = 'title';
    this.waveRewardState = 'none';
    this.portalActive = false;
    this.warpFlashOverlay.style.opacity = '0';
    this.playerX = 0;
    this.playerZ = 0;
    this.playerRig.root.position.set(0, 0, 0);
    this.playerRig.root.rotation.y = 0;
    this.playerRig.setWeapon('sword');
    this.playerRig.setWearable(null);
    this.playerRig.setBansheeShieldActive(false);
    this.playerRig.setOrbitalCount(0);
    this.playerRig.boostAura.visible = false;
    this.spawnTitleShowcaseActors();
    this.syncBodyState();
    this.emitHud();
  }

  public startNewRun(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.keys.clear();
    this.clearDynamicEntities();
    this.loadMap(1);

    // Full Run Reset! Only customization & bestScore persist
    this.ownedWeapons = ['sword'];
    this.wearableId = null;
    this.activeUpgrades = {};
    this.rushStacks = 0;
    this.rushTimer = 0;
    this.bansheeReady = false;
    this.bansheeCooldown = 0;
    this.jakshoStacks = 0;
    this.jakshoTimer = 0;
    this.jakshoDrained = false;
    this.jakshoResetTimer = 0;
    this.fonStacks = 0;
    this.fonTimer = 0;
    this.spellbladeReady = false;
    this.sunfireTimer = 0;
    this.sunfireTicks = 0;
    this.waveRewardState = 'none';
    this.waveClearDelayTimer = 0;
    this.pedestalClaimed = false;
    this.chestOpened = false;
    this.shrineClaimed = false;
    this.portalActive = false;
    this.portalWarpTimer = 0;
    this.warpFlashOverlay.style.opacity = '0';

    const stats = this.currentStats();
    this.screen = 'playing';
    this.playerX = 0;
    this.playerZ = 0;
    this.playerVx = 0;
    this.playerVz = 0;
    this.playerFacing = 0;
    this.playerMaxHp = stats.maxHp;
    this.playerHp = stats.maxHp;
    this.shieldHp = 0;
    this.hotRemaining = 0;
    this.potions = 1;
    this.playerInvulnTimer = 0.6;
    this.playerHitFlashTimer = 0;
    this.playerWalkCycle = 0;
    this.playerSquashY = 1;
    this.playerRig.setHitFlash(false);
    this.playerRig.setOrbitalCount(0);
    this.playerRig.setWearable(null);
    this.playerRig.setBansheeShieldActive(false);

    this.weaponId = 'sword';
    this.playerRig.setWeapon('sword');
    this.primaryCooldown = 0;
    this.secondaryCooldown = 0;
    this.attackPhase = 'idle';
    this.attackPhaseTimer = 0;
    this.attackCount = 0;
    this.gauntletComboStep = 0;
    this.blockTimer = 0;
    this.dashTimer = 0;
    this.dashCharges = stats.maxDashCharges;
    this.dashRechargeTimer = 0;
    this.boostSpeedTimer = 0;
    this.boostRageTimer = 0;
    this.boostShieldTimer = 0;
    this.bufferedPrimary = 0;
    this.bufferedSecondary = 0;
    this.bufferedDash = 0;

    this.wave = 1;
    this.isBossWave = false;
    this.wavePlan = buildWavePlan(1, 1);
    this.waveSpawned = 0;
    this.waveKills = 0;
    this.spawnTimer = 0.25;
    this.score = 0;
    this.kills = 0;
    this.noHitKills = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.elapsedSeconds = 0;
    this.hitstopTimer = 0;
    this.cameraTrauma = 0;

    this.setBanner('MAP 1: THE ASTRAL RIFT · WAVE 1/5', 2.4);
    soundEngine.playWaveStart();

    this.camPos.set(0, 15.5, 13.8);
    this.camLook.set(0, 0.7, 0);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    this.syncBodyState();
    this.emitHud();
  }

  private syncBodyState(): void {
    document.body.dataset.state = this.screen;
  }

  private setBanner(text: string, duration = 2.0): void {
    this.bannerText = text;
    this.bannerTimer = duration;
  }

  private spawnTitleShowcaseActors(): void {
    const previewKinds: EnemyKind[] = ['zombie_sword', 'cultist', 'wisp_lantern', 'hell_knight'];
    for (let i = 0; i < previewKinds.length; i++) {
      const a = i * (Math.PI / 2) + 0.55;
      const dist = 10.5 + (i % 2) * 3.0;
      this.spawnEnemyAt(previewKinds[i], Math.sin(a) * dist, Math.cos(a) * dist);
    }
  }

  private clearDynamicEntities(): void {
    for (const e of this.enemies) {
      this.scene.remove(e.rig.root);
      if (e.webLine) this.scene.remove(e.webLine);
      if (e.telegraphRing) this.scene.remove(e.telegraphRing);
    }
    this.enemies.length = 0;
    this.activeAttackTokens = 0;

    for (const d of this.pickups) this.scene.remove(d.group);
    this.pickups.length = 0;

    for (const h of this.hazards) this.scene.remove(h.mesh);
    this.hazards.length = 0;

    for (const t of this.traps) this.scene.remove(t.mesh);
    this.traps.length = 0;

    for (const v of this.slashVfxs) this.scene.remove(v.mesh);
    this.slashVfxs.length = 0;

    this.clearRewardProps();
    this.hideAllCombatDom();

    for (const p of this.projectiles) {
      p.active = false;
      p.mesh.visible = false;
    }
  }

  private startLoop(): void {
    this.clock.start();
    const tick = () => {
      if (this.disposed) return;
      const rawDt = this.clock.getDelta();
      const dt = clampDt(rawDt);

      this.update(dt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) this.afterDraw(tick);
      else this.frameId = requestAnimationFrame(tick);
    };
    this.frameId = requestAnimationFrame(tick);
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || !gl.fenceSync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private update(dt: number): void {
    const t = this.clock.elapsedTime;
    for (let i = 0; i < this.arena.brazierLights.length; i++) {
      const flicker = 5.4 + Math.sin(t * 7.5 + i * 2.1) * 1.1 + Math.sin(t * 17.3 + i) * 0.45;
      this.arena.brazierLights[i].intensity = flicker;
      const flame = this.arena.brazierFlames[i];
      flame.rotation.y += dt * 3.5;
      flame.scale.setScalar(0.9 + Math.sin(t * 11 + i) * 0.14);
    }
    if (this.arena.portalCore) {
      this.arena.portalCore.rotation.z += dt * (this.portalActive ? 2.4 : 0.8);
      const mat = this.arena.portalCore.material as THREE.MeshBasicMaterial;
      mat.opacity = this.portalActive
        ? 0.78 + Math.sin(t * 6) * 0.16
        : 0.18 + Math.sin(t * 3) * 0.06;
    }
    if (this.arena.portalRing && this.portalActive) {
      this.arena.portalRing.scale.setScalar(1 + Math.sin(t * 5) * 0.06);
    }
    if (this.arena.lavaPlane) {
      const mat = this.arena.lavaPlane.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (this.mapId === 4 ? 0.68 : 0.96) + Math.sin(t * 2.8) * 0.18;
    }

    if (this.screen === 'title') {
      this.titleOrbitAngle += dt * 0.22;
      const r = 16.5;
      this.camPos.set(
        Math.sin(this.titleOrbitAngle) * r,
        8.2 + Math.sin(this.titleOrbitAngle * 0.5) * 1.4,
        Math.cos(this.titleOrbitAngle) * r
      );
      this.camLook.set(0, 1.3, 0);
      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.camLook);

      this.playerRig.bodyGroup.position.y = Math.sin(t * 2.4) * 0.06;
      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        e.rig.bodyGroup.position.y = Math.sin(t * 2.8 + i) * 0.05;
        e.rig.root.rotation.y = Math.atan2(-e.x, -e.z);
        if (e.rig.coreWeakPoint) e.rig.coreWeakPoint.rotation.y += dt * 2.4;
      }
      return;
    }

    if (this.screen === 'paused' || this.screen === 'victory') {
      return;
    }

    this.updateParticles(dt);
    this.updateSlashVfxs(dt);
    this.cameraTrauma = Math.max(0, this.cameraTrauma - dt * 1.8);

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.bannerText = null;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateCamera(dt);
      this.updateCombatOverlay(dt);
      return;
    }

    if (this.screen === 'gameover') {
      this.updateCamera(dt);
      this.updateCombatOverlay(dt);
      return;
    }

    this.elapsedSeconds += dt;
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    this.updatePlayer(dt);
    this.updateWearablePassives(dt);
    this.updateOrbitals(dt);
    this.updateWaveSpawner(dt);
    this.updateRewardsAndPortal(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateHazards(dt);
    this.updateTraps(dt);
    this.updatePickups(dt);
    this.updateCamera(dt);
    this.updateCombatOverlay(dt);

    this.hudEmitAccum += dt;
    if (this.hudEmitAccum >= 0.08) {
      this.hudEmitAccum = 0;
      this.emitHud();
    }
  }

  private updateWearablePassives(dt: number): void {
    const t = this.clock.elapsedTime;
    if (this.playerRig.wearableAura.visible) {
      this.playerRig.wearableAura.scale.setScalar(1 + Math.sin(t * 4) * 0.06);
    }

    // Banshee's Veil Spell Shield recharge
    if (this.wearableId === 'banshees_veil' && !this.bansheeReady) {
      this.bansheeCooldown -= dt;
      if (this.bansheeCooldown <= 0) {
        this.bansheeReady = true;
        this.bansheeCooldown = 0;
        this.playerRig.setBansheeShieldActive(true);
        this.spawnParticles(this.playerX, 1.1, this.playerZ, 10, 0xc084fc, 5);
      }
    }
    if (this.playerRig.bansheeBubble.visible) {
      this.playerRig.bansheeBubble.rotation.y += dt * 1.4;
    }

    // Force of Nature stack decay
    if (this.fonTimer > 0) {
      this.fonTimer -= dt;
      if (this.fonTimer <= 0) this.fonStacks = 0;
    }

    // Sunfire Aegis Immolate burn aura
    const stats = this.currentStats();
    const aliveEnemies = this.enemies.some((e) => e.state !== 'ko' && e.state !== 'phase');
    if (this.wearableId === 'sunfire_aegis' && aliveEnemies) {
      this.sunfireTimer -= dt;
      if (this.sunfireTimer <= 0) {
        this.sunfireTimer = 0.6;
        let hitAny = false;
        const dmg = 10 + Math.min(5, this.sunfireTicks) * 4;
        for (const e of this.enemies) {
          if (e.state === 'ko' || e.state === 'phase') continue;
          const d = Math.hypot(e.x - this.playerX, e.z - this.playerZ);
          if (d <= 3.6 + ENEMY_ARCHETYPES[e.kind].radius) {
            hitAny = true;
            this.damageEnemy(e, dmg, 1.0, this.playerX, this.playerZ, false, false, 'magic');
          }
        }
        if (hitAny) {
          this.sunfireTicks = Math.min(5, this.sunfireTicks + 1);
          this.spawnParticles(this.playerX, 0.5, this.playerZ, 6, 0xf97316, 4.5);
        } else {
          this.sunfireTicks = Math.max(0, this.sunfireTicks - 1);
        }
      }
    }

    // Jak'Sho, The Protean stacking Armor/MR + Voidborn Drain
    if (this.wearableId === 'jaksho') {
      if (this.waveRewardState === 'none' && !this.portalActive && aliveEnemies) {
        this.jakshoTimer += dt;
        if (this.jakshoTimer >= 1.0) {
          this.jakshoTimer = 0;
          if (this.jakshoStacks < 8) {
            this.jakshoStacks += 1;
          }
        }
        if (this.jakshoStacks >= 8 && !this.jakshoDrained) {
          this.jakshoDrained = true;
          this.jakshoResetTimer = 7.5;
          const healAmt = Math.round(12 * stats.healAmp);
          this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmt);
          this.triggerAoeExplosion(this.playerX, this.playerZ, 4.6, 24, 0xa855f7, false, 'magic');
          this.spawnDamagePopup(this.playerX, 2.2, this.playerZ, `+${healAmt}`, {
            color: '#4ade80',
            fontSize: 15,
          });
          soundEngine.playHeal();
        }
        if (this.jakshoDrained) {
          this.jakshoResetTimer -= dt;
          if (this.jakshoResetTimer <= 0) this.jakshoDrained = false;
        }
      } else {
        this.jakshoStacks = 0;
        this.jakshoTimer = 0;
        this.jakshoDrained = false;
      }
    }
  }

  private updateOrbitals(dt: number): void {
    const stats = this.currentStats();
    if (stats.orbitalCount <= 0) return;

    this.playerRig.orbitalGroup.rotation.y += dt * 3.8;
    const radius = 2.4;
    for (let i = 0; i < stats.orbitalCount; i++) {
      const angle = (i / stats.orbitalCount) * Math.PI * 2;
      const m = this.playerRig.orbitals[i];
      if (!m) continue;
      m.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
      m.rotation.y = angle;
    }

    this.orbitalTimer -= dt;
    if (this.orbitalTimer <= 0) {
      this.orbitalTimer = 0.68;
      for (const e of this.enemies) {
        if (e.state === 'ko' || e.state === 'phase') continue;
        const d = Math.hypot(e.x - this.playerX, e.z - this.playerZ);
        if (d <= radius + ENEMY_ARCHETYPES[e.kind].radius + 0.4) {
          this.damageEnemy(
            e,
            14 + (this.activeUpgrades.w_orbit ?? 0) * 6,
            2.5,
            this.playerX,
            this.playerZ,
            false,
            true,
            'magic'
          );
        }
      }
    }
  }

  private updatePlayer(dt: number): void {
    const stats = this.currentStats();

    this.boostSpeedTimer = Math.max(0, this.boostSpeedTimer - dt);
    this.boostRageTimer = Math.max(0, this.boostRageTimer - dt);
    this.boostShieldTimer = Math.max(0, this.boostShieldTimer - dt);

    if (this.rushTimer > 0) {
      this.rushTimer -= dt;
      if (this.rushTimer <= 0) this.rushStacks = 0;
    }

    // Heal-Over-Time Potion Tick
    if (this.hotRemaining > 0) {
      const healStep = Math.min(this.hotRemaining, this.hotRate * dt);
      this.hotRemaining -= healStep;
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healStep);
      if (this.hotRemaining < 0.05) this.hotRemaining = 0;
    }

    // Aegis Shield Recharge
    if (stats.maxShieldHp > 0) {
      if (this.shieldRegenDelay > 0) {
        this.shieldRegenDelay -= dt;
      } else if (this.shieldHp < stats.maxShieldHp) {
        this.shieldHp = Math.min(stats.maxShieldHp, this.shieldHp + 8 * stats.healAmp * dt);
      }
    }

    // Dash Charge Regeneration
    if (this.dashCharges < stats.maxDashCharges) {
      this.dashRechargeTimer -= dt;
      if (this.dashRechargeTimer <= 0) {
        this.dashCharges += 1;
        this.dashRechargeTimer = this.dashCharges < stats.maxDashCharges ? stats.dashCooldown : 0;
      }
    }

    const speedBoostMult = this.boostSpeedTimer > 0 ? 1.4 : 1.0;
    const rateMult =
      stats.attackRateMult *
      (this.boostSpeedTimer > 0 ? 1.3 : 1.0) *
      (this.boostRageTimer > 0 ? 1.35 : 1.0);

    this.primaryCooldown = Math.max(0, this.primaryCooldown - dt * rateMult);
    this.secondaryCooldown = Math.max(0, this.secondaryCooldown - dt * rateMult);
    this.playerInvulnTimer = Math.max(0, this.playerInvulnTimer - dt);
    this.blockTimer = Math.max(0, this.blockTimer - dt);
    this.bufferedPrimary = Math.max(0, this.bufferedPrimary - dt);
    this.bufferedSecondary = Math.max(0, this.bufferedSecondary - dt);
    this.bufferedDash = Math.max(0, this.bufferedDash - dt);

    if (this.playerHitFlashTimer > 0) {
      this.playerHitFlashTimer -= dt;
      if (this.playerHitFlashTimer <= 0) this.playerRig.setHitFlash(false);
    }

    const hasBoost =
      this.boostSpeedTimer > 0 ||
      this.boostRageTimer > 0 ||
      this.boostShieldTimer > 0 ||
      this.hotRemaining > 0;
    this.playerRig.boostAura.visible = hasBoost;
    if (hasBoost) {
      const auraColor =
        this.boostShieldTimer > 0
          ? 0xa855f7
          : this.boostRageTimer > 0
          ? 0xf97316
          : this.boostSpeedTimer > 0
          ? 0x38bdf8
          : 0x4ade80;
      (this.playerRig.boostAura.material as THREE.MeshBasicMaterial).color.setHex(auraColor);
      this.playerRig.boostAura.scale.setScalar(1 + Math.sin(this.clock.elapsedTime * 8) * 0.08);
    }

    let moveX = this.touchMoveX;
    let moveZ = this.touchMoveZ;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) moveX -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) moveX += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) moveZ -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) moveZ += 1;

    if (this.bufferedDash > 0 && this.dashCharges > 0 && this.dashTimer <= 0) {
      this.bufferedDash = 0;
      this.dashCharges -= 1;
      if (this.dashRechargeTimer <= 0) this.dashRechargeTimer = stats.dashCooldown;

      const dir =
        Math.hypot(moveX, moveZ) > 0.1
          ? normalize2D(moveX, moveZ)
          : { x: Math.sin(this.playerFacing), z: Math.cos(this.playerFacing) };
      this.dashDirX = dir.x;
      this.dashDirZ = dir.z;
      this.dashTimer = PLAYER_DASH_DURATION;
      this.playerInvulnTimer = Math.max(this.playerInvulnTimer, PLAYER_DASH_DURATION + 0.05);
      this.playerSquashY = 0.78;
      soundEngine.playDash();
      this.spawnParticles(this.playerX, 0.5, this.playerZ, 8, 0x93c5fd, 4.5);

      if (this.wearableId === 'iceborn_gauntlet') {
        this.spellbladeReady = true;
      }
      if ((this.activeUpgrades.c_phantom_dash ?? 0) > 0) {
        this.triggerAoeExplosion(this.playerX, this.playerZ, 3.0, 28, 0x818cf8, true, 'magic');
      }
      if ((this.activeUpgrades.c_reaper ?? 0) > 0) {
        this.fireHomingSoulBolts(2, 24);
      }
    }

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      this.playerVx = this.dashDirX * PLAYER_DASH_SPEED;
      this.playerVz = this.dashDirZ * PLAYER_DASH_SPEED;
    } else {
      const blockMult = this.blockTimer > 0 ? 0.55 : 1.0;
      const snapV = computeSnapVelocity(
        moveX,
        moveZ,
        this.playerVx,
        this.playerVz,
        stats.moveSpeed * speedBoostMult * blockMult,
        dt
      );
      this.playerVx = snapV.x;
      this.playerVz = snapV.z;
    }

    this.playerX += this.playerVx * dt;
    this.playerZ += this.playerVz * dt;
    const clamped = clampToArena({ x: this.playerX, z: this.playerZ }, PLAYER_RADIUS);
    this.playerX = clamped.x;
    this.playerZ = clamped.z;

    if (Math.hypot(this.touchAimX, this.touchAimZ) > 0.25) {
      this.playerFacing = Math.atan2(this.touchAimX, this.touchAimZ);
    } else if (this.hasMouseMoved && !this.touchControlsEnabled) {
      const dx = this.pointerWorldX - this.playerX;
      const dz = this.pointerWorldZ - this.playerZ;
      if (Math.hypot(dx, dz) > 0.2) this.playerFacing = Math.atan2(dx, dz);
    } else if (Math.hypot(moveX, moveZ) > 0.15) {
      this.playerFacing = Math.atan2(moveX, moveZ);
    }

    if (this.attackPhase === 'idle') {
      if (this.bufferedPrimary > 0 && this.primaryCooldown <= 0) {
        this.bufferedPrimary = 0;
        this.startPlayerAttack(false);
      } else if (this.bufferedSecondary > 0 && this.secondaryCooldown <= 0) {
        this.bufferedSecondary = 0;
        this.startPlayerAttack(true);
      }
    } else {
      this.advancePlayerAttack(dt);
    }

    const speed = Math.hypot(this.playerVx, this.playerVz);
    this.playerWalkCycle += speed * dt * 1.4;
    this.playerSquashY = THREE.MathUtils.damp(this.playerSquashY, 1, 14, dt);

    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);
    this.playerRig.root.rotation.y = this.playerFacing;
    const invSquash = 1 / Math.sqrt(Math.max(0.5, this.playerSquashY));
    this.playerRig.bodyGroup.scale.set(invSquash, this.playerSquashY, invSquash);

    if (speed > 0.4) {
      this.playerRig.leftLeg.rotation.x = Math.sin(this.playerWalkCycle) * 0.55;
      this.playerRig.rightLeg.rotation.x = -Math.sin(this.playerWalkCycle) * 0.55;
    } else {
      this.playerRig.leftLeg.rotation.x = THREE.MathUtils.damp(this.playerRig.leftLeg.rotation.x, 0, 12, dt);
      this.playerRig.rightLeg.rotation.x = THREE.MathUtils.damp(this.playerRig.rightLeg.rotation.x, 0, 12, dt);
    }

    this.playerRig.blockShield.visible = this.blockTimer > 0;
    if (this.blockTimer > 0) {
      this.playerRig.rightArm.rotation.set(-1.1, 0.7, 0);
      this.playerRig.leftArm.rotation.set(-1.1, -0.5, 0);
    } else if (this.attackPhase === 'windup') {
      this.playerRig.rightArm.rotation.set(-1.45, -0.6, 0);
    } else if (this.attackPhase === 'active') {
      this.playerRig.rightArm.rotation.set(-0.35, this.attackIsSecondary ? 0.1 : 0.9, 0);
    } else {
      const isRangedHold =
        this.weaponId === 'pistol' ||
        this.weaponId === 'sniper' ||
        this.weaponId === 'shotgun' ||
        this.weaponId === 'crossbow' ||
        this.weaponId === 'flamethrower' ||
        this.weaponId === 'railgun' ||
        this.weaponId === 'minigun' ||
        this.weaponId === 'starfire_bow';
      const defaultPitch = isRangedHold ? -1.35 : -0.35;
      this.playerRig.rightArm.rotation.x = THREE.MathUtils.damp(this.playerRig.rightArm.rotation.x, defaultPitch, 16, dt);
      this.playerRig.rightArm.rotation.y = THREE.MathUtils.damp(this.playerRig.rightArm.rotation.y, 0, 16, dt);
      this.playerRig.leftArm.rotation.x = THREE.MathUtils.damp(this.playerRig.leftArm.rotation.x, -0.2, 14, dt);
    }

    this.playerAimLine.visible =
      (this.weaponId === 'sniper' ||
        this.weaponId === 'crossbow' ||
        this.weaponId === 'railgun' ||
        this.weaponId === 'starfire_bow') &&
      this.screen === 'playing';
  }

  private startPlayerAttack(isSecondary: boolean): void {
    const spec = WEAPONS[this.weaponId];
    const move = isSecondary ? spec.secondary : spec.primary;
    const stats = this.currentStats();

    if (this.touchControlsEnabled && Math.hypot(this.touchAimX, this.touchAimZ) < 0.25) {
      let bestDist = Infinity;
      let bestAngle = this.playerFacing;
      for (const e of this.enemies) {
        if (e.state === 'ko' || e.state === 'phase') continue;
        const d = Math.hypot(e.x - this.playerX, e.z - this.playerZ);
        if (d < bestDist && d < move.range + 4.5) {
          bestDist = d;
          bestAngle = Math.atan2(e.x - this.playerX, e.z - this.playerZ);
        }
      }
      this.playerFacing = bestAngle;
    }

    this.attackPhase = 'windup';
    this.attackIsSecondary = isSecondary;
    this.attackPhaseTimer = move.windup;
    this.attackHitIds.clear();
    this.attackCount += 1;
    if (!isSecondary && this.weaponId === 'runic_gauntlets') {
      this.gauntletComboStep += 1;
    }

    if (isSecondary) {
      this.secondaryCooldown = move.cooldown * stats.cooldownMult;
      const overclock = this.activeUpgrades.w_overclock ?? 0;
      if (overclock > 0) {
        this.primaryCooldown *= overclock >= 2 ? 0.45 : 0.65;
      }
      if (this.wearableId === 'iceborn_gauntlet') {
        this.spellbladeReady = true;
      }
    } else {
      this.primaryCooldown = move.cooldown * stats.cooldownMult;
    }

    soundEngine.playAttack(this.weaponId, isSecondary);

    const lungeBoost = (this.activeUpgrades.w_pierce ?? 0) > 0 ? 1.45 : 1.0;
    if (
      (this.weaponId === 'sword' && isSecondary) ||
      (this.weaponId === 'katana' && isSecondary) ||
      (this.weaponId === 'axe' && isSecondary) ||
      (this.weaponId === 'halberd' && isSecondary) ||
      (this.weaponId === 'runic_gauntlets' && isSecondary)
    ) {
      const lunge = (this.weaponId === 'katana' ? 20 : 14) * lungeBoost;
      this.playerVx += Math.sin(this.playerFacing) * lunge;
      this.playerVz += Math.cos(this.playerFacing) * lunge;
    }

    if (this.weaponId === 'club' && isSecondary) {
      this.blockTimer = move.active;
      this.playerSquashY = 0.84;
    }
  }

  private advancePlayerAttack(dt: number): void {
    const spec = WEAPONS[this.weaponId];
    const move = this.attackIsSecondary ? spec.secondary : spec.primary;
    this.attackPhaseTimer -= dt;

    if (this.attackPhase === 'windup' && this.attackPhaseTimer <= 0) {
      this.attackPhase = 'active';
      this.attackPhaseTimer = move.active;
      this.executeActiveWeaponEffect();
    } else if (this.attackPhase === 'active') {
      const isMeleeMove =
        this.weaponId === 'sword' ||
        this.weaponId === 'club' ||
        this.weaponId === 'chain' ||
        this.weaponId === 'axe' ||
        this.weaponId === 'katana' ||
        this.weaponId === 'halberd' ||
        this.weaponId === 'greatsword' ||
        this.weaponId === 'frostbrand' ||
        (this.weaponId === 'runic_gauntlets' && !this.attackIsSecondary) ||
        (this.weaponId === 'scythe' && !this.attackIsSecondary) ||
        (this.weaponId === 'fangs' && !this.attackIsSecondary) ||
        (this.weaponId === 'railgun' && this.attackIsSecondary) ||
        (this.weaponId === 'grimoire' && this.attackIsSecondary) ||
        (this.weaponId === 'stormcaller_wand' && this.attackIsSecondary);

      if (isMeleeMove) {
        let dmg = this.scalePlayerDamage(move.damage);
        if (this.weaponId === 'runic_gauntlets' && !this.attackIsSecondary && this.gauntletComboStep % 3 === 0) {
          dmg = Math.round(dmg * 1.45);
        }
        this.checkMeleeHits(dmg, move.range, move.arcRad, move.knockback, move.damageType);
      }
      if (this.attackPhaseTimer <= 0) {
        this.attackPhase = 'recovery';
        this.attackPhaseTimer = move.recovery;
      }
    } else if (this.attackPhase === 'recovery' && this.attackPhaseTimer <= 0) {
      this.attackPhase = 'idle';
    }
  }

  private scalePlayerDamage(base: number): number {
    const rageMult = this.boostRageTimer > 0 ? 1.45 : 1.0;
    return Math.round(base * rageMult);
  }

  private resolveTargetPoint(maxDist = 14): { x: number; z: number } {
    if (this.hasMouseMoved && !this.touchControlsEnabled) {
      const dx = this.pointerWorldX - this.playerX;
      const dz = this.pointerWorldZ - this.playerZ;
      const d = Math.hypot(dx, dz);
      if (d <= maxDist) return clampToArena({ x: this.pointerWorldX, z: this.pointerWorldZ }, 2.2);
      const n = normalize2D(dx, dz);
      return clampToArena({ x: this.playerX + n.x * maxDist, z: this.playerZ + n.z * maxDist }, 2.2);
    }
    const fx = Math.sin(this.playerFacing);
    const fz = Math.cos(this.playerFacing);
    return clampToArena({ x: this.playerX + fx * Math.min(8, maxDist), z: this.playerZ + fz * Math.min(8, maxDist) }, 2.2);
  }

  private executeActiveWeaponEffect(): void {
    const spec = WEAPONS[this.weaponId];
    const move = this.attackIsSecondary ? spec.secondary : spec.primary;
    const fx = Math.sin(this.playerFacing);
    const fz = Math.cos(this.playerFacing);
    const dmg = this.scalePlayerDamage(move.damage);

    const twinRank = this.activeUpgrades.w_twin_arc ?? 0;
    const bounceRank = this.activeUpgrades.w_ricochet ?? 0;
    const pierceRank = this.activeUpgrades.w_pierce ?? 0;
    const exploRank = this.activeUpgrades.w_explosive ?? 0;

    const isExploProc =
      exploRank > 0 && ((this.attackCount % (exploRank >= 2 ? 2 : 3) === 0) || this.attackIsSecondary);

    const spawnShot = (
      kind: ProjectileKind,
      angleOffset: number,
      speed: number,
      life: number,
      pierce: boolean,
      color: number,
      homing = false,
      shotDmg = dmg,
      damageType: DamageType = move.damageType
    ) => {
      const a = this.playerFacing + angleOffset;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      this.spawnProjectile({
        fromPlayer: true,
        kind,
        damageType,
        x: this.playerX + dx * 1.05,
        z: this.playerZ + dz * 1.05,
        dirX: dx,
        dirZ: dz,
        speed,
        damage: shotDmg,
        knockback: move.knockback,
        life,
        pierce: pierce || pierceRank > 0,
        bouncesLeft: bounceRank,
        homing,
        color,
      });
    };

    if (
      this.weaponId === 'sword' ||
      this.weaponId === 'katana' ||
      this.weaponId === 'club' ||
      this.weaponId === 'axe' ||
      this.weaponId === 'halberd' ||
      this.weaponId === 'greatsword' ||
      this.weaponId === 'chain'
    ) {
      this.spawnSlashArc(this.playerX, this.playerZ, this.playerFacing, move.range, move.arcRad, spec.accentInt);
      if (this.weaponId === 'greatsword' && this.attackIsSecondary) {
        this.triggerAoeExplosion(this.playerX + fx * 1.5, this.playerZ + fz * 1.5, 4.4, Math.round(dmg * 0.65), 0xff6b35, false, 'magic');
      } else if (isExploProc) {
        this.triggerAoeExplosion(this.playerX + fx * 1.8, this.playerZ + fz * 1.8, 2.8, Math.round(dmg * 0.5), 0xf97316, false, move.damageType);
      }
      if (twinRank > 0) {
        spawnShot('arc_crescent', 0, 21, 0.45, true, spec.accentInt, false, Math.round(dmg * 0.55));
        if (twinRank >= 2) {
          spawnShot('arc_crescent', -0.22, 20, 0.42, true, spec.accentInt, false, Math.round(dmg * 0.45));
          spawnShot('arc_crescent', 0.22, 20, 0.42, true, spec.accentInt, false, Math.round(dmg * 0.45));
        }
      }
    } else if (this.weaponId === 'frostbrand') {
      this.spawnSlashArc(this.playerX, this.playerZ, this.playerFacing, move.range, move.arcRad, 0x67e8f9);
      if (!this.attackIsSecondary) {
        spawnShot('frost_wave', 0, 19, 0.55, true, 0x67e8f9, false, Math.round(dmg * 0.65), 'magic');
        if (twinRank > 0) {
          spawnShot('frost_wave', 0.2, 19, 0.5, true, 0x67e8f9, false, Math.round(dmg * 0.5), 'magic');
        }
      } else {
        // Glacial Shatter: extra +45% dmg vs chilled enemies
        for (const e of this.enemies) {
          if (e.state === 'ko' || e.state === 'phase') continue;
          if (Math.hypot(e.x - this.playerX, e.z - this.playerZ) <= move.range + ENEMY_ARCHETYPES[e.kind].radius) {
            const shatterDmg = e.chillTimer > 0 ? Math.round(dmg * 0.45) : 0;
            if (shatterDmg > 0) {
              this.damageEnemy(e, shatterDmg, 4, this.playerX, this.playerZ, false, true, 'magic');
            }
            e.chillTimer = Math.max(e.chillTimer, 3.0);
          }
        }
        this.spawnParticles(this.playerX, 0.9, this.playerZ, 22, 0x67e8f9, 8.5);
      }
    } else if (this.weaponId === 'runic_gauntlets') {
      if (!this.attackIsSecondary) {
        const isThird = this.gauntletComboStep % 3 === 0;
        this.spawnSlashArc(this.playerX, this.playerZ, this.playerFacing, move.range, move.arcRad, isThird ? 0xfacc15 : 0xf59e0b);
        if (isThird && twinRank > 0) {
          spawnShot('palm_wave', 0, 20, 0.42, true, 0xf59e0b, false, Math.round(dmg * 0.7), 'magic');
        }
      } else {
        this.spawnSlashArc(this.playerX, this.playerZ, this.playerFacing, 4.2, Math.PI * 0.65, 0xf59e0b);
        spawnShot('palm_wave', 0, 22, 0.45, true, 0xfacc15, false, dmg, 'magic');
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('palm_wave', t * 0.2, 22, 0.45, true, 0xfacc15, false, dmg, 'magic');
          spawnShot('palm_wave', -t * 0.2, 22, 0.45, true, 0xfacc15, false, dmg, 'magic');
        }
      }
    } else if (this.weaponId === 'arcane_staff') {
      if (!this.attackIsSecondary) {
        spawnShot('arcane_bolt', 0, 22, 1.15, false, 0xc084fc, true, dmg, 'magic');
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('arcane_bolt', t * 0.2, 21, 1.1, false, 0xc084fc, true, dmg, 'magic');
          spawnShot('arcane_bolt', -t * 0.2, 21, 1.1, false, 0xc084fc, true, dmg, 'magic');
        }
      } else {
        const pt = this.resolveTargetPoint(15);
        this.spawnHazardPool(pt.x, pt.z, 3.6, 0xc084fc, dmg, 0.55, true, true, true, 'magic');
      }
    } else if (this.weaponId === 'void_orb') {
      if (!this.attackIsSecondary) {
        spawnShot('void_orb', 0, 8.2, 2.2, true, 0xa855f7, false, dmg, 'magic');
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('void_orb', t * 0.22, 8.2, 2.0, true, 0xa855f7, false, Math.round(dmg * 0.8), 'magic');
          spawnShot('void_orb', -t * 0.22, 8.2, 2.0, true, 0xa855f7, false, Math.round(dmg * 0.8), 'magic');
        }
      } else {
        let detonatedAny = false;
        for (const p of this.projectiles) {
          if (p.active && p.fromPlayer && p.kind === 'void_orb') {
            detonatedAny = true;
            this.triggerAoeExplosion(p.x, p.z, 4.5, dmg, 0xa855f7, true, 'magic');
            p.active = false;
            p.mesh.visible = false;
          }
        }
        if (!detonatedAny) {
          const pt = this.resolveTargetPoint(11);
          this.triggerAoeExplosion(pt.x, pt.z, 4.4, dmg, 0xa855f7, true, 'magic');
        }
      }
    } else if (this.weaponId === 'stormcaller_wand') {
      if (!this.attackIsSecondary) {
        let target: ActiveEnemy | null = null;
        let bestScore = Infinity;
        for (const e of this.enemies) {
          if (e.state === 'ko' || e.state === 'phase') continue;
          const d = Math.hypot(e.x - this.playerX, e.z - this.playerZ);
          if (d > move.range) continue;
          const angle = Math.atan2(e.x - this.playerX, e.z - this.playerZ);
          const diff = Math.abs(shortestAngleDiff(this.playerFacing, angle));
          if (diff <= 0.7 && d + diff * 6 < bestScore) {
            bestScore = d + diff * 6;
            target = e;
          }
        }
        if (target) {
          this.damageEnemy(target, dmg, move.knockback, this.playerX, this.playerZ, false, pierceRank > 0, 'magic');
          this.spawnParticles(target.x, 1.1, target.z, 10, 0x38bdf8, 7);
          this.triggerChainZap(target, Math.round(dmg * 0.78), 3 + twinRank, 0x38bdf8, 'magic');
          soundEngine.playMagicZap();
        } else {
          this.spawnSlashArc(this.playerX, this.playerZ, this.playerFacing, 5.2, 0.5, 0x38bdf8);
        }
      } else {
        this.spawnSlashArc(this.playerX, this.playerZ, this.playerFacing, 5.4, Math.PI * 2, 0x38bdf8);
        for (const e of this.enemies) {
          if (e.state === 'ko' || e.state === 'phase') continue;
          if (Math.hypot(e.x - this.playerX, e.z - this.playerZ) <= 5.4 + ENEMY_ARCHETYPES[e.kind].radius) {
            e.rootTimer = Math.max(e.rootTimer, 1.25);
          }
        }
      }
    } else if (this.weaponId === 'cursed_censer') {
      if (!this.attackIsSecondary) {
        spawnShot('blight_wave', 0, 18, 0.72, true, 0x4ade80, false, dmg, 'magic');
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('blight_wave', t * 0.2, 18, 0.68, true, 0x4ade80, false, dmg, 'magic');
          spawnShot('blight_wave', -t * 0.2, 18, 0.68, true, 0x4ade80, false, dmg, 'magic');
        }
      } else {
        const pt = this.resolveTargetPoint(10);
        this.spawnHazardPool(pt.x, pt.z, 4.4, 0x22c55e, Math.round(dmg * 0.55), 4.2, false, true, true, 'magic');
        this.setBanner('WAILING LANTERN DEPLOYED', 1.1);
      }
    } else if (this.weaponId === 'starfire_bow') {
      if (!this.attackIsSecondary) {
        spawnShot('star_arrow', 0, 34, 0.75, false, 0xfde047, false, dmg, 'hybrid');
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('star_arrow', t * 0.14, 34, 0.72, false, 0xfde047, false, dmg, 'hybrid');
          spawnShot('star_arrow', -t * 0.14, 34, 0.72, false, 0xfde047, false, dmg, 'hybrid');
        }
      } else {
        const pt = this.resolveTargetPoint(15);
        this.spawnHazardPool(pt.x, pt.z, 4.2, 0xfde047, dmg, 0.5, true, true, false, 'magic');
      }
    } else if (this.weaponId === 'scythe') {
      if (!this.attackIsSecondary) {
        this.spawnSlashArc(this.playerX, this.playerZ, this.playerFacing, move.range, move.arcRad, 0xc084fc);
        if (twinRank > 0) spawnShot('scythe_wave', 0, 21, 0.55, true, 0xc084fc, false, Math.round(dmg * 0.6), 'magic');
      } else {
        spawnShot('scythe_wave', 0, 22, 0.7, true, 0xc084fc, false, dmg, 'magic');
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('scythe_wave', t * 0.18, 22, 0.65, true, 0xc084fc, false, dmg, 'magic');
          spawnShot('scythe_wave', -t * 0.18, 22, 0.65, true, 0xc084fc, false, dmg, 'magic');
        }
      }
    } else if (this.weaponId === 'fangs') {
      if (!this.attackIsSecondary) {
        this.spawnSlashArc(this.playerX, this.playerZ, this.playerFacing, move.range, move.arcRad, 0x4ade80);
      } else {
        spawnShot('fang', 0, 21, 0.7, false, 0x4ade80, false, dmg, 'magic');
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('fang', t * 0.15, 21, 0.65, false, 0x4ade80, false, dmg, 'magic');
          spawnShot('fang', -t * 0.15, 21, 0.65, false, 0x4ade80, false, dmg, 'magic');
        }
      }
    } else if (this.weaponId === 'pistol' || this.weaponId === 'minigun') {
      const spd = this.weaponId === 'minigun' ? 36 : 32;
      if (!this.attackIsSecondary) {
        const jitter = this.weaponId === 'minigun' ? (Math.random() - 0.5) * 0.12 : 0;
        spawnShot('pistol', jitter, spd, 0.62, false, spec.accentInt);
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('pistol', jitter + t * 0.12, spd, 0.6, false, spec.accentInt);
          spawnShot('pistol', jitter - t * 0.12, spd, 0.6, false, spec.accentInt);
        }
      } else {
        const spread = this.weaponId === 'minigun' ? 3 : 2;
        for (let i = -spread; i <= spread; i++) {
          spawnShot('pistol', i * 0.11, spd - 2, 0.55, false, 0xfde047);
        }
      }
    } else if (this.weaponId === 'shotgun') {
      if (!this.attackIsSecondary) {
        const half = 2.5 + twinRank;
        for (let i = -half; i <= half; i += 1) {
          spawnShot('shotgun', i * 0.085, 28, 0.42, false, 0xfb7185);
        }
      } else {
        spawnShot('slug', 0, 36, 0.52, false, 0xfda4af);
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('slug', t * 0.12, 35, 0.5, false, 0xfda4af);
          spawnShot('slug', -t * 0.12, 35, 0.5, false, 0xfda4af);
        }
      }
    } else if (this.weaponId === 'crossbow') {
      const k: ProjectileKind = this.attackIsSecondary ? 'blast_bolt' : 'bolt';
      spawnShot(k, 0, 34, 0.72, !this.attackIsSecondary, this.attackIsSecondary ? 0xf97316 : 0xa78bfa);
      for (let t = 1; t <= twinRank; t++) {
        spawnShot(k, t * 0.14, 34, 0.7, !this.attackIsSecondary, 0xa78bfa);
        spawnShot(k, -t * 0.14, 34, 0.7, !this.attackIsSecondary, 0xa78bfa);
      }
    } else if (this.weaponId === 'flamethrower') {
      if (!this.attackIsSecondary) {
        for (let i = -1 - twinRank; i <= 1 + twinRank; i++) {
          spawnShot('flame', i * 0.14, 17, 0.45, true, 0xf97316, false, dmg, 'magic');
        }
      } else {
        spawnShot('fireball', 0, 20, 0.75, false, 0xfb923c, false, dmg, 'magic');
        if (twinRank > 0) {
          spawnShot('fireball', -0.2, 20, 0.7, false, 0xfb923c, false, dmg, 'magic');
          spawnShot('fireball', 0.2, 20, 0.7, false, 0xfb923c, false, dmg, 'magic');
        }
      }
    } else if (this.weaponId === 'sniper' || this.weaponId === 'railgun') {
      if (!this.attackIsSecondary) {
        const k: ProjectileKind = this.weaponId === 'railgun' ? 'rail' : 'sniper';
        spawnShot(k, 0, 52, 0.62, true, spec.accentInt);
        for (let t = 1; t <= twinRank; t++) {
          spawnShot(k, t * 0.1, 50, 0.6, true, spec.accentInt);
          spawnShot(k, -t * 0.1, 50, 0.6, true, spec.accentInt);
        }
      } else if (this.weaponId === 'sniper') {
        this.deploySnareTrap(this.playerX + fx * 1.4, this.playerZ + fz * 1.4);
      } else {
        this.triggerAoeExplosion(this.playerX, this.playerZ, 5.2, dmg, 0x22d3ee, true, 'magic');
      }
    } else if (this.weaponId === 'chakram') {
      if (!this.attackIsSecondary) {
        spawnShot('chakram', 0, 24, 1.15, true, 0xfda4af);
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('chakram', t * 0.18, 24, 1.1, true, 0xfda4af);
          spawnShot('chakram', -t * 0.18, 24, 1.1, true, 0xfda4af);
        }
      } else {
        for (let i = -1 - twinRank; i <= 1 + twinRank; i++) {
          spawnShot('chakram', i * 0.24, 24, 1.1, true, 0xf43f5e);
        }
      }
    } else if (this.weaponId === 'grimoire') {
      if (!this.attackIsSecondary) {
        spawnShot('skull', 0, 18, 1.25, false, 0x4ade80, true, dmg, 'magic');
        for (let t = 1; t <= twinRank; t++) {
          spawnShot('skull', t * 0.25, 18, 1.2, false, 0x4ade80, true, dmg, 'magic');
          spawnShot('skull', -t * 0.25, 18, 1.2, false, 0x4ade80, true, dmg, 'magic');
        }
      } else {
        this.triggerAoeExplosion(this.playerX, this.playerZ, 5.6, dmg, 0x4ade80, true, 'magic');
      }
    }
  }

  private fireHomingSoulBolts(count: number, damage: number): void {
    for (let i = 0; i < count; i++) {
      const a = this.playerFacing + (i === 0 ? -0.45 : 0.45);
      this.spawnProjectile({
        fromPlayer: true,
        kind: 'soul_bolt',
        damageType: 'magic',
        x: this.playerX,
        z: this.playerZ,
        dirX: Math.sin(a),
        dirZ: Math.cos(a),
        speed: 20,
        damage,
        knockback: 4,
        life: 1.4,
        pierce: false,
        bouncesLeft: 0,
        homing: true,
        color: 0xe11d48,
      });
    }
  }

  private deploySnareTrap(x: number, z: number): void {
    const clamped = clampToArena({ x, z }, 0.8);
    if (this.traps.length >= 4) {
      const oldest = this.traps.shift();
      if (oldest) this.scene.remove(oldest.mesh);
    }
    const mesh = createSnareTrapMesh();
    mesh.position.set(clamped.x, 0, clamped.z);
    this.scene.add(mesh);
    this.traps.push({ id: this.nextEntityId++, x: clamped.x, z: clamped.z, life: 24, mesh });
  }

  private checkMeleeHits(
    damage: number,
    range: number,
    arcRad: number,
    knockback: number,
    damageType: DamageType
  ): void {
    const bypassArmor = (this.activeUpgrades.w_pierce ?? 0) > 0;
    const bounceRank = this.activeUpgrades.w_ricochet ?? 0;
    const overclockRank = this.activeUpgrades.w_overclock ?? 0;

    for (const enemy of this.enemies) {
      if (enemy.state === 'ko' || enemy.state === 'phase' || this.attackHitIds.has(enemy.id)) continue;
      const spec = ENEMY_ARCHETYPES[enemy.kind];
      if (isPointInCone(this.playerX, this.playerZ, this.playerFacing, enemy.x, enemy.z, spec.radius, range, arcRad)) {
        this.attackHitIds.add(enemy.id);
        this.damageEnemy(
          enemy,
          damage,
          knockback,
          this.playerX,
          this.playerZ,
          this.weaponId === 'fangs',
          bypassArmor,
          damageType
        );
        if (this.weaponId === 'frostbrand') {
          enemy.chillTimer = Math.max(enemy.chillTimer, 2.5);
        }
        if (this.spellbladeReady && !this.attackIsSecondary) {
          this.triggerSpellbladeProc(enemy.x, enemy.z);
        }
        if (overclockRank > 0) this.secondaryCooldown = Math.max(0, this.secondaryCooldown - 0.14 * overclockRank);
        if (bounceRank > 0) this.triggerChainZap(enemy, Math.round(damage * 0.55), bounceRank, 0xa78bfa, 'magic');
      }
    }
  }

  private triggerSpellbladeProc(x: number, z: number): void {
    this.spellbladeReady = false;
    this.spawnHazardPool(x, z, 3.2, 0x22d3ee, 18, 2.4, false, true, true, 'magic');
    this.spawnParticles(x, 0.8, z, 14, 0x67e8f9, 7.5);
  }

  private triggerChainZap(
    sourceEnemy: ActiveEnemy,
    dmg: number,
    count: number,
    colorHex = 0xa78bfa,
    damageType: DamageType = 'magic'
  ): void {
    let left = count;
    for (const other of this.enemies) {
      if (other.id === sourceEnemy.id || other.state === 'ko' || other.state === 'phase') continue;
      if (Math.hypot(other.x - sourceEnemy.x, other.z - sourceEnemy.z) <= 6.2) {
        this.damageEnemy(other, dmg, 2, sourceEnemy.x, sourceEnemy.z, false, true, damageType);
        this.spawnParticles((sourceEnemy.x + other.x) * 0.5, 1.0, (sourceEnemy.z + other.z) * 0.5, 6, colorHex, 5);
        left -= 1;
        if (left <= 0) break;
      }
    }
  }

  private triggerAoeExplosion(
    x: number,
    z: number,
    radius: number,
    damage: number,
    colorHex: number,
    chill = false,
    damageType: DamageType = 'magic'
  ): void {
    soundEngine.playExplosion();
    this.spawnParticles(x, 0.9, z, 22, colorHex, 9.5);
    this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.35);
    for (const enemy of this.enemies) {
      if (enemy.state === 'ko' || enemy.state === 'phase') continue;
      const d = Math.hypot(enemy.x - x, enemy.z - z);
      if (d <= radius + ENEMY_ARCHETYPES[enemy.kind].radius) {
        if (chill) enemy.chillTimer = Math.max(enemy.chillTimer, 2.6);
        this.damageEnemy(enemy, damage, 9, x, z, false, true, damageType);
      }
    }
  }

  private damageEnemy(
    enemy: ActiveEnemy,
    baseDamage: number,
    knockback: number,
    originX: number,
    originZ: number,
    applyVenom: boolean,
    bypassArmor: boolean,
    damageType: DamageType = 'physical'
  ): void {
    const elemRank = this.activeUpgrades.w_elemental ?? 0;
    const pierceRank = this.activeUpgrades.w_pierce ?? 0;
    const result = computeEnemyDamage({
      baseDamage,
      damageType,
      enemyKind: enemy.kind,
      enemyFacing: enemy.facing,
      enemyX: enemy.x,
      enemyZ: enemy.z,
      hitOriginX: originX,
      hitOriginZ: originZ,
      coreExposed: enemy.coreExposedTimer > 0,
      bypassArmor: bypassArmor || pierceRank > 0,
      shatterRank: pierceRank,
      magicAmpRank: elemRank,
    });

    enemy.hp -= result.damage;
    enemy.recentHitTimer = ENEMY_HEALTHBAR_VISIBLE_SECONDS;
    enemy.lastHitWasWeakPoint = result.isWeakPoint;
    enemy.hitFlashTimer = 0.07;
    enemy.squashY = 1.24;
    enemy.rig.setHitFlash(true, result.isWeakPoint ? 0xfacc15 : result.isArmored ? 0x94a3b8 : 0xffffff);

    // Spawn color-coded floating damage number
    const popupColor = result.isWeakPoint
      ? '#facc15'
      : result.isArmored
      ? '#94a3b8'
      : result.damageType === 'magic'
      ? '#38bdf8'
      : result.damageType === 'hybrid'
      ? '#fde047'
      : '#fb923c';
    const popupText = result.isWeakPoint
      ? `${result.damage}!`
      : result.isArmored
      ? `⛨${result.damage}`
      : `${result.damage}`;
    this.spawnDamagePopup(enemy.x, 1.85, enemy.z, popupText, {
      color: popupColor,
      fontSize: result.isWeakPoint ? 17 : result.isArmored ? 12 : 14,
    });

    if (applyVenom || elemRank > 0) {
      enemy.poisonTicks = Math.max(enemy.poisonTicks, 3 + elemRank);
      enemy.poisonTickTimer = 0.7;
      if (elemRank > 0) enemy.chillTimer = Math.max(enemy.chillTimer, 2.4 + elemRank * 0.8);
    }

    const push = normalize2D(enemy.x - originX, enemy.z - originZ);
    const kbMult = ENEMY_ARCHETYPES[enemy.kind].isBoss ? 0.15 : ENEMY_ARCHETYPES[enemy.kind].hasWeakPoint ? 0.45 : 1.0;
    enemy.vx += push.x * knockback * kbMult;
    enemy.vz += push.z * knockback * kbMult;

    soundEngine.playHit(result.isWeakPoint, result.isArmored);

    if (result.isWeakPoint) {
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.045);
      this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.28);
      this.spawnParticles(enemy.x, 1.1, enemy.z, 16, 0xff8c00, 8);
    } else if (result.isArmored) {
      this.spawnParticles(enemy.x, 1.0, enemy.z, 6, 0x94a3b8, 5.5);
    } else {
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.024);
      this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.14);
      this.spawnParticles(
        enemy.x,
        0.9,
        enemy.z,
        10,
        applyVenom ? 0x4ade80 : result.damageType === 'magic' ? 0x38bdf8 : 0xef4444,
        6
      );
    }

    if (enemy.hp <= 0 && enemy.state !== 'ko') {
      this.koEnemy(enemy);
    }
  }

  private koEnemy(enemy: ActiveEnemy): void {
    enemy.state = 'ko';
    enemy.koTimer = 0.34;
    if (enemy.hasToken) {
      enemy.hasToken = false;
      this.activeAttackTokens = Math.max(0, this.activeAttackTokens - 1);
    }
    if (enemy.webLine) {
      this.scene.remove(enemy.webLine);
      enemy.webLine = null;
    }
    if (enemy.telegraphRing) {
      this.scene.remove(enemy.telegraphRing);
      enemy.telegraphRing = null;
    }
    if (enemy.rig.laserLine) enemy.rig.laserLine.visible = false;

    const spec = ENEMY_ARCHETYPES[enemy.kind];
    this.kills += 1;
    this.noHitKills += 1;
    this.waveKills += 1;
    this.combo += 1;
    this.comboTimer = 3.8;
    const comboMult = Math.min(4, 1 + Math.floor(this.combo / 3) * 0.5);
    const noHitMult = computeNoHitScoreMultiplier(this.noHitKills);
    this.score += Math.round(spec.scoreValue * comboMult * noHitMult);
    this.updateBestScore();

    // Magma Slime splits into 2 Molten Shards unless finished by Weak-Point Crit!
    if (enemy.kind === 'magma_slime' && !enemy.lastHitWasWeakPoint) {
      this.spawnEnemyAt('magma_mite', enemy.x - 0.85, enemy.z + 0.55);
      this.spawnEnemyAt('magma_mite', enemy.x + 0.85, enemy.z - 0.55);
      this.spawnParticles(enemy.x, 0.8, enemy.z, 14, 0xff6b00, 7);
    }

    // Character Tree: Executioner Momentum stacks on kills
    if ((this.activeUpgrades.c_rush ?? 0) > 0) {
      this.rushStacks = Math.min(5, this.rushStacks + 1);
      this.rushTimer = 4.0;
    }

    // Weapon Tree: Soul Siphon every 4th kill refills Dash & extends Potion HoT
    const siphonRank = this.activeUpgrades.w_siphon ?? 0;
    if (siphonRank > 0 && this.kills % 4 === 0) {
      const stats = this.currentStats();
      this.dashCharges = Math.min(stats.maxDashCharges, this.dashCharges + 1);
      if (this.hotRemaining > 0) this.hotRemaining += 8 * siphonRank;
      this.spawnParticles(this.playerX, 1.0, this.playerZ, 8, 0xf43f5e, 6);
    }

    this.hitstopTimer = Math.max(this.hitstopTimer, 0.045);
    this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.25);
    soundEngine.playKill();
    this.spawnParticles(enemy.x, 0.9, enemy.z, spec.isBoss ? 42 : 18, spec.hasWeakPoint ? 0xf97316 : 0xdc2626, 8);

    // Super rare Potions & Temp Boost crystals (NO gold, NO weapon drops!)
    const drops = rollEnemyDrops(enemy.kind, Math.random);
    if (drops.extraPickup) {
      this.spawnWorldPickup(drops.extraPickup, enemy.x, enemy.z);
    }

    if (spec.isBoss) {
      this.handleBossDefeated();
    }

    this.emitHud();
  }

  private handleBossDefeated(): void {
    this.isBossWave = false;
    if (this.mapId === 5) {
      this.screen = 'victory';
      soundEngine.playVictory();
      this.setBanner('SATAN DEFEATED · HELL VANQUISHED!', 4.0);
      this.syncBodyState();
    } else {
      // Physical Transition: Free Potion Chest + Character Evolution Shrines + Energized North Portal!
      this.clearRewardProps();
      this.shrineClaimed = false;
      this.chestOpened = false;
      this.setPortalVisualActive(true);
      this.waveRewardState = 'portal_open';

      const shrineChoices = generateBossShrineChoices(this.activeUpgrades);
      const sxOffsets =
        shrineChoices.length === 3 ? [-3.8, 0, 3.8] : shrineChoices.length === 2 ? [-2.4, 2.4] : [0];
      for (let i = 0; i < shrineChoices.length; i++) {
        const nodeId = shrineChoices[i];
        const sx = sxOffsets[i] ?? 0;
        const sz = -2.8;
        const built = createShrineMesh(nodeId);
        built.root.position.set(sx, -1.6, sz);
        this.scene.add(built.root);
        this.shrines.push({
          id: this.nextEntityId++,
          x: sx,
          z: sz,
          nodeId,
          claimed: false,
          sinking: false,
          sinkProgress: 0,
          riseProgress: 0,
          root: built.root,
          crystal: built.crystal,
        });
      }

      this.spawnWorldChest(0, 1.8);
      soundEngine.playVictory();
      this.setBanner(`MAP ${this.mapId} CLEARED · CLAIM A SHRINE & ENTER THE NORTH PORTAL!`, 4.0);
    }
  }

  private updateBestScore(): void {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(this.bestScore));
      } catch {
        // Ignore storage errors
      }
    }
  }

  private spawnWorldPickup(
    kind: PickupKind,
    x: number,
    z: number,
    vel?: { vx: number; vz: number; vy: number }
  ): void {
    if (this.pickups.length >= 20) {
      const oldest = this.pickups.shift();
      if (oldest) this.scene.remove(oldest.group);
    }
    const clamped = clampToArena({ x, z }, 0.9, ARENA_RADIUS - 1);
    const group = new THREE.Group();
    group.position.set(clamped.x, 0, clamped.z);

    const mapColor: Record<PickupKind, number> = {
      potion: 0xf43f5e,
      boost_speed: 0x38bdf8,
      boost_rage: 0xf97316,
      boost_shield: 0xa855f7,
    };
    const accent = mapColor[kind];
    const propMesh = createPickupPropMesh(kind);
    propMesh.position.y = 0.72;

    const ringGeo = new THREE.RingGeometry(0.55, 0.76, 14);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.74,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.03;

    group.add(ringMesh, propMesh, createContactShadow(this.textures, 0.6));
    this.scene.add(group);
    this.pickups.push({
      id: this.nextEntityId++,
      kind,
      x: clamped.x,
      z: clamped.z,
      vx: vel?.vx ?? 0,
      vz: vel?.vz ?? 0,
      vy: vel?.vy ?? 0,
      y: vel ? 0.45 : 0,
      life: 26,
      group,
      propMesh,
      ringMesh,
    });
  }

  private updatePickups(dt: number): void {
    const t = this.clock.elapsedTime;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.life -= dt;

      if (p.y > 0 || p.vy > 0) {
        p.vy -= 18 * dt;
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        if (p.y <= 0) {
          p.y = 0;
          p.vy = 0;
          p.vx = 0;
          p.vz = 0;
        }
        const c = clampToArena({ x: p.x, z: p.z }, 0.9);
        p.x = c.x;
        p.z = c.z;
      }

      p.propMesh.rotation.y += dt * 2.4;
      p.propMesh.position.y = 0.72 + p.y + Math.sin(t * 3.5 + p.id) * 0.14;
      p.ringMesh.scale.setScalar(0.92 + Math.sin(t * 5 + p.id) * 0.1);
      p.group.position.set(p.x, 0, p.z);

      const dx = this.playerX - p.x;
      const dz = this.playerZ - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 4.5 && dist > 0.05 && p.y <= 0.15) {
        const pull = 11.0 * dt;
        p.x += (dx / dist) * pull;
        p.z += (dz / dist) * pull;
        p.group.position.set(p.x, 0, p.z);
      }
      if (dist < 1.25 && p.y <= 0.35) {
        this.collectPickup(p);
        this.scene.remove(p.group);
        this.pickups.splice(i, 1);
        continue;
      }

      if (p.life <= 0) {
        this.scene.remove(p.group);
        this.pickups.splice(i, 1);
      }
    }
  }

  private collectPickup(p: WorldPickup): void {
    if (p.kind === 'potion') {
      const stats = this.currentStats();
      if (this.potions < stats.maxPotions) {
        this.potions += 1;
        soundEngine.playPickup();
        this.spawnParticles(this.playerX, 1.0, this.playerZ, 12, 0xf43f5e, 6);
        this.setBanner(`POTION COLLECTED (${this.potions}/${stats.maxPotions}) · PRESS [H] TO DRINK`, 1.9);
      } else {
        this.hotRemaining += Math.round(stats.potionHealTotal * 0.35);
        this.hotRate = stats.potionHealTotal / stats.potionDuration;
        soundEngine.playHeal();
        this.setBanner('SATCHEL FULL · SIPPED BONUS HEAL OVER TIME', 1.4);
      }
    } else if (p.kind === 'boost_speed') {
      this.boostSpeedTimer = 10.0;
      soundEngine.playBoost();
      this.spawnParticles(this.playerX, 1.0, this.playerZ, 14, 0x38bdf8, 7);
      this.setBanner('HASTE CRYSTAL · +40% SPEED (10s)', 1.7);
    } else if (p.kind === 'boost_rage') {
      this.boostRageTimer = 10.0;
      soundEngine.playBoost();
      this.spawnParticles(this.playerX, 1.0, this.playerZ, 14, 0xf97316, 7);
      this.setBanner('FURY CRYSTAL · +45% POWER & RATE (10s)', 1.7);
    } else if (p.kind === 'boost_shield') {
      this.boostShieldTimer = 10.0;
      soundEngine.playBoost();
      this.spawnParticles(this.playerX, 1.0, this.playerZ, 14, 0xa855f7, 7);
      this.setBanner('AEGIS CRYSTAL · 70% DAMAGE REDUCTION (10s)', 1.7);
    }
    this.emitHud();
  }

  private updateWaveSpawner(dt: number): void {
    if (this.isBossWave || this.waveRewardState !== 'none' || this.portalActive) return;

    const aliveCount = this.enemies.filter((e) => e.state !== 'ko').length;
    if (this.waveSpawned < this.wavePlan.totalEnemies && aliveCount < this.wavePlan.maxConcurrent) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.wavePlan.spawnInterval;
        const pool = this.wavePlan.pool;
        const kind = pool[(this.waveSpawned * 3 + Math.floor(Math.random() * pool.length)) % pool.length];
        const angle = Math.random() * Math.PI * 2;
        const pt = computeOffscreenSpawnPoint(this.playerX, this.playerZ, angle);
        this.spawnEnemyAt(kind, pt.x, pt.z);
        this.waveSpawned += 1;
      }
    } else if (this.waveSpawned >= this.wavePlan.totalEnemies && aliveCount === 0) {
      if (this.waveClearDelayTimer <= 0) {
        this.waveClearDelayTimer = 0.65;
      } else {
        this.waveClearDelayTimer -= dt;
        if (this.waveClearDelayTimer <= 0) {
          this.enterWaveRewardPhase();
        }
      }
    }
  }

  private startBossEncounter(): void {
    const mapSpec = MAPS[this.mapId];
    this.isBossWave = true;
    const boss = this.spawnEnemyAt(mapSpec.bossKind, 0, -16.5);
    soundEngine.playBossRoar();
    this.cameraTrauma = 0.45;
    this.setBanner(`BOSS: ${mapSpec.bossName.toUpperCase()}`, 3.0);
    this.spawnParticles(boss.x, 1.5, boss.z, 28, mapSpec.accentHex, 10);
    this.emitHud();
  }

  private spawnEnemyAt(kind: EnemyKind, x: number, z: number): ActiveEnemy {
    const spec = ENEMY_ARCHETYPES[kind];
    const mapSpec = MAPS[this.mapId];
    const rig = createEnemyRig(kind, this.textures);
    rig.root.position.set(x, 0, z);
    this.scene.add(rig.root);

    const hpMult = spec.isBoss ? 1.0 : mapSpec.enemyHpMult;
    const maxHp = Math.round(spec.maxHp * hpMult);

    const enemy: ActiveEnemy = {
      id: this.nextEntityId++,
      kind,
      rig,
      x,
      z,
      vx: 0,
      vz: 0,
      facing: Math.atan2(this.playerX - x, this.playerZ - z),
      hp: maxHp,
      maxHp,
      ghostHp: maxHp,
      recentHitTimer: 0,
      lastHitWasWeakPoint: false,
      damageMult: spec.isBoss ? 1.0 : mapSpec.enemyDmgMult,
      speedMult: spec.isBoss ? 1.0 : mapSpec.enemySpeedMult,
      state: 'chase',
      stateTimer: 0,
      attackCooldown: spec.isBoss ? 1.0 : 0.4 + Math.random() * 0.5,
      hasToken: false,
      hitFlashTimer: 0,
      poisonTicks: 0,
      poisonTickTimer: 0,
      chillTimer: 0,
      rootTimer: 0,
      coreExposedTimer: 0,
      phaseCooldown: 3.5 + Math.random() * 2.5,
      projDodgeCounter: 0,
      leapStartX: x,
      leapStartZ: z,
      leapTargetX: x,
      leapTargetZ: z,
      webLine: null,
      telegraphRing: null,
      burstShotsLeft: 0,
      burstTimer: 0,
      bossPattern: 0,
      koTimer: 0,
      squashY: 1,
    };
    this.enemies.push(enemy);
    return enemy;
  }

  private updateEnemies(dt: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const spec = ENEMY_ARCHETYPES[e.kind];

      e.ghostHp = THREE.MathUtils.damp(e.ghostHp, Math.max(0, e.hp), 8.5, dt);
      if (e.recentHitTimer > 0) e.recentHitTimer = Math.max(0, e.recentHitTimer - dt);

      if (e.state === 'ko') {
        e.koTimer -= dt;
        const p = 1 - Math.max(0, e.koTimer / 0.34);
        e.rig.bodyGroup.rotation.x = p * 1.45;
        e.rig.bodyGroup.position.y = -p * 0.35;
        e.rig.root.position.x += e.vx * dt;
        e.rig.root.position.z += e.vz * dt;
        e.vx *= Math.exp(-8 * dt);
        e.vz *= Math.exp(-8 * dt);
        if (e.koTimer <= 0) {
          this.scene.remove(e.rig.root);
          this.enemies.splice(i, 1);
        }
        continue;
      }

      if (e.hitFlashTimer > 0) {
        e.hitFlashTimer -= dt;
        if (e.hitFlashTimer <= 0) e.rig.setHitFlash(false);
      }

      if (e.poisonTicks > 0) {
        e.rig.setPoisonTint(true);
        e.poisonTickTimer -= dt;
        if (e.poisonTickTimer <= 0) {
          e.poisonTickTimer = 0.72;
          e.poisonTicks -= 1;
          this.damageEnemy(e, 10, 0.4, e.x, e.z, false, true, 'magic');
          if (e.hp <= 0) continue;
        }
      } else {
        e.rig.setPoisonTint(false);
      }

      if (e.chillTimer > 0) e.chillTimer = Math.max(0, e.chillTimer - dt);
      if (e.coreExposedTimer > 0) e.coreExposedTimer -= dt;
      if (e.rig.coreWeakPoint) {
        e.rig.coreWeakPoint.rotation.y += dt * (e.coreExposedTimer > 0 ? 12 : 3);
        e.rig.coreWeakPoint.scale.setScalar(e.coreExposedTimer > 0 ? 1.45 : 1.0);
      }
      if (e.rig.wingGroup) {
        e.rig.wingGroup.rotation.x = Math.sin(this.clock.elapsedTime * 7 + e.id) * 0.18;
      }

      e.attackCooldown = Math.max(0, e.attackCooldown - dt);
      e.rootTimer = Math.max(0, e.rootTimer - dt);
      e.phaseCooldown = Math.max(0, e.phaseCooldown - dt);
      e.squashY = THREE.MathUtils.damp(e.squashY, 1, 12, dt);

      const dx = this.playerX - e.x;
      const dz = this.playerZ - e.z;
      const dist = Math.hypot(dx, dz);
      const dirToPlayer = normalize2D(dx, dz);
      const desiredFacing = Math.atan2(dx, dz);
      const chillMult = e.chillTimer > 0 ? 0.6 : 1.0;
      const frozenHeartSlow =
        this.wearableId === 'frozen_heart' && dist <= 6.0 ? 0.78 : 1.0;
      const bossEnraged = Boolean(spec.isBoss && e.hp < e.maxHp * 0.55);
      const effSpeed = spec.speed * e.speedMult * chillMult * frozenHeartSlow * (bossEnraged ? 1.24 : 1.0);

      if (e.rootTimer > 0) {
        e.vx *= Math.exp(-14 * dt);
        e.vz *= Math.exp(-14 * dt);
      } else if (e.state === 'phase') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          const destAngle =
            e.kind === 'hell_warlock'
              ? Math.atan2(e.x - this.playerX, e.z - this.playerZ) + (Math.random() - 0.5) * 1.1
              : this.playerFacing + Math.PI + (Math.random() - 0.5) * 1.4;
          const destDist = e.kind === 'hell_warlock' ? 11.5 : 3.2;
          const dest = clampToArena(
            { x: this.playerX + Math.sin(destAngle) * destDist, z: this.playerZ + Math.cos(destAngle) * destDist },
            spec.radius
          );
          e.x = dest.x;
          e.z = dest.z;
          e.rig.root.visible = true;
          e.state = 'chase';
          e.phaseCooldown = 4.5;
          this.spawnParticles(e.x, 1.0, e.z, 10, e.kind === 'void_reaper' ? 0x22c55e : 0xf97316, 6);
        }
        continue;
      } else if (e.state === 'chase') {
        const turnSpeed = spec.hasWeakPoint ? 4.2 : 9.0;
        e.facing += shortestAngleDiff(e.facing, desiredFacing) * Math.min(1, turnSpeed * dt);

        if ((e.kind === 'wraith' || e.kind === 'void_reaper') && dist > 6.0 && dist < 14 && e.phaseCooldown <= 0) {
          this.spawnParticles(e.x, 1.0, e.z, 10, e.kind === 'void_reaper' ? 0x22c55e : 0xa855f7, 5);
          e.rig.root.visible = false;
          e.state = 'phase';
          e.stateTimer = 0.4;
          continue;
        }
        if (e.kind === 'hell_warlock' && dist < 3.6 && e.phaseCooldown <= 0) {
          this.spawnParticles(e.x, 1.0, e.z, 10, 0xf97316, 5);
          e.rig.root.visible = false;
          e.state = 'phase';
          e.stateTimer = 0.35;
          continue;
        }

        if (e.kind === 'robot_pistol' || e.kind === 'robot_sniper' || e.kind === 'robot_pyro') {
          const idealDist = e.kind === 'robot_sniper' ? 13.5 : e.kind === 'robot_pyro' ? 6.5 : 8.5;
          let mx = 0;
          let mz = 0;
          if (dist > idealDist + 1.5) { mx = dirToPlayer.x; mz = dirToPlayer.z; }
          else if (dist < idealDist - 2.0) { mx = -dirToPlayer.x * 0.7; mz = -dirToPlayer.z * 0.7; }
          else {
            const s = e.id % 2 === 0 ? 1 : -1;
            mx = -dirToPlayer.z * s * 0.75;
            mz = dirToPlayer.x * s * 0.75;
          }
          e.vx = THREE.MathUtils.damp(e.vx, mx * effSpeed, 10, dt);
          e.vz = THREE.MathUtils.damp(e.vz, mz * effSpeed, 10, dt);
        } else if (
          e.kind === 'skeleton' ||
          e.kind === 'skeleton_archer' ||
          e.kind === 'spider_spitter' ||
          e.kind === 'cultist' ||
          e.kind === 'imp' ||
          e.kind === 'magma_imp' ||
          e.kind === 'plague_archon' ||
          e.kind === 'wisp_lantern' ||
          e.kind === 'bog_shaman' ||
          e.kind === 'hell_warlock' ||
          e.kind === 'plague_alchemist' ||
          e.kind === 'spectral_banshee'
        ) {
          const ideal = spec.attackRange * 0.78;
          const strafe = e.id % 2 === 0 ? 1 : -1;
          let mx = dirToPlayer.x;
          let mz = dirToPlayer.z;
          if (dist < ideal) {
            mx = -dirToPlayer.z * strafe * 0.9 - dirToPlayer.x * 0.4;
            mz = dirToPlayer.x * strafe * 0.9 - dirToPlayer.z * 0.4;
          }
          e.vx = THREE.MathUtils.damp(e.vx, mx * effSpeed, 12, dt);
          e.vz = THREE.MathUtils.damp(e.vz, mz * effSpeed, 12, dt);
        } else if (e.kind === 'spider' || e.kind === 'ash_gargoyle' || e.kind === 'cinder_hound') {
          const weave = Math.sin(this.clock.elapsedTime * 5 + e.id) * 0.65;
          const n = normalize2D(dirToPlayer.x - dirToPlayer.z * weave, dirToPlayer.z + dirToPlayer.x * weave);
          e.vx = THREE.MathUtils.damp(e.vx, n.x * effSpeed, 14, dt);
          e.vz = THREE.MathUtils.damp(e.vz, n.z * effSpeed, 14, dt);
        } else {
          e.vx = THREE.MathUtils.damp(e.vx, dirToPlayer.x * effSpeed, 10, dt);
          e.vz = THREE.MathUtils.damp(e.vz, dirToPlayer.z * effSpeed, 10, dt);
        }

        const canTrigger =
          dist <= spec.attackRange &&
          e.attackCooldown <= 0 &&
          (spec.isBoss || this.activeAttackTokens < MAX_ATTACK_TOKENS) &&
          Math.hypot(e.x, e.z) <= ARENA_RADIUS + 0.5;

        if (canTrigger) {
          if (!spec.isBoss) {
            e.hasToken = true;
            this.activeAttackTokens += 1;
          }
          e.state = 'windup';
          e.stateTimer = spec.windupTime / frozenHeartSlow;
          e.facing = desiredFacing;

          if (
            e.kind === 'spider' ||
            e.kind === 'ash_gargoyle' ||
            e.kind === 'cinder_hound' ||
            (e.kind === 'boss_hellhound' && e.bossPattern % 2 === 0)
          ) {
            e.leapStartX = e.x;
            e.leapStartZ = e.z;
            e.leapTargetX = this.playerX;
            e.leapTargetZ = this.playerZ;
            e.telegraphRing = this.createGroundTelegraphRing(
              e.leapTargetX,
              e.leapTargetZ,
              e.kind === 'boss_hellhound' ? 3.4 : e.kind === 'cinder_hound' ? 1.8 : 1.35,
              e.kind === 'boss_hellhound' || e.kind === 'cinder_hound' ? 0xf97316 : 0x4ade80
            );
          } else if (e.kind === 'zombie_bomber') {
            e.telegraphRing = this.createGroundTelegraphRing(e.x, e.z, 3.2, 0xa3e635);
          } else if (e.kind === 'robot_tesla') {
            e.telegraphRing = this.createGroundTelegraphRing(e.x, e.z, 4.0, 0x38bdf8);
          } else if (spec.isBoss) {
            e.telegraphRing = this.createGroundTelegraphRing(
              e.x,
              e.z,
              Math.max(4.8, spec.radius * 2.0),
              MAPS[this.mapId].accentHex
            );
          } else if ((e.kind === 'robot_sniper' || e.kind === 'skeleton_archer') && e.rig.laserLine) {
            e.rig.laserLine.visible = true;
          } else if (e.kind === 'skeleton' || e.kind === 'obsidian_sentinel') {
            e.telegraphRing = this.createGroundTelegraphRing(
              e.x + Math.sin(e.facing) * 3.5,
              e.z + Math.cos(e.facing) * 3.5,
              e.kind === 'obsidian_sentinel' ? 1.5 : 0.9,
              e.kind === 'obsidian_sentinel' ? 0xf97316 : 0xf43f5e
            );
          }
        }
      } else if (e.state === 'windup') {
        e.vx *= Math.exp(-14 * dt);
        e.vz *= Math.exp(-14 * dt);
        e.stateTimer -= dt;
        e.rig.weaponArm.rotation.x = -1.25;
        e.rig.setHitFlash(
          Math.floor(e.stateTimer * 18) % 2 === 0,
          e.kind === 'zombie_bomber' ? 0xa3e635 : e.kind === 'robot_tesla' ? 0x38bdf8 : 0xfbbf24
        );

        if (e.kind === 'zombie_bomber') e.squashY = 1.15 + Math.sin(e.stateTimer * 28) * 0.14;
        if ((e.kind === 'robot_sniper' || e.kind === 'skeleton_archer') && e.stateTimer > 0.25) {
          e.facing += shortestAngleDiff(e.facing, desiredFacing) * Math.min(1, 3.2 * dt);
        }

        if (e.stateTimer <= 0) {
          e.rig.setHitFlash(false);
          if (e.telegraphRing) {
            this.scene.remove(e.telegraphRing);
            e.telegraphRing = null;
          }
          if (
            e.kind === 'spider' ||
            e.kind === 'ash_gargoyle' ||
            e.kind === 'cinder_hound' ||
            (e.kind === 'boss_hellhound' && e.bossPattern % 2 === 0)
          ) {
            e.state = 'leap';
            e.stateTimer = 0.28;
            if (e.kind === 'spider') {
              e.webLine = this.createWebStrandLine(e.leapStartX, e.leapStartZ, e.leapTargetX, e.leapTargetZ);
            }
          } else if (e.kind === 'zombie_bomber') {
            this.detonateBomber(e);
            continue;
          } else {
            e.state = 'attack';
            e.stateTimer = 0.18;
            this.executeEnemyAttack(e);
          }
        }
      } else if (e.state === 'leap') {
        e.stateTimer -= dt;
        const p = 1 - Math.max(0, e.stateTimer / 0.28);
        e.x = THREE.MathUtils.lerp(e.leapStartX, e.leapTargetX, p);
        e.z = THREE.MathUtils.lerp(e.leapStartZ, e.leapTargetZ, p);
        e.rig.bodyGroup.position.y = e.kind === 'cinder_hound' ? Math.sin(p * Math.PI) * 0.8 : Math.sin(p * Math.PI) * 2.1;

        if (e.stateTimer <= 0) {
          e.rig.bodyGroup.position.y = 0;
          e.squashY = 0.72;
          if (e.webLine) {
            this.scene.remove(e.webLine);
            e.webLine = null;
          }
          const hitRad = e.kind === 'boss_hellhound' ? 3.6 : e.kind === 'cinder_hound' ? 2.0 : 1.7;
          if (Math.hypot(this.playerX - e.x, this.playerZ - e.z) <= hitRad) {
            this.hurtPlayer(Math.round(spec.attackDamage * e.damageMult), e.x, e.z, spec.damageType, e);
          }
          if (e.kind === 'boss_hellhound') {
            this.spawnHazardPool(e.x, e.z, 2.8, 0xf97316, 12, 4.5, false, false, false, 'magic');
            e.bossPattern += 1;
          } else if (e.kind === 'cinder_hound') {
            this.spawnHazardPool(e.x, e.z, 1.7, 0xf97316, 9, 3.0, false, false, false, 'magic');
          }
          e.state = 'recover';
          e.stateTimer = spec.isBoss ? (bossEnraged ? 0.14 : 0.2) : 0.26;
          e.attackCooldown = spec.cooldown * (bossEnraged ? 0.68 : 1.0);
          if (e.hasToken) {
            e.hasToken = false;
            this.activeAttackTokens = Math.max(0, this.activeAttackTokens - 1);
          }
        }
      } else if (e.state === 'attack') {
        e.rig.weaponArm.rotation.x = 0.2;
        if ((e.kind === 'robot_pistol' || e.kind === 'robot_pyro') && e.burstShotsLeft > 0) {
          e.burstTimer -= dt;
          if (e.burstTimer <= 0) {
            e.burstShotsLeft -= 1;
            e.burstTimer = 0.14;
            const dmg = Math.round(spec.attackDamage * e.damageMult);
            if (e.kind === 'robot_pyro') {
              const offset = (e.burstShotsLeft - 1) * 0.18;
              this.fireEnemyProjectile(e, 'enemy_fire', 14, dmg, 0xf97316, offset, 'hybrid');
            } else {
              this.fireEnemyProjectile(e, 'enemy_bullet', 17, dmg, 0xfacc15, 0, 'physical');
            }
          }
        }
        e.stateTimer -= dt;
        if (e.stateTimer <= 0 && e.burstShotsLeft <= 0) {
          if (e.rig.laserLine) e.rig.laserLine.visible = false;
          e.state = 'recover';
          e.stateTimer = spec.hasWeakPoint ? (spec.isBoss ? 0.38 : 0.52) : spec.isBoss ? (bossEnraged ? 0.14 : 0.2) : 0.24;
          e.attackCooldown = spec.cooldown * (bossEnraged ? 0.68 : 1.0);
          if (spec.hasWeakPoint) e.coreExposedTimer = 1.4;
          if (e.hasToken) {
            e.hasToken = false;
            this.activeAttackTokens = Math.max(0, this.activeAttackTokens - 1);
          }
        }
      } else if (e.state === 'recover') {
        e.vx *= Math.exp(-10 * dt);
        e.vz *= Math.exp(-10 * dt);
        e.rig.weaponArm.rotation.x = THREE.MathUtils.damp(e.rig.weaponArm.rotation.x, 0, 10, dt);
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) e.state = 'chase';
      }

      if (e.state !== 'leap') {
        e.x += e.vx * dt;
        e.z += e.vz * dt;
        for (let j = i - 1; j >= 0; j--) {
          const other = this.enemies[j];
          if (other.state === 'ko' || other.state === 'leap' || other.state === 'phase') continue;
          const sdx = e.x - other.x;
          const sdz = e.z - other.z;
          const minSep = spec.radius + ENEMY_ARCHETYPES[other.kind].radius;
          const d = Math.hypot(sdx, sdz);
          if (d > 0.001 && d < minSep) {
            const push = (minSep - d) * 0.5;
            e.x += (sdx / d) * push;
            e.z += (sdz / d) * push;
            other.x -= (sdx / d) * push;
            other.z -= (sdz / d) * push;
          }
        }
        if (Math.hypot(e.x, e.z) <= ARENA_RADIUS) {
          const c = clampToArena({ x: e.x, z: e.z }, spec.radius);
          e.x = c.x;
          e.z = c.z;
        }
      }

      e.rig.root.position.set(e.x, 0, e.z);
      e.rig.root.rotation.y = e.facing;
      const invS = 1 / Math.sqrt(Math.max(0.5, e.squashY));
      e.rig.bodyGroup.scale.set(invS, e.squashY, invS);
    }
  }

  private detonateBomber(e: ActiveEnemy): void {
    const spec = ENEMY_ARCHETYPES[e.kind];
    soundEngine.playExplosion();
    this.spawnParticles(e.x, 0.9, e.z, 26, 0xa3e635, 9.5);
    this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.4);
    if (Math.hypot(this.playerX - e.x, this.playerZ - e.z) <= 3.4) {
      this.hurtPlayer(Math.round(spec.attackDamage * e.damageMult), e.x, e.z, spec.damageType, e);
    }
    this.koEnemy(e);
  }

  private executeEnemyAttack(e: ActiveEnemy): void {
    const spec = ENEMY_ARCHETYPES[e.kind];
    const dmg = Math.round(spec.attackDamage * e.damageMult);

    if (
      e.kind === 'zombie_sword' ||
      e.kind === 'zombie_club' ||
      e.kind === 'wraith' ||
      e.kind === 'void_reaper' ||
      e.kind === 'hell_knight' ||
      e.kind === 'abyss_brute' ||
      e.kind === 'magma_slime' ||
      e.kind === 'magma_mite'
    ) {
      const col = e.kind === 'void_reaper' ? 0x22c55e : e.kind === 'wraith' ? 0xa855f7 : 0xef4444;
      this.spawnSlashArc(e.x, e.z, e.facing, spec.attackRange, Math.PI * 0.9, col);
      if (isPointInCone(e.x, e.z, e.facing, this.playerX, this.playerZ, PLAYER_RADIUS, spec.attackRange, Math.PI * 0.9)) {
        this.hurtPlayer(dmg, e.x, e.z, spec.damageType, e);
      }
    } else if (e.kind === 'skeleton' || e.kind === 'obsidian_sentinel') {
      const range = spec.attackRange;
      this.spawnSlashArc(e.x, e.z, e.facing, range, e.kind === 'obsidian_sentinel' ? 0.55 : 0.25, e.kind === 'obsidian_sentinel' ? 0xf97316 : 0xf43f5e);
      const fx = Math.sin(e.facing);
      const fz = Math.cos(e.facing);
      const dLine = distancePointToSegment2D(this.playerX, this.playerZ, e.x, e.z, e.x + fx * range, e.z + fz * range);
      if (dLine <= PLAYER_RADIUS + (e.kind === 'obsidian_sentinel' ? 1.15 : 0.55)) {
        this.hurtPlayer(dmg, e.x, e.z, spec.damageType, e);
      }
    } else if (e.kind === 'robot_tesla') {
      this.spawnSlashArc(e.x, e.z, e.facing, 4.0, Math.PI * 2, 0x38bdf8);
      this.spawnParticles(e.x, 1.4, e.z, 16, 0x38bdf8, 8);
      soundEngine.playMagicZap();
      if (Math.hypot(this.playerX - e.x, this.playerZ - e.z) <= 4.0) {
        this.hurtPlayer(dmg, e.x, e.z, 'magic', e);
      }
    } else if (e.kind === 'skeleton_archer') {
      this.fireEnemyProjectile(e, 'enemy_arrow', 22, dmg, 0xa78bfa, 0, 'physical');
    } else if (e.kind === 'cultist') {
      this.fireEnemyProjectile(e, 'enemy_bullet', 16, dmg, 0x8b5cf6, 0, 'magic');
    } else if (e.kind === 'wisp_lantern') {
      this.fireEnemyProjectile(e, 'enemy_wisp', 12, dmg, 0x5eead4, 0, 'magic', true);
    } else if (e.kind === 'bog_shaman') {
      this.fireEnemyProjectile(e, 'enemy_blight', 14, dmg, 0xa3e635, 0, 'magic');
    } else if (e.kind === 'hell_warlock') {
      for (const a of [-0.24, 0, 0.24]) {
        this.fireEnemyProjectile(e, 'enemy_fire', 17, dmg, 0xf97316, a, 'magic');
      }
    } else if (e.kind === 'spectral_banshee') {
      for (const a of [-0.22, 0, 0.22]) {
        this.fireEnemyProjectile(e, 'enemy_green_orb', 15, dmg, 0x6ee7b7, a, 'magic');
      }
    } else if (e.kind === 'plague_alchemist') {
      this.fireEnemyProjectile(e, 'enemy_flask', 15, dmg, 0x4ade80, 0, 'magic');
      // Alchemist also heals up to 2 nearby non-boss allies!
      let healed = 0;
      for (const ally of this.enemies) {
        if (ally.id === e.id || ally.state === 'ko' || ENEMY_ARCHETYPES[ally.kind].isBoss) continue;
        if (ally.hp < ally.maxHp && Math.hypot(ally.x - e.x, ally.z - e.z) <= 6.5) {
          ally.hp = Math.min(ally.maxHp, ally.hp + 12);
          this.spawnDamagePopup(ally.x, 1.9, ally.z, '+12', { color: '#4ade80', fontSize: 13 });
          this.spawnParticles(ally.x, 1.0, ally.z, 6, 0x4ade80, 4);
          healed += 1;
          if (healed >= 2) break;
        }
      }
    } else if (e.kind === 'abyss_paladin') {
      const dist = Math.hypot(this.playerX - e.x, this.playerZ - e.z);
      if (dist <= 3.6) {
        this.spawnSlashArc(e.x, e.z, e.facing, 3.6, Math.PI * 0.95, 0xe11d48);
        if (isPointInCone(e.x, e.z, e.facing, this.playerX, this.playerZ, PLAYER_RADIUS, 3.6, Math.PI * 0.95)) {
          this.hurtPlayer(dmg, e.x, e.z, 'physical', e);
        }
      } else {
        this.fireEnemyProjectile(e, 'enemy_paladin_wave', 18, dmg, 0xe11d48, 0, 'hybrid');
      }
    } else if (e.kind === 'imp' || e.kind === 'magma_imp') {
      this.fireEnemyProjectile(e, 'enemy_fire', 17, dmg, e.kind === 'magma_imp' ? 0xff5500 : 0xf97316, 0, 'magic');
    } else if (e.kind === 'plague_archon') {
      for (const a of [-0.22, 0, 0.22]) {
        this.fireEnemyProjectile(e, 'enemy_green_orb', 16, dmg, 0x4ade80, a, 'magic');
      }
    } else if (e.kind === 'spider_spitter') {
      this.fireEnemyProjectile(e, 'enemy_acid', 15, dmg, 0x84cc16, 0, 'magic');
    } else if (e.kind === 'robot_pistol' || e.kind === 'robot_pyro') {
      e.burstShotsLeft = 3;
      e.burstTimer = 0;
      e.stateTimer = 0.45;
    } else if (e.kind === 'robot_sniper') {
      this.fireEnemyProjectile(e, 'enemy_sniper', 34, dmg, 0xf43f5e, 0, 'physical');
    } else if (spec.isBoss) {
      this.executeBossAttack(e, dmg);
    }
  }

  private executeBossAttack(boss: ActiveEnemy, dmg: number): void {
    const p = boss.bossPattern;
    boss.bossPattern += 1;
    const phase2 = boss.hp < boss.maxHp * 0.58;

    if (boss.kind === 'boss_zombie') {
      if (p % 2 === 0) {
        this.spawnSlashArc(boss.x, boss.z, boss.facing, 6.6, Math.PI * 2, 0xa3e635);
        this.spawnParticles(boss.x, 0.6, boss.z, 28, 0x84cc16, 11);
        this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.42);
        if (Math.hypot(this.playerX - boss.x, this.playerZ - boss.z) <= 6.6) {
          this.hurtPlayer(dmg, boss.x, boss.z, 'physical', boss);
        }
        if (phase2) {
          for (let i = 0; i < 6; i++) {
            this.fireEnemyProjectile(boss, 'enemy_acid', 16, Math.round(dmg * 0.72), 0x84cc16, (i / 6) * Math.PI * 2, 'magic');
          }
        }
        if (this.enemies.length < 4) {
          this.spawnEnemyAt(phase2 ? 'zombie_bomber' : 'zombie_club', boss.x + 3.2, boss.z);
        }
      } else {
        for (const off of [-0.4, -0.2, 0, 0.2, 0.4]) {
          this.fireEnemyProjectile(boss, 'enemy_acid', 17, Math.round(dmg * 0.78), 0x84cc16, off, 'magic');
        }
        if (phase2) {
          this.spawnHazardPool(this.playerX, this.playerZ, 2.1, 0x84cc16, Math.round(dmg * 0.65), 4.0, false, false, false, 'magic');
        }
      }
    } else if (boss.kind === 'boss_hellhound') {
      for (let i = -3; i <= 3; i++) {
        this.fireEnemyProjectile(boss, 'enemy_fire', 20, Math.round(dmg * 0.78), 0xf97316, i * 0.14, 'magic');
      }
      if (phase2) {
        this.spawnHazardPool(this.playerX, this.playerZ, 2.2, 0xf97316, Math.round(dmg * 0.7), 4.0, false, false, false, 'magic');
      }
      if (this.enemies.length < (phase2 ? 5 : 4)) {
        this.spawnEnemyAt(phase2 ? 'magma_imp' : 'imp', boss.x + 3.2, boss.z);
      }
    } else if (boss.kind === 'boss_golem') {
      if (p % 2 === 0) {
        for (const off of [-0.4, -0.2, 0, 0.2, 0.4]) {
          this.fireEnemyProjectile(boss, 'enemy_boulder', 18, dmg, 0xff5500, off, 'physical');
        }
      } else {
        this.spawnSlashArc(boss.x, boss.z, boss.facing, 7.4, Math.PI * 2, 0xff5500);
        this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.45);
        if (Math.hypot(this.playerX - boss.x, this.playerZ - boss.z) <= 7.4) {
          this.hurtPlayer(dmg, boss.x, boss.z, 'physical', boss);
        }
        if (phase2) {
          for (let i = 0; i < 8; i++) {
            this.fireEnemyProjectile(boss, 'enemy_fire', 17, Math.round(dmg * 0.75), 0xff5500, (i / 8) * Math.PI * 2, 'magic');
          }
        }
        if (this.enemies.length < 4) {
          this.spawnEnemyAt('ash_gargoyle', boss.x - 3.4, boss.z);
        }
      }
    } else if (boss.kind === 'boss_skeleton3') {
      if (p % 3 === 0) {
        for (let i = -3; i <= 3; i++) {
          this.fireEnemyProjectile(boss, 'enemy_green_orb', 19, Math.round(dmg * 0.82), 0x4ade80, i * 0.14, 'magic');
        }
      } else if (p % 3 === 1) {
        const count = phase2 ? 14 : 10;
        for (let i = 0; i < count; i++) {
          this.fireEnemyProjectile(boss, 'enemy_green_orb', 16, Math.round(dmg * 0.78), 0x22c55e, (i / count) * Math.PI * 2, 'magic');
        }
      } else {
        this.spawnSlashArc(boss.x, boss.z, boss.facing, 6.8, Math.PI * 1.25, 0x4ade80);
        if (Math.hypot(this.playerX - boss.x, this.playerZ - boss.z) <= 6.8) {
          this.hurtPlayer(dmg, boss.x, boss.z, 'hybrid', boss);
        }
        if (this.enemies.length < 5) {
          this.spawnEnemyAt(phase2 ? 'void_reaper' : 'skeleton_archer', boss.x - 3.2, boss.z);
        }
      }
    } else if (boss.kind === 'boss_satan') {
      if (p % 3 === 0) {
        this.spawnSlashArc(boss.x, boss.z, boss.facing, 7.2, Math.PI * 1.15, 0xe11d48);
        if (Math.hypot(this.playerX - boss.x, this.playerZ - boss.z) <= 7.2) {
          this.hurtPlayer(dmg, boss.x, boss.z, 'hybrid', boss);
        }
        for (let i = -3; i <= 3; i++) {
          this.fireEnemyProjectile(boss, 'enemy_fire', 21, Math.round(dmg * 0.82), 0xf97316, i * 0.14, 'magic');
        }
      } else if (p % 3 === 1) {
        const count = phase2 ? 16 : 10;
        for (let i = 0; i < count; i++) {
          this.fireEnemyProjectile(boss, 'enemy_fire', 17, Math.round(dmg * 0.78), 0xe11d48, (i / count) * Math.PI * 2 + p * 0.24, 'magic');
        }
      } else {
        const meteors = phase2 ? 5 : 3;
        for (let m = 0; m < meteors; m++) {
          const mx = this.playerX + (m === 0 ? 0 : (Math.random() - 0.5) * 9.5);
          const mz = this.playerZ + (m === 0 ? 0 : (Math.random() - 0.5) * 9.5);
          this.spawnHazardPool(mx, mz, 3.0, 0xe11d48, dmg, 1.05, true, false, false, 'magic');
        }
        if (this.enemies.length < (phase2 ? 5 : 3)) {
          this.spawnEnemyAt(phase2 ? 'void_reaper' : 'magma_imp', boss.x + 3.6, boss.z);
        }
      }
    }
  }

  private fireEnemyProjectile(
    e: ActiveEnemy,
    kind: ProjectileKind,
    speed: number,
    damage: number,
    color: number,
    angleOffset: number,
    damageType: DamageType,
    homing = false
  ): void {
    const spec = ENEMY_ARCHETYPES[e.kind];
    const spawnOffset = spec.isBoss ? spec.radius + 0.35 : 1.1;
    const a = e.facing + angleOffset;
    const fx = Math.sin(a);
    const fz = Math.cos(a);
    this.spawnProjectile({
      fromPlayer: false,
      kind,
      damageType,
      x: e.x + fx * spawnOffset,
      z: e.z + fz * spawnOffset,
      dirX: fx,
      dirZ: fz,
      speed,
      damage,
      knockback: 4,
      life: kind === 'enemy_acid' || kind === 'enemy_boulder' || kind === 'enemy_blight' || kind === 'enemy_flask'
        ? 0.65
        : kind === 'enemy_wisp'
        ? 1.9
        : 1.4,
      pierce: false,
      bouncesLeft: 0,
      homing,
      color,
    });
    soundEngine.playAttack(kind === 'enemy_sniper' ? 'sniper' : kind === 'enemy_arrow' ? 'crossbow' : 'pistol', false);
  }

  private spawnHazardPool(
    x: number,
    z: number,
    radius: number,
    colorHex: number,
    damage: number,
    life: number,
    isMeteor: boolean,
    fromPlayer = false,
    chill = false,
    damageType: DamageType = 'magic'
  ): void {
    const c = clampToArena({ x, z }, radius);
    if (this.hazards.length >= 12) {
      const oldest = this.hazards.shift();
      if (oldest) this.scene.remove(oldest.mesh);
    }
    const mesh = createAcidPoolMesh(radius, colorHex);
    mesh.position.set(c.x, 0.03, c.z);
    this.scene.add(mesh);
    this.hazards.push({
      x: c.x,
      z: c.z,
      radius,
      life,
      tickTimer: isMeteor ? life : 0.2,
      damage,
      damageType,
      fromPlayer,
      chill,
      isMeteor,
      detonated: false,
      colorHex,
      mesh,
    });
  }

  private updateHazards(dt: number): void {
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.life -= dt;
      if (h.isMeteor) {
        const mat = h.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.35 + Math.abs(Math.sin(this.clock.elapsedTime * 16)) * 0.45;
        if (h.life <= 0 && !h.detonated) {
          h.detonated = true;
          soundEngine.playExplosion();
          this.spawnParticles(h.x, 1.2, h.z, 24, h.colorHex, 10);
          this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.38);
          if (h.fromPlayer) {
            for (const enemy of this.enemies) {
              if (enemy.state === 'ko' || enemy.state === 'phase') continue;
              if (Math.hypot(enemy.x - h.x, enemy.z - h.z) <= h.radius + ENEMY_ARCHETYPES[enemy.kind].radius) {
                if (h.chill) enemy.chillTimer = Math.max(enemy.chillTimer, 2.5);
                this.damageEnemy(enemy, h.damage, 8, h.x, h.z, false, true, h.damageType);
              }
            }
          } else if (Math.hypot(this.playerX - h.x, this.playerZ - h.z) <= h.radius + 0.3) {
            this.hurtPlayer(h.damage, h.x, h.z, h.damageType);
          }
          this.scene.remove(h.mesh);
          this.hazards.splice(i, 1);
          continue;
        }
      } else {
        h.tickTimer -= dt;
        if (h.tickTimer <= 0) {
          h.tickTimer = 0.55;
          if (h.fromPlayer) {
            for (const enemy of this.enemies) {
              if (enemy.state === 'ko' || enemy.state === 'phase') continue;
              if (Math.hypot(enemy.x - h.x, enemy.z - h.z) <= h.radius + ENEMY_ARCHETYPES[enemy.kind].radius) {
                if (h.chill) enemy.chillTimer = Math.max(enemy.chillTimer, 2.2);
                this.damageEnemy(enemy, h.damage, 1, h.x, h.z, false, false, h.damageType);
              }
            }
          } else if (Math.hypot(this.playerX - h.x, this.playerZ - h.z) <= h.radius) {
            this.hurtPlayer(h.damage, h.x, h.z, h.damageType, undefined, true);
          }
        }
        if (h.life <= 0) {
          this.scene.remove(h.mesh);
          this.hazards.splice(i, 1);
        }
      }
    }
  }

  private hurtPlayer(
    rawDamage: number,
    sourceX: number,
    sourceZ: number,
    damageType: DamageType = 'physical',
    attacker?: ActiveEnemy,
    isDot = false
  ): void {
    if (this.playerInvulnTimer > 0 || this.screen !== 'playing') return;

    // Banshee's Veil Spell Shield Annul
    if (this.wearableId === 'banshees_veil' && this.bansheeReady) {
      this.bansheeReady = false;
      this.bansheeCooldown = 14.0;
      this.playerInvulnTimer = 0.45;
      this.playerRig.setBansheeShieldActive(false);
      soundEngine.playSpellShieldPop();
      this.spawnParticles(this.playerX, 1.1, this.playerZ, 18, 0xc084fc, 8);
      this.spawnDamagePopup(this.playerX, 2.2, this.playerZ, 'ANNUL!', { color: '#c084fc', fontSize: 15 });
      for (const e of this.enemies) {
        if (e.state === 'ko' || e.state === 'phase') continue;
        const d = Math.hypot(e.x - this.playerX, e.z - this.playerZ);
        if (d <= 3.8 && d > 0.05) {
          e.vx += ((e.x - this.playerX) / d) * 10;
          e.vz += ((e.z - this.playerZ) / d) * 10;
        }
      }
      this.emitHud();
      return;
    }

    if (this.wearableId === 'force_of_nature') {
      this.fonStacks = Math.min(4, this.fonStacks + 1);
      this.fonTimer = 6.0;
    }

    const effectiveRaw = isDot && this.wearableId === 'force_of_nature' ? rawDamage * 0.75 : rawDamage;
    const stats = this.currentStats();
    const result = computePlayerDamageTaken(
      effectiveRaw,
      this.blockTimer > 0,
      this.boostShieldTimer > 0,
      damageType,
      stats.armorPct,
      stats.mrPct
    );
    let dmgLeft = result.damage;

    // Aegis Barrier absorbs hits before HP
    this.shieldRegenDelay = 14.0;
    if (this.shieldHp > 0) {
      const absorbed = Math.min(this.shieldHp, dmgLeft);
      this.shieldHp -= absorbed;
      dmgLeft -= absorbed;
    }

    this.playerHp = Math.max(0, this.playerHp - dmgLeft);
    this.playerInvulnTimer = result.blocked ? 0.22 : 0.34;
    this.playerHitFlashTimer = 0.08;
    this.playerRig.setHitFlash(true);

    this.spawnDamagePopup(
      this.playerX,
      2.1,
      this.playerZ,
      result.blocked ? `BLOCKED -${result.damage}` : `-${result.damage}`,
      { color: result.blocked ? '#facc15' : '#f43f5e', fontSize: 14 }
    );

    const push = normalize2D(this.playerX - sourceX, this.playerZ - sourceZ);
    this.playerVx += push.x * (result.blocked ? 4 : 9);
    this.playerVz += push.z * (result.blocked ? 4 : 9);

    // Thornmail reflect & chill
    if (this.wearableId === 'thornmail') {
      const reflectDmg = Math.round(18 + 30 * stats.armorPct);
      const target =
        attacker && attacker.state !== 'ko'
          ? attacker
          : this.enemies.find(
              (e) => e.state !== 'ko' && Math.hypot(e.x - this.playerX, e.z - this.playerZ) <= 3.6
            );
      if (target && Math.hypot(target.x - this.playerX, target.z - this.playerZ) <= 5.5) {
        target.chillTimer = Math.max(target.chillTimer, 2.0);
        this.damageEnemy(target, reflectDmg, 2, this.playerX, this.playerZ, false, false, 'magic');
      }
    }

    // Character Tree: Retribution Pulse shockwave on taking damage
    if ((this.activeUpgrades.c_thorns ?? 0) > 0) {
      const thornsRank = this.activeUpgrades.c_thorns ?? 0;
      this.triggerAoeExplosion(this.playerX, this.playerZ, 4.0, 22 * thornsRank, 0xfb923c, false, 'magic');
    }

    if (result.blocked) {
      soundEngine.playBlockParry();
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.045);
      this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.2);
      this.spawnParticles(this.playerX, 1.0, this.playerZ, 12, 0xf59e0b, 7.5);
    } else {
      this.noHitKills = 0;
      soundEngine.playPlayerHurt();
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.055);
      this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.45);
      this.spawnParticles(this.playerX, 1.0, this.playerZ, 16, 0xef4444, 7.0);
    }

    if (this.playerHp <= 0) {
      this.screen = 'gameover';
      soundEngine.playGameOver();
      this.hideAllCombatDom();
      this.syncBodyState();
    }
    this.emitHud();
  }

  private spawnProjectile(opts: {
    fromPlayer: boolean;
    kind: ProjectileKind;
    damageType: DamageType;
    x: number;
    z: number;
    dirX: number;
    dirZ: number;
    speed: number;
    damage: number;
    knockback: number;
    life: number;
    pierce: boolean;
    bouncesLeft: number;
    homing: boolean;
    color: number;
  }): void {
    const slot = this.projectiles.find((p) => !p.active);
    if (!slot) return;
    slot.active = true;
    slot.fromPlayer = opts.fromPlayer;
    slot.kind = opts.kind;
    slot.damageType = opts.damageType;
    slot.x = opts.x;
    slot.z = opts.z;
    slot.vx = opts.dirX * opts.speed;
    slot.vz = opts.dirZ * opts.speed;
    slot.damage = opts.damage;
    slot.knockback = opts.knockback;
    slot.life = opts.life;
    slot.maxLife = opts.life;
    slot.tickAccum = 0;
    slot.radius =
      opts.kind === 'void_orb'
        ? 0.88
        : opts.kind === 'sniper' ||
          opts.kind === 'rail' ||
          opts.kind === 'scythe_wave' ||
          opts.kind === 'fireball' ||
          opts.kind === 'chakram' ||
          opts.kind === 'blight_wave' ||
          opts.kind === 'palm_wave' ||
          opts.kind === 'enemy_paladin_wave'
        ? 0.58
        : 0.34;
    slot.pierce = opts.pierce;
    slot.bouncesLeft = opts.bouncesLeft;
    slot.homing = opts.homing;
    slot.hitIds.clear();
    slot.mesh.visible = true;
    slot.mesh.position.set(opts.x, 1.0, opts.z);
    slot.mesh.scale.set(
      opts.kind === 'scythe_wave' ||
        opts.kind === 'arc_crescent' ||
        opts.kind === 'frost_wave' ||
        opts.kind === 'blight_wave' ||
        opts.kind === 'palm_wave' ||
        opts.kind === 'enemy_paladin_wave'
        ? 2.4
        : opts.kind === 'void_orb'
        ? 2.1
        : opts.kind === 'chakram'
        ? 1.7
        : opts.kind === 'fireball'
        ? 1.8
        : 0.95,
      opts.kind === 'chakram' ? 0.35 : opts.kind === 'void_orb' ? 2.1 : 0.9,
      opts.kind === 'sniper' || opts.kind === 'rail' || opts.kind === 'enemy_sniper' || opts.kind === 'star_arrow'
        ? 2.8
        : opts.kind === 'void_orb'
        ? 2.1
        : 1.35
    );
    slot.mesh.rotation.y = Math.atan2(opts.dirX, opts.dirZ);
    (slot.mesh.material as THREE.MeshBasicMaterial).color.setHex(opts.color);
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      if (!p.active) continue;
      p.life -= dt;
      const prevX = p.x;
      const prevZ = p.z;

      if (p.kind === 'chakram') {
        p.mesh.rotation.y += dt * 16;
        if (p.life < p.maxLife * 0.5) {
          const toP = normalize2D(this.playerX - p.x, this.playerZ - p.z);
          const spd = Math.hypot(p.vx, p.vz) || 24;
          p.vx = toP.x * spd;
          p.vz = toP.z * spd;
          if (p.life < p.maxLife * 0.45 && Math.hypot(this.playerX - p.x, this.playerZ - p.z) < 1.2) {
            p.active = false;
            p.mesh.visible = false;
            continue;
          }
        }
      }

      if (p.kind === 'void_orb') {
        p.mesh.rotation.y += dt * 5;
        p.tickAccum += dt;
        // Gravity pull on nearby enemies!
        for (const e of this.enemies) {
          if (e.state === 'ko' || e.state === 'phase') continue;
          const d = Math.hypot(p.x - e.x, p.z - e.z);
          if (d <= 4.8 && d > 0.25 && !ENEMY_ARCHETYPES[e.kind].isBoss) {
            e.x += ((p.x - e.x) / d) * 4.2 * dt;
            e.z += ((p.z - e.z) / d) * 4.2 * dt;
          }
        }
        if (p.tickAccum >= 0.28) {
          p.tickAccum = 0;
          p.hitIds.clear(); // allow multi-tick damage
        }
      }

      if (p.homing && p.fromPlayer) {
        let bestEnemy: ActiveEnemy | null = null;
        let bestD = 16;
        for (const e of this.enemies) {
          if (e.state === 'ko' || e.state === 'phase' || p.hitIds.has(e.id)) continue;
          const d = Math.hypot(e.x - p.x, e.z - p.z);
          if (d < bestD) { bestD = d; bestEnemy = e; }
        }
        if (bestEnemy) {
          const spd = Math.hypot(p.vx, p.vz) || 18;
          const desired = normalize2D(bestEnemy.x - p.x, bestEnemy.z - p.z);
          const cur = normalize2D(p.vx, p.vz);
          const nx = THREE.MathUtils.lerp(cur.x, desired.x, Math.min(1, dt * 8));
          const nz = THREE.MathUtils.lerp(cur.z, desired.z, Math.min(1, dt * 8));
          const nn = normalize2D(nx, nz);
          p.vx = nn.x * spd;
          p.vz = nn.z * spd;
        }
      } else if (p.homing && !p.fromPlayer) {
        // Wisp orb gently steers toward player
        const spd = Math.hypot(p.vx, p.vz) || 12;
        const desired = normalize2D(this.playerX - p.x, this.playerZ - p.z);
        const cur = normalize2D(p.vx, p.vz);
        const nx = THREE.MathUtils.lerp(cur.x, desired.x, Math.min(1, dt * 2.2));
        const nz = THREE.MathUtils.lerp(cur.z, desired.z, Math.min(1, dt * 2.2));
        const nn = normalize2D(nx, nz);
        p.vx = nn.x * spd;
        p.vz = nn.z * spd;
      }

      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.mesh.position.set(p.x, 1.0, p.z);

      if (p.life <= 0 || Math.hypot(p.x, p.z) > ARENA_RADIUS + 6) {
        if (p.kind === 'enemy_acid') this.spawnHazardPool(p.x, p.z, 1.85, 0x84cc16, 8, 5.0, false, false, false, 'magic');
        else if (p.kind === 'enemy_blight' || p.kind === 'enemy_flask') this.spawnHazardPool(p.x, p.z, 2.0, 0x22c55e, 9, 3.6, false, false, false, 'magic');
        else if (p.kind === 'enemy_boulder') this.spawnHazardPool(p.x, p.z, 2.3, 0xff5500, 11, 5.5, false, false, false, 'magic');
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      if (p.fromPlayer) {
        for (const enemy of this.enemies) {
          if (enemy.state === 'ko' || enemy.state === 'phase' || p.hitIds.has(enemy.id)) continue;
          const spec = ENEMY_ARCHETYPES[enemy.kind];
          const d = distancePointToSegment2D(enemy.x, enemy.z, prevX, prevZ, p.x, p.z);
          if (d <= spec.radius + p.radius) {
            // Spectral Banshee dodges every 4th projectile unless chilled/rooted!
            if (enemy.kind === 'spectral_banshee' && enemy.chillTimer <= 0 && enemy.rootTimer <= 0) {
              enemy.projDodgeCounter += 1;
              if (enemy.projDodgeCounter % 4 === 0) {
                const side = enemy.id % 2 === 0 ? 1 : -1;
                const pdx = -p.vz;
                const pdz = p.vx;
                const n = normalize2D(pdx, pdz);
                const shifted = clampToArena({ x: enemy.x + n.x * 1.9 * side, z: enemy.z + n.z * 1.9 * side }, spec.radius);
                enemy.x = shifted.x;
                enemy.z = shifted.z;
                this.spawnParticles(enemy.x, 1.2, enemy.z, 8, 0x6ee7b7, 5);
                this.spawnDamagePopup(enemy.x, 2.0, enemy.z, 'DODGE', { color: '#6ee7b7', fontSize: 11 });
                p.hitIds.add(enemy.id);
                continue;
              }
            }

            p.hitIds.add(enemy.id);
            if (p.kind === 'blast_bolt' || p.kind === 'fireball') {
              this.triggerAoeExplosion(p.x, p.z, 3.4, p.damage, 0xf97316, false, p.damageType);
              p.active = false;
              p.mesh.visible = false;
              break;
            }
            if (p.kind === 'slug') enemy.rootTimer = 1.1;
            if (p.kind === 'frost_wave') enemy.chillTimer = Math.max(enemy.chillTimer, 2.5);

            this.damageEnemy(
              enemy,
              p.damage,
              p.knockback,
              prevX,
              prevZ,
              p.kind === 'fang' || p.kind === 'flame' || p.kind === 'blight_wave',
              p.kind === 'sniper' || p.kind === 'rail' || p.kind === 'slug',
              p.damageType
            );

            if (p.kind === 'arcane_bolt') {
              this.secondaryCooldown = Math.max(0, this.secondaryCooldown - 0.15);
            }
            if (this.spellbladeReady) {
              this.triggerSpellbladeProc(enemy.x, enemy.z);
            }

            // Starfire Bow splits into 2 homing star shards!
            if (p.kind === 'star_arrow') {
              const baseAngle = Math.atan2(p.vx, p.vz);
              for (const off of [-0.55, 0.55]) {
                this.spawnProjectile({
                  fromPlayer: true,
                  kind: 'star_shard',
                  damageType: 'magic',
                  x: p.x,
                  z: p.z,
                  dirX: Math.sin(baseAngle + off),
                  dirZ: Math.cos(baseAngle + off),
                  speed: 22,
                  damage: Math.round(p.damage * 0.45),
                  knockback: 2,
                  life: 0.9,
                  pierce: false,
                  bouncesLeft: 0,
                  homing: true,
                  color: 0xfef08a,
                });
              }
            }

            if ((this.activeUpgrades.w_overclock ?? 0) > 0) {
              this.secondaryCooldown = Math.max(0, this.secondaryCooldown - 0.12);
            }

            if (p.bouncesLeft > 0) {
              let nextTarget: ActiveEnemy | null = null;
              let bestDist = 9.0;
              for (const cand of this.enemies) {
                if (cand.state === 'ko' || cand.state === 'phase' || p.hitIds.has(cand.id)) continue;
                const cd = Math.hypot(cand.x - p.x, cand.z - p.z);
                if (cd < bestDist) { bestDist = cd; nextTarget = cand; }
              }
              if (nextTarget) {
                p.bouncesLeft -= 1;
                const spd = Math.hypot(p.vx, p.vz) || 22;
                const bDir = normalize2D(nextTarget.x - p.x, nextTarget.z - p.z);
                p.vx = bDir.x * spd;
                p.vz = bDir.z * spd;
                p.mesh.rotation.y = Math.atan2(bDir.x, bDir.z);
                continue;
              }
            }

            if (!p.pierce) {
              p.active = false;
              p.mesh.visible = false;
              break;
            }
          }
        }
      } else {
        const d = distancePointToSegment2D(this.playerX, this.playerZ, prevX, prevZ, p.x, p.z);
        if (d <= PLAYER_RADIUS + p.radius) {
          if (p.kind === 'enemy_acid') this.spawnHazardPool(p.x, p.z, 1.85, 0x84cc16, 8, 5.0, false, false, false, 'magic');
          else if (p.kind === 'enemy_blight' || p.kind === 'enemy_flask') this.spawnHazardPool(p.x, p.z, 2.0, 0x22c55e, 9, 3.6, false, false, false, 'magic');
          else if (p.kind === 'enemy_boulder') this.spawnHazardPool(p.x, p.z, 2.3, 0xff5500, 11, 5.5, false, false, false, 'magic');
          p.active = false;
          p.mesh.visible = false;
          this.hurtPlayer(p.damage, prevX, prevZ, p.damageType);
        }
      }
    }
  }

  private updateTraps(dt: number): void {
    for (let i = this.traps.length - 1; i >= 0; i--) {
      const trap = this.traps[i];
      trap.life -= dt;
      if (trap.life <= 0) {
        this.scene.remove(trap.mesh);
        this.traps.splice(i, 1);
        continue;
      }

      for (const enemy of this.enemies) {
        if (enemy.state === 'ko' || enemy.state === 'phase') continue;
        const spec = ENEMY_ARCHETYPES[enemy.kind];
        if (Math.hypot(enemy.x - trap.x, enemy.z - trap.z) <= spec.radius + 0.82) {
          enemy.rootTimer = 2.2;
          this.damageEnemy(
            enemy,
            this.scalePlayerDamage(WEAPONS.sniper.secondary.damage),
            2,
            trap.x,
            trap.z,
            false,
            true,
            'physical'
          );
          soundEngine.playTrapSnap();
          this.spawnParticles(trap.x, 0.5, trap.z, 16, 0xf43f5e, 7.5);
          this.scene.remove(trap.mesh);
          this.traps.splice(i, 1);
          break;
        }
      }
    }
  }

  private spawnSlashArc(x: number, z: number, facing: number, range: number, arcRad: number, colorHex: number): void {
    const clampedArc = Math.min(Math.PI * 2, Math.max(0.25, arcRad));
    const geo = new THREE.RingGeometry(Math.max(0.4, range * 0.45), range, 14, 1, -clampedArc * 0.5, clampedArc);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0.95, z);
    mesh.rotation.y = facing - Math.PI / 2;
    this.scene.add(mesh);
    this.slashVfxs.push({ mesh, timer: 0.14, maxTimer: 0.14 });
  }

  private updateSlashVfxs(dt: number): void {
    for (let i = this.slashVfxs.length - 1; i >= 0; i--) {
      const v = this.slashVfxs[i];
      v.timer -= dt;
      const ratio = Math.max(0, v.timer / v.maxTimer);
      (v.mesh.material as THREE.MeshBasicMaterial).opacity = ratio * 0.72;
      v.mesh.scale.setScalar(1 + (1 - ratio) * 0.12);
      if (v.timer <= 0) {
        this.scene.remove(v.mesh);
        v.mesh.geometry.dispose();
        (v.mesh.material as THREE.Material).dispose();
        this.slashVfxs.splice(i, 1);
      }
    }
  }

  private createGroundTelegraphRing(x: number, z: number, radius: number, colorHex: number): THREE.Mesh {
    const geo = new THREE.RingGeometry(radius * 0.75, radius, 16);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0.04, z);
    this.scene.add(mesh);
    return mesh;
  }

  private createWebStrandLine(x1: number, z1: number, x2: number, z2: number): THREE.Line {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, 0.5, z1),
      new THREE.Vector3((x1 + x2) * 0.5, 2.3, (z1 + z2) * 0.5),
      new THREE.Vector3(x2, 0.3, z2),
    ]);
    const mat = new THREE.LineBasicMaterial({ color: 0xd9f99d, transparent: true, opacity: 0.9 });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    return line;
  }

  private spawnParticles(x: number, y: number, z: number, count: number, colorHex: number, speed: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.particles[this.particleCursor];
      this.particleCursor = (this.particleCursor + 1) % PARTICLE_POOL_SIZE;
      const a = Math.random() * Math.PI * 2;
      const spd = speed * (0.45 + Math.random() * 0.75);
      p.active = true;
      p.x = x;
      p.y = y;
      p.z = z;
      p.vx = Math.cos(a) * spd;
      p.vy = 2.2 + Math.random() * speed * 0.6;
      p.vz = Math.sin(a) * spd;
      p.maxLife = 0.28 + Math.random() * 0.25;
      p.life = p.maxLife;
      p.size = 0.75 + Math.random() * 0.85;
      p.color.setHex(colorHex);
    }
  }

  private updateParticles(dt: number): void {
    let dirty = false;
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      dirty = true;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        _mat4.makeTranslation(0, -50, 0);
        this.particleInstanced.setMatrixAt(i, _mat4);
        continue;
      }
      p.vy -= 18 * dt;
      p.x += p.vx * dt;
      p.y = Math.max(0.08, p.y + p.vy * dt);
      p.z += p.vz * dt;
      const s = p.size * (p.life / p.maxLife);
      _vec3.set(p.x, p.y, p.z);
      _scaleVec.set(s, s, s);
      _quat.identity();
      _mat4.compose(_vec3, _quat, _scaleVec);
      this.particleInstanced.setMatrixAt(i, _mat4);
      this.particleInstanced.setColorAt(i, p.color);
    }
    if (dirty) {
      this.particleInstanced.instanceMatrix.needsUpdate = true;
      if (this.particleInstanced.instanceColor) this.particleInstanced.instanceColor.needsUpdate = true;
    }
  }

  private updateCamera(dt: number): void {
    const targetX = this.playerX;
    const targetZ = this.playerZ;
    const k = 9.5;
    this.camPos.x = THREE.MathUtils.damp(this.camPos.x, targetX, k, dt);
    this.camPos.y = THREE.MathUtils.damp(this.camPos.y, 15.8, k, dt);
    this.camPos.z = THREE.MathUtils.damp(this.camPos.z, targetZ + 13.8, k, dt);

    this.camLook.x = THREE.MathUtils.damp(this.camLook.x, targetX, k, dt);
    this.camLook.y = THREE.MathUtils.damp(this.camLook.y, 0.8, k, dt);
    this.camLook.z = THREE.MathUtils.damp(this.camLook.z, targetZ, k, dt);

    const shake = this.cameraTrauma * this.cameraTrauma;
    const sx = (Math.random() * 2 - 1) * shake * 0.65;
    const sy = (Math.random() * 2 - 1) * shake * 0.45;
    this.camera.position.set(this.camPos.x + sx, this.camPos.y + sy, this.camPos.z);
    this.camera.lookAt(this.camLook);
  }

  private emitHud(): void {
    const spec = WEAPONS[this.weaponId];
    const mapSpec = MAPS[this.mapId];
    const stats = this.currentStats();
    const aliveCount = this.enemies.filter((e) => e.state !== 'ko').length;
    const activeBoss = this.enemies.find((e) => e.state !== 'ko' && ENEMY_ARCHETYPES[e.kind].isBoss);

    this.onHudUpdate({
      screen: this.screen,
      mapId: this.mapId,
      mapName: mapSpec.name,
      mapSubtitle: mapSpec.subtitle,
      hp: Math.round(this.playerHp),
      maxHp: Math.round(this.playerMaxHp),
      shieldHp: Math.round(this.shieldHp),
      maxShieldHp: stats.maxShieldHp,
      hotRemaining: Math.round(this.hotRemaining),
      potions: this.potions,
      maxPotions: stats.maxPotions,
      score: Math.round(this.score),
      bestScore: Math.round(this.bestScore),
      noHitKills: this.noHitKills,
      noHitScoreMult: computeNoHitScoreMultiplier(this.noHitKills),
      kills: this.kills,
      wave: this.wave,
      totalWavesInMap: mapSpec.waves,
      waveKillsRemaining: this.isBossWave
        ? aliveCount
        : this.waveRewardState !== 'none'
        ? 0
        : Math.max(0, this.wavePlan.totalEnemies - this.waveKills),
      isBossWave: this.isBossWave,
      bossName: activeBoss ? ENEMY_ARCHETYPES[activeBoss.kind].name : null,
      bossHp: activeBoss ? Math.max(0, Math.round(activeBoss.hp)) : 0,
      bossMaxHp: activeBoss ? activeBoss.maxHp : 0,
      combo: this.combo,
      weaponId: this.weaponId,
      ownedWeapons: [...this.ownedWeapons],
      wearableId: this.wearableId,
      armorPct: stats.armorPct,
      mrPct: stats.mrPct,
      bansheeShieldReady: this.wearableId === 'banshees_veil' && this.bansheeReady,
      jakshoStacks: this.jakshoStacks,
      fonStacks: this.fonStacks,
      spellbladeReady: this.spellbladeReady,
      activeUpgrades: { ...this.activeUpgrades },
      primaryCooldownRatio: Math.min(1, this.primaryCooldown / (spec.primary.cooldown * stats.cooldownMult)),
      secondaryCooldownRatio: Math.min(1, this.secondaryCooldown / (spec.secondary.cooldown * stats.cooldownMult)),
      dashCooldownRatio: this.dashCharges > 0 ? 0 : Math.min(1, this.dashRechargeTimer / stats.dashCooldown),
      dashCharges: this.dashCharges,
      maxDashCharges: stats.maxDashCharges,
      isBlocking: this.blockTimer > 0,
      boosts: {
        speedTimer: Number(this.boostSpeedTimer.toFixed(1)),
        rageTimer: Number(this.boostRageTimer.toFixed(1)),
        shieldTimer: Number(this.boostShieldTimer.toFixed(1)),
      },
      rushStacks: this.rushStacks,
      elapsedSeconds: Math.round(this.elapsedSeconds),
      activeEnemyCount: aliveCount,
      bannerText: this.bannerText,
      nearbyPrompt: this.getNearbyInteractable(),
      waveRewardState: this.waveRewardState,
      muted: soundEngine.isMuted(),
      touchControlsEnabled: this.touchControlsEnabled,
    });
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.resizeObserver.disconnect();
    this.unbindInputListeners();
    this.clearDynamicEntities();
    this.textures.dispose();
    this.envRT.dispose();
    this.renderer.dispose();
    if (this.combatOverlayRoot.parentNode === this.container) {
      this.container.removeChild(this.combatOverlayRoot);
    }
    if (this.warpFlashOverlay.parentNode === this.container) {
      this.container.removeChild(this.warpFlashOverlay);
    }
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
