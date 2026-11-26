import * as THREE from 'three';
import { applyPS1VertexSnap } from './ps1Shaders';
import { CLOTHING_OPTIONS, MAPS, UPGRADE_TREE, WEARABLES } from './rules';
import type { ProceduralTextures } from './textures';
import type {
  CharacterCustomization,
  EnemyKind,
  MapId,
  PedestalRewardItem,
  PickupKind,
  UpgradeNodeId,
  WeaponId,
  WearableId,
} from './types';

function makeMat(
  params: THREE.MeshStandardMaterialParameters,
  snapRes = 165
): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    flatShading: true,
    ...params,
  });
  return applyPS1VertexSnap(mat, snapRes);
}

export function createContactShadow(textures: ProceduralTextures, radius = 0.9): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 12);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: textures.contactShadow,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.02;
  mesh.renderOrder = 1;
  return mesh;
}

export function createWeaponMesh(id: WeaponId): THREE.Group {
  const group = new THREE.Group();
  const steelMat = makeMat({ color: 0xb8c7d9, roughness: 0.28, metalness: 0.8 });
  const darkIronMat = makeMat({ color: 0x3b4454, roughness: 0.38, metalness: 0.72 });
  const woodMat = makeMat({ color: 0x5c3c24, roughness: 0.85, metalness: 0.05 });

  if (id === 'sword') {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.34, 6), woodMat);
    grip.rotation.x = Math.PI / 2;
    grip.position.z = 0.14;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.09), darkIronMat);
    guard.position.z = 0.32;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.04, 1.05), steelMat);
    blade.position.z = 0.86;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.24, 4), steelMat);
    tip.rotation.x = Math.PI / 2;
    tip.rotation.y = Math.PI / 4;
    tip.position.z = 1.49;
    group.add(grip, guard, blade, tip);
  } else if (id === 'club') {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.72, 6), woodMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.34;
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.14, 0.56, 7), woodMat);
    head.rotation.x = Math.PI / 2;
    head.position.z = 0.92;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.14, 7), darkIronMat);
    band.rotation.x = Math.PI / 2;
    band.position.z = 0.98;
    const spike1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), steelMat);
    spike1.position.set(0.24, 0, 0.98);
    spike1.rotation.z = -Math.PI / 2;
    const spike2 = spike1.clone();
    spike2.position.set(-0.24, 0, 0.98);
    spike2.rotation.z = Math.PI / 2;
    group.add(shaft, head, band, spike1, spike2);
  } else if (id === 'chain') {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.32, 6), woodMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.z = 0.14;
    group.add(handle);
    for (let i = 0; i < 4; i++) {
      const link = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.022, 4, 6), darkIronMat);
      link.position.z = 0.36 + i * 0.13;
      if (i % 2 === 1) link.rotation.z = Math.PI / 2;
      group.add(link);
    }
    const knifeBase = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.42), steelMat);
    knifeBase.position.z = 1.04;
    const knifeTip = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 4), steelMat);
    knifeTip.rotation.x = Math.PI / 2;
    knifeTip.position.z = 1.38;
    group.add(knifeBase, knifeTip);
  } else if (id === 'fangs') {
    const chitinMat = makeMat({ color: 0x1b2b22, roughness: 0.6, metalness: 0.15 });
    const venomMat = makeMat({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.85, roughness: 0.25 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.24), chitinMat);
    base.position.z = 0.16;
    const fangL = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.56, 5), venomMat);
    fangL.rotation.x = Math.PI / 2 + 0.12;
    fangL.position.set(-0.1, 0, 0.48);
    const fangR = fangL.clone();
    fangR.position.x = 0.1;
    group.add(base, fangL, fangR);
  } else if (id === 'pistol') {
    const gunMat = makeMat({ color: 0x2a3240, roughness: 0.35, metalness: 0.78 });
    const brassMat = makeMat({ color: 0xfacc15, roughness: 0.3, metalness: 0.8, emissive: 0x713f12, emissiveIntensity: 0.25 });
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.26, 0.14), woodMat);
    grip.position.set(0, -0.1, 0.12);
    grip.rotation.x = -0.22;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.54), gunMat);
    body.position.set(0, 0.02, 0.3);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.2, 6), steelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, 0.62);
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.05), brassMat);
    sight.position.set(0, 0.1, 0.52);
    group.add(grip, body, barrel, sight);
  } else if (id === 'sniper') {
    const bodyMat = makeMat({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
    const opticMat = makeMat({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.9, roughness: 0.2 });
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.34), woodMat);
    stock.position.set(0, -0.02, 0.06);
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.62), bodyMat);
    receiver.position.set(0, 0.02, 0.45);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 0.92, 6), steelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, 1.15);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.36, 6), darkIronMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.14, 0.48);
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.04), opticMat);
    lens.position.set(0, 0.14, 0.67);
    group.add(stock, receiver, barrel, scope, lens);
  } else if (id === 'axe') {
    const axeMat = makeMat({ color: 0xfb923c, roughness: 0.32, metalness: 0.72 });
    const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 1.25, 6), woodMat);
    haft.rotation.x = Math.PI / 2;
    haft.position.z = 0.6;
    const headBase = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.24), darkIronMat);
    headBase.position.z = 1.05;
    const bladeL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.44), axeMat);
    bladeL.position.set(-0.2, 0, 1.06);
    const bladeR = bladeL.clone();
    bladeR.position.x = 0.2;
    group.add(haft, headBase, bladeL, bladeR);
  } else if (id === 'scythe') {
    const soulMat = makeMat({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 0.75, roughness: 0.25 });
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.48, 6), darkIronMat);
    staff.rotation.x = Math.PI / 2;
    staff.position.z = 0.72;
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), steelMat);
    collar.position.z = 1.38;
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.16), soulMat);
    blade1.position.set(0.24, 0, 1.42);
    blade1.rotation.y = -0.3;
    const blade2 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42, 4), soulMat);
    blade2.rotation.z = -Math.PI / 2;
    blade2.rotation.y = -0.45;
    blade2.position.set(0.56, 0, 1.28);
    group.add(staff, collar, blade1, blade2);
  } else if (id === 'shotgun') {
    const bodyMat = makeMat({ color: 0x334155, roughness: 0.4, metalness: 0.75 });
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.2, 0.3), woodMat);
    stock.position.set(0, -0.06, 0.12);
    stock.rotation.x = -0.25;
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.44), bodyMat);
    receiver.position.set(0, 0.02, 0.36);
    const barrelL = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.56, 6), steelMat);
    barrelL.rotation.x = Math.PI / 2;
    barrelL.position.set(-0.04, 0.05, 0.76);
    const barrelR = barrelL.clone();
    barrelR.position.x = 0.04;
    const pump = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 0.26), woodMat);
    pump.position.set(0, -0.02, 0.7);
    group.add(stock, receiver, barrelL, barrelR, pump);
  } else if (id === 'crossbow') {
    const bowMat = makeMat({ color: 0xa78bfa, emissive: 0x6d28d9, emissiveIntensity: 0.45, roughness: 0.35 });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.85), woodMat);
    rail.position.z = 0.42;
    const prod = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.07, 0.1), darkIronMat);
    prod.position.z = 0.78;
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.52, 5), bowMat);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(0, 0.08, 0.58);
    group.add(rail, prod, bolt);
  } else if (id === 'flamethrower') {
    const tankMat = makeMat({ color: 0xea580c, roughness: 0.45, metalness: 0.4 });
    const nozzleMat = makeMat({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.2 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.62), darkIronMat);
    body.position.set(0, 0.02, 0.38);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 7), tankMat);
    tank.position.set(0, -0.14, 0.42);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.46, 6), steelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, 0.85);
    const pilot = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), nozzleMat);
    pilot.position.set(0, 0.04, 1.12);
    group.add(body, tank, barrel, pilot);
  } else if (id === 'katana') {
    const glowEdge = makeMat({ color: 0x67e8f9, emissive: 0x06b6d4, emissiveIntensity: 0.55, roughness: 0.2, metalness: 0.85 });
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.38, 6), darkIronMat);
    hilt.rotation.x = Math.PI / 2;
    hilt.position.z = 0.15;
    const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8), woodMat);
    tsuba.rotation.x = Math.PI / 2;
    tsuba.position.z = 0.35;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.09, 1.24), glowEdge);
    blade.position.z = 0.98;
    group.add(hilt, tsuba, blade);
  } else if (id === 'halberd') {
    const runeMat = makeMat({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.65, roughness: 0.25 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.65, 6), woodMat);
    pole.rotation.x = Math.PI / 2;
    pole.position.z = 0.75;
    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.42, 4), runeMat);
    spearTip.rotation.x = Math.PI / 2;
    spearTip.position.z = 1.75;
    const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.34), runeMat);
    axeHead.position.set(0.18, 0, 1.38);
    group.add(pole, spearTip, axeHead);
  } else if (id === 'chakram') {
    const discMat = makeMat({ color: 0xfda4af, emissive: 0xe11d48, emissiveIntensity: 0.7, roughness: 0.2, metalness: 0.85 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.045, 5, 12), discMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = 0.42;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 6), darkIronMat);
    hub.position.z = 0.42;
    group.add(ring, hub);
  } else if (id === 'railgun') {
    const coilMat = makeMat({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 1.3, roughness: 0.2 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.78), darkIronMat);
    frame.position.set(0, 0.02, 0.48);
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.08, 0.72), steelMat);
    railL.position.set(-0.06, 0.06, 1.04);
    const railR = railL.clone();
    railR.position.x = 0.06;
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.65), coilMat);
    core.position.set(0, 0.06, 1.0);
    group.add(frame, railL, railR, core);
  } else if (id === 'grimoire') {
    const coverMat = makeMat({ color: 0x1e293b, roughness: 0.7 });
    const pageMat = makeMat({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 1.1 });
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.36), coverMat);
    cover.position.set(0, 0.02, 0.36);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.3), pageMat);
    pages.position.set(0, 0.05, 0.36);
    group.add(cover, pages);
  } else if (id === 'minigun') {
    const drumMat = makeMat({ color: 0xfde047, roughness: 0.35, metalness: 0.75 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.48), darkIronMat);
    body.position.set(0, 0.0, 0.36);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.24, 8), drumMat);
    drum.position.set(0, -0.16, 0.38);
    const barrels = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.72, 6), steelMat);
    barrels.rotation.x = Math.PI / 2;
    barrels.position.set(0, 0.02, 0.92);
    group.add(body, drum, barrels);
  } else if (id === 'greatsword') {
    const magmaEdge = makeMat({ color: 0xff6b35, emissive: 0xea580c, emissiveIntensity: 0.85, roughness: 0.3, metalness: 0.7 });
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.46, 6), woodMat);
    grip.rotation.x = Math.PI / 2;
    grip.position.z = 0.18;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.1, 0.14), darkIronMat);
    guard.position.z = 0.42;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 1.48), magmaEdge);
    blade.position.z = 1.18;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.36, 4), magmaEdge);
    tip.rotation.x = Math.PI / 2;
    tip.rotation.y = Math.PI / 4;
    tip.position.z = 2.08;
    group.add(grip, guard, blade, tip);
  } else if (id === 'arcane_staff') {
    const arcaneMat = makeMat({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 1.2, roughness: 0.2 });
    const goldMat = makeMat({ color: 0xfacc15, roughness: 0.3, metalness: 0.8 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.55, 6), woodMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.72;
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 5, 8, Math.PI * 1.4), goldMat);
    crown.position.set(0, 0, 1.54);
    crown.rotation.z = -Math.PI * 0.2;
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), arcaneMat);
    crystal.position.set(0, 0, 1.58);
    group.add(shaft, crown, crystal);
  } else if (id === 'void_orb') {
    const voidMat = makeMat({ color: 0x1e1b4b, emissive: 0x7e22ce, emissiveIntensity: 1.4, roughness: 0.2 });
    const ringMat = makeMat({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.9, roughness: 0.25 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 6), darkIronMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.z = 0.18;
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), voidMat);
    core.position.z = 0.56;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 4, 12), ringMat);
    ring.rotation.x = Math.PI / 3;
    ring.position.z = 0.56;
    group.add(handle, core, ring);
  } else if (id === 'stormcaller_wand') {
    const copperMat = makeMat({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
    const sparkMat = makeMat({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.4, roughness: 0.18 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.86, 6), copperMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.42;
    const forkL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.3), sparkMat);
    forkL.position.set(-0.08, 0, 0.94);
    forkL.rotation.y = -0.25;
    const forkR = forkL.clone();
    forkR.position.x = 0.08;
    forkR.rotation.y = 0.25;
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), sparkMat);
    node.position.z = 0.96;
    group.add(shaft, forkL, forkR, node);
  } else if (id === 'frostbrand') {
    const iceMat = makeMat({ color: 0x67e8f9, emissive: 0x06b6d4, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.45 });
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.36, 6), darkIronMat);
    grip.rotation.x = Math.PI / 2;
    grip.position.z = 0.15;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.09, 0.11), iceMat);
    guard.position.z = 0.35;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.045, 1.15), iceMat);
    blade.position.z = 0.95;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.28, 4), iceMat);
    tip.rotation.x = Math.PI / 2;
    tip.rotation.y = Math.PI / 4;
    tip.position.z = 1.64;
    group.add(grip, guard, blade, tip);
  } else if (id === 'cursed_censer') {
    const bronzeMat = makeMat({ color: 0x92400e, roughness: 0.45, metalness: 0.72 });
    const blightMat = makeMat({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 1.35, roughness: 0.2 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.72, 6), woodMat);
    rod.rotation.x = Math.PI / 2;
    rod.position.z = 0.34;
    const cage = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), bronzeMat);
    cage.position.set(0, -0.14, 0.82);
    const flame = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13, 0), blightMat);
    flame.position.set(0, -0.14, 0.82);
    group.add(rod, cage, flame);
  } else if (id === 'runic_gauntlets') {
    const plateMat = makeMat({ color: 0x78350f, roughness: 0.38, metalness: 0.76 });
    const runeMat = makeMat({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.2, roughness: 0.2 });
    const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.36), plateMat);
    cuff.position.set(0, -0.02, 0.16);
    const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.16), runeMat);
    knuckle.position.set(0, 0, 0.38);
    group.add(cuff, knuckle);
  } else if (id === 'starfire_bow') {
    const bowMat = makeMat({ color: 0xfde047, emissive: 0xca8a04, emissiveIntensity: 0.55, roughness: 0.28, metalness: 0.65 });
    const starMat = makeMat({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.35, roughness: 0.2 });
    const limbTop = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.48, 0.07), bowMat);
    limbTop.position.set(0, 0.26, 0.42);
    limbTop.rotation.x = -0.35;
    const limbBot = limbTop.clone();
    limbBot.position.y = -0.26;
    limbBot.rotation.x = 0.35;
    const riser = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.12), darkIronMat);
    riser.position.set(0, 0, 0.35);
    const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.78, 5), starMat);
    arrow.rotation.x = Math.PI / 2;
    arrow.position.set(0, 0, 0.58);
    group.add(limbTop, limbBot, riser, arrow);
  }

  return group;
}

export interface PlayerRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  rightArm: THREE.Group;
  leftArm: THREE.Group;
  weaponMount: THREE.Group;
  blockShield: THREE.Mesh;
  boostAura: THREE.Mesh;
  orbitalGroup: THREE.Group;
  orbitals: THREE.Mesh[];
  bansheeBubble: THREE.Mesh;
  wearableAura: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  setWeapon: (id: WeaponId) => void;
  setWearable: (id: WearableId | null) => void;
  setBansheeShieldActive: (active: boolean) => void;
  setHitFlash: (active: boolean) => void;
  applyCustomization: (custom: CharacterCustomization) => void;
  setOrbitalCount: (count: number) => void;
}

export function createPlayerRig(
  textures: ProceduralTextures,
  initialCustom?: CharacterCustomization
): PlayerRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const cloakMat = makeMat({ color: 0x26354d, roughness: 0.82, metalness: 0.08 });
  const secondaryMat = makeMat({ color: 0x1a2233, roughness: 0.85, metalness: 0.06 });
  const trimMat = makeMat({ color: 0x64748b, roughness: 0.35, metalness: 0.72 });
  const skinMat = makeMat({ color: 0xf1d2bd, roughness: 0.75, metalness: 0.04 });
  const bootMat = makeMat({ color: 0x1e1815, roughness: 0.9, metalness: 0.05 });
  const eyeMat = makeMat({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.4, roughness: 0.2 });

  const flashables = [cloakMat, secondaryMat, trimMat, bootMat];

  const legGeo = new THREE.BoxGeometry(0.24, 0.6, 0.26);
  legGeo.translate(0, 0.3, 0);
  const leftLeg = new THREE.Mesh(legGeo, bootMat);
  leftLeg.position.set(-0.2, 0, 0);
  const rightLeg = new THREE.Mesh(legGeo, bootMat);
  rightLeg.position.set(0.2, 0, 0);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 0.88, 7), cloakMat);
  torso.position.y = 0.98;
  torso.castShadow = true;

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.48, 0.26, 7), secondaryMat);
  belt.position.y = 0.64;

  const pauldronGeo = new THREE.BoxGeometry(0.28, 0.18, 0.34);
  const pLeft = new THREE.Mesh(pauldronGeo, trimMat);
  pLeft.position.set(-0.42, 1.3, 0);
  pLeft.rotation.z = 0.22;
  const pRight = new THREE.Mesh(pauldronGeo, trimMat);
  pRight.position.set(0.42, 1.3, 0);
  pRight.rotation.z = -0.22;

  const face = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), skinMat);
  face.position.set(0, 1.56, 0.04);
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.055, 0.05), eyeMat);
  eyes.position.set(0, 1.58, 0.185);

  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 1.66, 0);

  const hoodMesh = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.56, 6), cloakMat);
  const hunterBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.54, 0.06, 8), secondaryMat);
  hunterBrim.position.y = 0.04;
  const hunterCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.32, 7), cloakMat);
  hunterCrown.position.y = 0.2;
  const hunterHat = new THREE.Group();
  hunterHat.add(hunterBrim, hunterCrown);

  const knightHelm = new THREE.Group();
  const helmBox = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.36), trimMat);
  helmBox.position.y = -0.06;
  const helmCrest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.42), secondaryMat);
  helmCrest.position.y = 0.16;
  knightHelm.add(helmBox, helmCrest);

  const roninHat = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.32, 8), trimMat);
  roninHat.position.y = 0.14;

  const alchemistGoggles = new THREE.Group();
  const goggleBand = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.32), secondaryMat);
  goggleBand.position.y = -0.06;
  const lensL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6), eyeMat);
  lensL.rotation.x = Math.PI / 2;
  lensL.position.set(-0.08, -0.06, 0.16);
  const lensR = lensL.clone();
  lensR.position.x = 0.08;
  alchemistGoggles.add(goggleBand, lensL, lensR);

  const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.34, 0.22, 7, 1, true), trimMat);
  collarMesh.position.y = -0.22;

  hatGroup.add(hoodMesh, hunterHat, knightHelm, roninHat, alchemistGoggles, collarMesh);

  const armGeo = new THREE.BoxGeometry(0.17, 0.44, 0.17);
  armGeo.translate(0, -0.16, 0.08);
  const handGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.42, 1.24, 0);
  const leftSleeve = new THREE.Mesh(armGeo, cloakMat);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(0, -0.38, 0.12);
  leftArm.add(leftSleeve, leftHand);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.42, 1.24, 0);
  const rightSleeve = new THREE.Mesh(armGeo, cloakMat);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0, -0.38, 0.12);
  rightArm.add(rightSleeve, rightHand);

  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.24, 0.22);
  rightArm.add(weaponMount);

  const blockShield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 1.2, 8, 1, true, -Math.PI * 0.45, Math.PI * 0.9),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false })
  );
  blockShield.position.set(0, 1.0, 0.25);
  blockShield.visible = false;

  const boostAura = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.08, 16),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false })
  );
  boostAura.rotation.x = -Math.PI / 2;
  boostAura.position.y = 0.05;
  boostAura.visible = false;

  // Spectral orbital blades (unlocked via Upgrade Tree!)
  const orbitalGroup = new THREE.Group();
  orbitalGroup.position.y = 1.05;
  const orbitals: THREE.Mesh[] = [];
  const orbMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
  const orbGeo = new THREE.OctahedronGeometry(0.24, 0);
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(orbGeo, orbMat);
    m.scale.set(0.6, 0.35, 1.5);
    m.visible = false;
    orbitalGroup.add(m);
    orbitals.push(m);
  }

  const bansheeBubble = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 1),
    new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
      depthWrite: false,
    })
  );
  bansheeBubble.position.y = 1.02;
  bansheeBubble.visible = false;

  const wearableAura = new THREE.Mesh(
    new THREE.RingGeometry(1.15, 1.32, 16),
    new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  wearableAura.rotation.x = -Math.PI / 2;
  wearableAura.position.y = 0.04;
  wearableAura.visible = false;

  const wearableGroup = new THREE.Group();
  const frostFistMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.24, 0.24),
    makeMat({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.9, roughness: 0.2 })
  );
  frostFistMesh.position.set(0, -0.38, 0.14);
  frostFistMesh.visible = false;
  leftArm.add(frostFistMesh);

  bodyGroup.add(leftLeg, rightLeg, torso, belt, pLeft, pRight, face, eyes, hatGroup, leftArm, rightArm, blockShield, wearableGroup, bansheeBubble);
  root.add(boostAura, wearableAura, orbitalGroup, createContactShadow(textures, 0.85));

  const weaponIds: WeaponId[] = [
    'sword', 'club', 'chain', 'fangs', 'pistol', 'sniper',
    'axe', 'scythe', 'shotgun', 'crossbow', 'flamethrower', 'katana',
    'halberd', 'chakram', 'railgun', 'grimoire', 'minigun', 'greatsword',
    'arcane_staff', 'void_orb', 'stormcaller_wand', 'frostbrand', 'cursed_censer',
    'runic_gauntlets', 'starfire_bow',
  ];
  const weaponMeshes = {} as Record<WeaponId, THREE.Group>;
  for (const wid of weaponIds) weaponMeshes[wid] = createWeaponMesh(wid);

  let currentWeapon: WeaponId = 'sword';
  let currentWearable: WearableId | null = null;
  weaponMount.add(weaponMeshes.sword);

  const applyCustomization = (custom: CharacterCustomization) => {
    skinMat.color.set(custom.skinColor);
    const cloth = CLOTHING_OPTIONS.find((c) => c.id === custom.clothing) ?? CLOTHING_OPTIONS[0];
    cloakMat.color.setHex(cloth.primaryHex);
    secondaryMat.color.setHex(cloth.secondaryHex);
    trimMat.color.setHex(cloth.trimHex);

    if (custom.gender === 'male') {
      torso.scale.set(1.18, 1.04, 1.1);
      pLeft.scale.set(1.22, 1.15, 1.15);
      pRight.scale.set(1.22, 1.15, 1.15);
      pLeft.position.x = -0.48;
      pRight.position.x = 0.48;
      leftArm.position.x = -0.48;
      rightArm.position.x = 0.48;
      belt.scale.set(1.02, 1, 1.02);
    } else if (custom.gender === 'female') {
      torso.scale.set(0.86, 1.0, 0.9);
      pLeft.scale.set(0.82, 0.85, 0.85);
      pRight.scale.set(0.82, 0.85, 0.85);
      pLeft.position.x = -0.36;
      pRight.position.x = 0.36;
      leftArm.position.x = -0.36;
      rightArm.position.x = 0.36;
      belt.scale.set(1.12, 1.15, 1.08);
    } else {
      torso.scale.set(1.0, 1.0, 1.0);
      pLeft.scale.set(1.0, 1.0, 1.0);
      pRight.scale.set(1.0, 1.0, 1.0);
      pLeft.position.x = -0.42;
      pRight.position.x = 0.42;
      leftArm.position.x = -0.42;
      rightArm.position.x = 0.42;
      belt.scale.set(1.0, 1.0, 1.0);
    }

    hoodMesh.visible = custom.clothing === 'shadow_cloak';
    hunterHat.visible = custom.clothing === 'hunter_coat';
    knightHelm.visible = custom.clothing === 'iron_plate';
    roninHat.visible = custom.clothing === 'ronin_garb';
    alchemistGoggles.visible = custom.clothing === 'alchemist';
    collarMesh.visible = custom.clothing === 'wasteland_jacket';
  };

  if (initialCustom) applyCustomization(initialCustom);
  else applyCustomization({ skinColor: '#f1d2bd', gender: 'neuter', clothing: 'shadow_cloak' });

  const setWearable = (id: WearableId | null) => {
    if (id === currentWearable) return;
    currentWearable = id;
    while (wearableGroup.children.length > 0) {
      wearableGroup.remove(wearableGroup.children[0]);
    }
    frostFistMesh.visible = id === 'iceborn_gauntlet';
    wearableAura.visible = false;
    if (!id) return;

    const spec = WEARABLES[id];
    const plateMat = makeMat({
      color: spec.accentInt,
      emissive: spec.accentInt,
      emissiveIntensity: 0.32,
      roughness: 0.35,
      metalness: 0.65,
    });

    if (id === 'sunfire_aegis' || id === 'frozen_heart') {
      const auraMat = wearableAura.material as THREE.MeshBasicMaterial;
      auraMat.color.setHex(spec.accentInt);
      wearableAura.visible = true;
    }

    if (id === 'thornmail') {
      for (const sx of [-0.46, 0.46]) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 4), plateMat);
        spike.position.set(sx, 1.5, 0);
        spike.rotation.z = sx < 0 ? 0.45 : -0.45;
        wearableGroup.add(spike);
      }
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.44), plateMat);
      plate.position.set(0, 1.05, 0);
      wearableGroup.add(plate);
    } else if (id === 'force_of_nature') {
      const cape = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.85, 0.08), plateMat);
      cape.position.set(0, 0.92, -0.32);
      cape.rotation.x = 0.16;
      wearableGroup.add(cape);
    } else if (id === 'jaksho') {
      const carapace = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), plateMat);
      carapace.scale.set(1.2, 1.1, 0.85);
      carapace.position.set(0, 1.06, -0.14);
      wearableGroup.add(carapace);
    } else {
      for (const sx of [-0.45, 0.45]) {
        const paul = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.38), plateMat);
        paul.position.set(sx, 1.34, 0);
        paul.rotation.z = sx < 0 ? 0.25 : -0.25;
        wearableGroup.add(paul);
      }
    }
  };

  return {
    root,
    bodyGroup,
    rightArm,
    leftArm,
    weaponMount,
    blockShield,
    boostAura,
    orbitalGroup,
    orbitals,
    bansheeBubble,
    wearableAura,
    leftLeg,
    rightLeg,
    setWeapon: (id: WeaponId) => {
      if (id === currentWeapon) return;
      weaponMount.remove(weaponMeshes[currentWeapon]);
      currentWeapon = id;
      weaponMount.add(weaponMeshes[id]);
    },
    setWearable,
    setBansheeShieldActive: (active: boolean) => {
      bansheeBubble.visible = active && currentWearable === 'banshees_veil';
    },
    setHitFlash: (active: boolean) => {
      for (const m of flashables) {
        m.emissive.setHex(active ? 0xffffff : 0x000000);
        m.emissiveIntensity = active ? 0.85 : 0;
      }
    },
    applyCustomization,
    setOrbitalCount: (count: number) => {
      for (let i = 0; i < orbitals.length; i++) {
        orbitals[i].visible = i < count;
      }
    },
  };
}

export interface EnemyRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  weaponArm: THREE.Group;
  coreWeakPoint: THREE.Mesh | null;
  laserLine: THREE.Line | null;
  wingGroup?: THREE.Group;
  setHitFlash: (active: boolean, colorHex?: number) => void;
  setPoisonTint: (active: boolean) => void;
}

export function createEnemyRig(kind: EnemyKind, textures: ProceduralTextures): EnemyRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const flashables: THREE.MeshStandardMaterial[] = [];
  const weaponArm = new THREE.Group();
  let coreWeakPoint: THREE.Mesh | null = null;
  let laserLine: THREE.Line | null = null;
  let wingGroup: THREE.Group | undefined;

  if (kind === 'zombie_sword' || kind === 'zombie_club' || kind === 'zombie_bomber' || kind === 'boss_zombie') {
    const isBoss = kind === 'boss_zombie';
    const isBrute = kind === 'zombie_club';
    const isBomber = kind === 'zombie_bomber';
    const scale = isBoss ? 3.6 : isBrute ? 1.18 : 1.0;
    bodyGroup.scale.setScalar(scale);

    const skinMat = makeMat({
      color: isBoss ? 0x3a5a38 : isBomber ? 0x65a30d : isBrute ? 0x4d6b47 : 0x5c7c54,
      roughness: 0.85,
    });
    const ragMat = makeMat({
      color: isBoss ? 0x281e24 : isBomber ? 0x3f2e18 : isBrute ? 0x3b2a26 : 0x2b3340,
      roughness: 0.92,
    });
    const eyeMat = makeMat({
      color: isBoss ? 0xa3e635 : isBomber ? 0xf97316 : 0xfef08a,
      emissive: isBoss ? 0x65a30d : isBomber ? 0xea580c : 0xeab308,
      emissiveIntensity: 1.4,
    });
    flashables.push(skinMat, ragMat);

    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.56, 0.28), ragMat);
    legs.position.y = 0.28;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.74, 0.36), ragMat);
    torso.position.y = 0.9;
    torso.rotation.x = 0.14;
    torso.castShadow = true;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.34), skinMat);
    head.position.set(0, 1.44, 0.08);
    head.rotation.z = 0.12;
    const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.05), eyeMat);
    eyes.position.set(0, 1.46, 0.25);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.54, 0.18), skinMat);
    leftArm.position.set(-0.4, 1.05, 0.18);
    leftArm.rotation.x = -0.9;

    weaponArm.position.set(0.4, 1.08, 0.05);
    const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.52, 0.18), skinMat);
    armMesh.position.set(0, -0.18, 0.12);
    armMesh.rotation.x = -0.6;
    weaponArm.add(armMesh);

    if (isBomber) {
      const sacMat = makeMat({ color: 0xa3e635, emissive: 0x84cc16, emissiveIntensity: 1.4 });
      const sac1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.34, 0), sacMat);
      sac1.position.set(0, 1.02, 0.18);
      bodyGroup.add(sac1);
    } else if (isBoss) {
      const cleaver = createWeaponMesh('greatsword');
      cleaver.scale.setScalar(1.05);
      cleaver.position.set(0, -0.28, 0.22);
      weaponArm.add(cleaver);
      const pustule = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.28, 0),
        makeMat({ color: 0x84cc16, emissive: 0x4d7c0f, emissiveIntensity: 1.2 })
      );
      pustule.position.set(-0.24, 1.25, -0.15);
      bodyGroup.add(pustule);
    } else {
      const wMesh = createWeaponMesh(isBrute ? 'club' : 'sword');
      wMesh.scale.setScalar(0.85);
      wMesh.position.set(0, -0.25, 0.22);
      weaponArm.add(wMesh);
    }

    bodyGroup.add(legs, torso, head, eyes, leftArm, weaponArm);
    root.add(createContactShadow(textures, 0.85 * scale));
  } else if (kind === 'cultist' || kind === 'plague_archon') {
    const isArchon = kind === 'plague_archon';
    const robeMat = makeMat({ color: isArchon ? 0x123026 : 0x311d52, roughness: 0.8 });
    const glowMat = makeMat({
      color: isArchon ? 0x4ade80 : 0xa78bfa,
      emissive: isArchon ? 0x22c55e : 0x7c3aed,
      emissiveIntensity: 1.4,
    });
    flashables.push(robeMat);
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.45, 7), robeMat);
    robe.position.y = isArchon ? 1.05 : 0.82;
    const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 6), robeMat);
    cowl.position.y = isArchon ? 1.85 : 1.62;
    const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.06), glowMat);
    eyes.position.set(0, isArchon ? 1.65 : 1.42, 0.2);

    weaponArm.position.set(0.36, isArchon ? 1.3 : 1.08, 0.1);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 5), robeMat);
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), glowMat);
    orb.position.y = 0.72;
    weaponArm.add(staff, orb);
    bodyGroup.add(robe, cowl, eyes, weaponArm);
    root.add(createContactShadow(textures, 0.82));
  } else if (kind === 'skeleton' || kind === 'skeleton_archer' || kind === 'boss_skeleton3') {
    const isArcher = kind === 'skeleton_archer';
    const isBoss3 = kind === 'boss_skeleton3';
    const scale = isBoss3 ? 3.55 : 1.0;
    bodyGroup.scale.setScalar(scale);

    const boneMat = makeMat({ color: isBoss3 ? 0xcfd8cc : isArcher ? 0xcbd5e1 : 0xd6d3c9, roughness: 0.65 });
    const darkMat = makeMat({ color: 0x161b22, roughness: 0.9 });
    const eyeMat = makeMat({
      color: isBoss3 ? 0x4ade80 : isArcher ? 0xa78bfa : 0xf43f5e,
      emissive: isBoss3 ? 0x22c55e : isArcher ? 0x7c3aed : 0xe11d48,
      emissiveIntensity: 1.5,
    });
    flashables.push(boneMat);

    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.24), boneMat);
    pelvis.position.y = 0.56;
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.56, 5), boneMat);
    legL.position.set(-0.14, 0.28, 0);
    const legR = legL.clone();
    legR.position.x = 0.14;
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.64, 5), boneMat);
    spine.position.y = 0.92;
    const ribs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.46, 0.26), boneMat);
    ribs.position.y = 1.02;
    ribs.castShadow = true;

    if (isBoss3) {
      // Three menacing skulls side by side with green fire crowns!
      for (const ox of [-0.32, 0, 0.32]) {
        const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.21, 0), boneMat);
        s.position.set(ox, ox === 0 ? 1.56 : 1.44, 0.04);
        const e = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.045, 0.05), eyeMat);
        e.position.set(ox, s.position.y, 0.22);
        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 5), eyeMat);
        crown.position.set(ox, s.position.y + 0.24, 0.04);
        bodyGroup.add(s, e, crown);
      }
    } else {
      const skull = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), boneMat);
      skull.position.set(0, 1.48, 0.03);
      const sockets = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.1), darkMat);
      sockets.position.set(0, 1.48, 0.19);
      const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.04), eyeMat);
      eyes.position.set(0, 1.48, 0.24);
      bodyGroup.add(skull, sockets, eyes);
    }

    weaponArm.position.set(0.36, 1.15, 0.06);
    const armBone = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.46, 5), boneMat);
    armBone.rotation.x = -0.8;
    armBone.position.set(0, -0.1, 0.15);
    const wMesh = createWeaponMesh(isBoss3 ? 'scythe' : isArcher ? 'crossbow' : 'chain');
    wMesh.scale.setScalar(0.95);
    wMesh.position.set(0, -0.18, 0.25);
    weaponArm.add(armBone, wMesh);

    if (isArcher) {
      const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.3, 1.15, 0.8),
        new THREE.Vector3(0.3, 1.15, 16),
      ]);
      laserLine = new THREE.Line(
        laserGeo,
        new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.65 })
      );
      laserLine.visible = false;
      bodyGroup.add(laserLine);
    }

    bodyGroup.add(pelvis, legL, legR, spine, ribs, weaponArm);
    root.add(createContactShadow(textures, 0.78 * scale));
  } else if (kind === 'imp' || kind === 'magma_imp' || kind === 'ash_gargoyle') {
    const isMagma = kind === 'magma_imp';
    const isGarg = kind === 'ash_gargoyle';
    const skinMat = makeMat({
      color: isGarg ? 0x475569 : isMagma ? 0x9a3412 : 0x991b1b,
      roughness: isGarg ? 0.88 : 0.6,
    });
    const glowMat = makeMat({
      color: isGarg ? 0xf59e0b : isMagma ? 0xff5500 : 0xfbbf24,
      emissive: isGarg ? 0xd97706 : 0xea580c,
      emissiveIntensity: 1.4,
    });
    flashables.push(skinMat);

    const scale = isGarg ? 1.12 : 0.88;
    bodyGroup.scale.setScalar(scale);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.56, 0.32), skinMat);
    torso.position.y = 0.96;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.3), skinMat);
    head.position.set(0, 1.4, 0.06);
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 4), glowMat);
    hornL.position.set(-0.14, 1.62, 0.04);
    hornL.rotation.z = 0.3;
    const hornR = hornL.clone();
    hornR.position.x = 0.14;
    hornR.rotation.z = -0.3;
    const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.04), glowMat);
    eyes.position.set(0, 1.42, 0.22);

    wingGroup = new THREE.Group();
    wingGroup.position.set(0, 1.05, -0.18);
    const wingGeo = new THREE.BoxGeometry(0.65, 0.42, 0.06);
    const wL = new THREE.Mesh(wingGeo, skinMat);
    wL.position.set(-0.42, 0.08, -0.05);
    wL.rotation.y = 0.35;
    const wR = new THREE.Mesh(wingGeo, skinMat);
    wR.position.set(0.42, 0.08, -0.05);
    wR.rotation.y = -0.35;
    wingGroup.add(wL, wR);

    weaponArm.position.set(0.32, 1.05, 0.1);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.36, 4), glowMat);
    claw.rotation.x = Math.PI / 2;
    weaponArm.add(claw);

    bodyGroup.add(torso, head, hornL, hornR, eyes, wingGroup, weaponArm);
    root.add(createContactShadow(textures, 0.72));
  } else if (kind === 'hell_knight' || kind === 'abyss_brute') {
    const isAbyss = kind === 'abyss_brute';
    const scale = isAbyss ? 1.42 : 1.18;
    bodyGroup.scale.setScalar(scale);
    const armorMat = makeMat({
      color: isAbyss ? 0x1c2826 : 0x3b1719,
      roughness: 0.42,
      metalness: 0.65,
    });
    const glowMat = makeMat({
      color: isAbyss ? 0x4ade80 : 0xf97316,
      emissive: isAbyss ? 0x22c55e : 0xea580c,
      emissiveIntensity: 1.5,
    });
    flashables.push(armorMat);

    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.6, 0.34), armorMat);
    legs.position.y = 0.3;
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.78, 0.44), armorMat);
    chest.position.y = 0.96;
    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.36), armorMat);
    helm.position.set(0, 1.52, 0.04);
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.36, 5), glowMat);
    hornL.position.set(-0.22, 1.74, 0.04);
    hornL.rotation.z = 0.35;
    const hornR = hornL.clone();
    hornR.position.x = 0.22;
    hornR.rotation.z = -0.35;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.06), glowMat);
    visor.position.set(0, 1.54, 0.24);

    weaponArm.position.set(0.5, 1.1, 0.1);
    const weapon = createWeaponMesh(isAbyss ? 'axe' : 'greatsword');
    weapon.scale.setScalar(0.95);
    weaponArm.add(weapon);

    bodyGroup.add(legs, chest, helm, hornL, hornR, visor, weaponArm);
    root.add(createContactShadow(textures, 0.95 * scale));
  } else if (kind === 'spider' || kind === 'spider_spitter') {
    const isSpitter = kind === 'spider_spitter';
    const chitinMat = makeMat({ color: isSpitter ? 0x16241f : 0x1b1726, roughness: 0.45, metalness: 0.25 });
    const venomMat = makeMat({
      color: isSpitter ? 0x84cc16 : 0x22c55e,
      emissive: isSpitter ? 0x4d7c0f : 0x15803d,
      emissiveIntensity: 0.95,
    });
    const eyeMat = makeMat({ color: isSpitter ? 0xfacc15 : 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.5 });
    flashables.push(chitinMat, venomMat);

    const thorax = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.34, 0.56), chitinMat);
    thorax.position.set(0, 0.44, 0.15);
    const abdomen = new THREE.Mesh(new THREE.DodecahedronGeometry(isSpitter ? 0.58 : 0.48, 0), chitinMat);
    abdomen.scale.set(1.0, 0.85, 1.25);
    abdomen.position.set(0, 0.56, -0.5);
    const venomSac = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.26, 0.52), venomMat);
    venomSac.position.set(0, 0.74, -0.5);
    const eyeCluster = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.08), eyeMat);
    eyeCluster.position.set(0, 0.5, 0.44);
    const fangs = createWeaponMesh('fangs');
    fangs.position.set(0, 0.35, 0.36);
    weaponArm.add(fangs);

    const legGeo = new THREE.BoxGeometry(0.58, 0.09, 0.1);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const leg = new THREE.Mesh(legGeo, chitinMat);
        leg.position.set(side * 0.48, 0.32, 0.24 - i * 0.26);
        leg.rotation.z = side * -0.45;
        leg.rotation.y = side * (0.28 - i * 0.28);
        bodyGroup.add(leg);
      }
    }
    bodyGroup.add(thorax, abdomen, venomSac, eyeCluster, weaponArm);
    root.add(createContactShadow(textures, 1.0));
  } else if (kind === 'wraith' || kind === 'void_reaper') {
    const isVoid = kind === 'void_reaper';
    const shroudMat = makeMat({
      color: isVoid ? 0x0e3b2e : 0x3b1d5e,
      emissive: isVoid ? 0x064e3b : 0x1e1035,
      emissiveIntensity: 0.55,
      roughness: 0.75,
    });
    const skullMat = makeMat({
      color: isVoid ? 0x86efac : 0xe9d5ff,
      emissive: isVoid ? 0x22c55e : 0xa855f7,
      emissiveIntensity: 0.9,
    });
    flashables.push(shroudMat, skullMat);

    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.45, 7), shroudMat);
    robe.position.y = 0.92;
    const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.48, 6), shroudMat);
    cowl.position.y = 1.72;
    const mask = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), skullMat);
    mask.position.set(0, 1.58, 0.14);

    weaponArm.position.set(0.38, 1.25, 0.08);
    const scythe = createWeaponMesh('scythe');
    scythe.scale.setScalar(0.95);
    weaponArm.add(scythe);

    bodyGroup.add(robe, cowl, mask, weaponArm);
    root.add(createContactShadow(textures, 0.8));
  } else if (kind === 'boss_hellhound') {
    // Cerberus, 3-headed blazing Gate Hound!
    bodyGroup.scale.setScalar(3.0);
    const furMat = makeMat({ color: 0x2b0d0d, roughness: 0.8 });
    const emberMat = makeMat({ color: 0xff5500, emissive: 0xea580c, emissiveIntensity: 1.5 });
    flashables.push(furMat);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 1.45), furMat);
    torso.position.set(0, 0.75, 0);
    const mane = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.7, 6), emberMat);
    mane.rotation.x = Math.PI / 2;
    mane.position.set(0, 0.88, 0.55);

    const legGeo = new THREE.BoxGeometry(0.22, 0.65, 0.24);
    for (const [lx, lz] of [[-0.32, 0.5], [0.32, 0.5], [-0.32, -0.5], [0.32, -0.5]]) {
      const leg = new THREE.Mesh(legGeo, furMat);
      leg.position.set(lx, 0.32, lz);
      bodyGroup.add(leg);
    }

    for (const hx of [-0.34, 0, 0.34]) {
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.48), furMat);
      head.position.set(hx, hx === 0 ? 1.12 : 0.96, 0.95);
      const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.05), emberMat);
      eyes.position.set(hx, head.position.y + 0.04, 1.2);
      bodyGroup.add(head, eyes);
    }

    bodyGroup.add(torso, mane, weaponArm);
    root.add(createContactShadow(textures, 2.85));
  } else if (kind === 'boss_golem') {
    // Giant Molten Lava Golem with glowing rear weak core!
    bodyGroup.scale.setScalar(3.85);
    const rockMat = makeMat({ color: 0x292524, roughness: 0.92, metalness: 0.1 });
    const lavaMat = makeMat({ color: 0xff6b00, emissive: 0xff4500, emissiveIntensity: 1.8 });
    flashables.push(rockMat);

    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.6, 0.48), rockMat);
    legs.position.y = 0.3;
    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 0), rockMat);
    torso.position.y = 1.05;
    const chestCrack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.65), lavaMat);
    chestCrack.position.y = 1.05;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.38, 0.44), rockMat);
    head.position.set(0, 1.65, 0.1);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.06), lavaMat);
    visor.position.set(0, 1.68, 0.33);

    coreWeakPoint = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), lavaMat);
    coreWeakPoint.position.set(0, 1.12, -0.64);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.85, 0.34), rockMat);
    armL.position.set(-0.78, 1.02, 0.14);
    weaponArm.position.set(0.78, 1.1, 0.1);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.9, 0.36), rockMat);
    armR.position.set(0, -0.2, 0.15);
    weaponArm.add(armR);

    bodyGroup.add(legs, torso, chestCrack, head, visor, coreWeakPoint, armL, weaponArm);
    root.add(createContactShadow(textures, 3.4));
  } else if (kind === 'boss_satan') {
    // Satan, Lord of the Abyss: Towering crimson archfiend with giant horns, blazing bat wings & Hellfire Trident!
    bodyGroup.scale.setScalar(4.0);
    const skinMat = makeMat({ color: 0x7f1d1d, roughness: 0.48, metalness: 0.22 });
    const obsidianMat = makeMat({ color: 0x18181b, roughness: 0.4, metalness: 0.7 });
    const fireMat = makeMat({ color: 0xf97316, emissive: 0xef4444, emissiveIntensity: 1.75 });
    flashables.push(skinMat, obsidianMat);

    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.66, 0.36), obsidianMat);
    legs.position.y = 0.33;
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.36, 0.92, 6), skinMat);
    chest.position.y = 1.05;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.36), skinMat);
    head.position.set(0, 1.66, 0.04);
    const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.06), fireMat);
    eyes.position.set(0, 1.68, 0.23);

    // Towering curved horns
    for (const sx of [-1, 1]) {
      const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.48, 5), obsidianMat);
      horn1.position.set(sx * 0.22, 1.94, 0);
      horn1.rotation.z = sx * -0.42;
      const hornTip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.36, 4), fireMat);
      hornTip.position.set(sx * 0.36, 2.22, 0.04);
      hornTip.rotation.z = sx * -0.15;
      bodyGroup.add(horn1, hornTip);
    }

    // Blazing Bat Wings
    wingGroup = new THREE.Group();
    wingGroup.position.set(0, 1.28, -0.24);
    for (const sx of [-1, 1]) {
      const wingFrame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.75, 0.07), obsidianMat);
      wingFrame.position.set(sx * 0.78, 0.22, -0.06);
      wingFrame.rotation.y = sx * -0.35;
      wingFrame.rotation.z = sx * 0.22;
      const wingMembrane = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.56, 0.04), fireMat);
      wingMembrane.position.copy(wingFrame.position);
      wingMembrane.rotation.copy(wingFrame.rotation);
      wingGroup.add(wingFrame, wingMembrane);
    }

    // Giant Hellfire Trident
    weaponArm.position.set(0.58, 1.24, 0.08);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 6), obsidianMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.85;
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.08), fireMat);
    crossbar.position.z = 1.65;
    for (const px of [-0.22, 0, 0.22]) {
      const prong = new THREE.Mesh(new THREE.ConeGeometry(0.06, px === 0 ? 0.52 : 0.38, 4), fireMat);
      prong.rotation.x = Math.PI / 2;
      prong.position.set(px, 0, px === 0 ? 1.92 : 1.84);
      weaponArm.add(prong);
    }
    weaponArm.add(shaft, crossbar);

    bodyGroup.add(legs, chest, head, eyes, wingGroup, weaponArm);
    root.add(createContactShadow(textures, 3.6));
  } else if (kind === 'wisp_lantern') {
    const ironMat = makeMat({ color: 0x1e293b, roughness: 0.45, metalness: 0.72 });
    const glowMat = makeMat({ color: 0x5eead4, emissive: 0x14b8a6, emissiveIntensity: 1.7 });
    flashables.push(ironMat);
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.65, 6, 1, true), ironMat);
    cage.position.y = 1.25;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.28, 6), ironMat);
    cap.position.y = 1.7;
    const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), glowMat);
    flame.position.y = 1.25;
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 5), glowMat);
    tail.rotation.x = Math.PI;
    tail.position.y = 0.7;
    bodyGroup.add(cage, cap, flame, tail, weaponArm);
    root.add(createContactShadow(textures, 0.68));
  } else if (kind === 'bog_shaman' || kind === 'hell_warlock' || kind === 'plague_alchemist') {
    const isWarlock = kind === 'hell_warlock';
    const isAlch = kind === 'plague_alchemist';
    const robeMat = makeMat({
      color: isWarlock ? 0x450a0a : isAlch ? 0x14532d : 0x1e3a2f,
      roughness: 0.85,
    });
    const glowMat = makeMat({
      color: isWarlock ? 0xf97316 : isAlch ? 0x4ade80 : 0xa3e635,
      emissive: isWarlock ? 0xea580c : 0x16a34a,
      emissiveIntensity: 1.45,
    });
    flashables.push(robeMat);
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 7), robeMat);
    robe.position.y = 0.78;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), robeMat);
    head.position.set(0, 1.56, 0.04);
    const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.06), glowMat);
    eyes.position.set(0, 1.58, 0.22);

    if (isWarlock) {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 4, 10), glowMat);
      halo.position.set(0, 1.85, -0.05);
      bodyGroup.add(halo);
    } else if (isAlch) {
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 4), glowMat);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 1.52, 0.32);
      const vat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.56, 6), glowMat);
      vat.position.set(0, 1.05, -0.34);
      bodyGroup.add(beak, vat);
    } else {
      for (const sx of [-1, 1]) {
        const antler = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.42, 4), glowMat);
        antler.position.set(sx * 0.22, 1.86, 0);
        antler.rotation.z = sx * -0.45;
        bodyGroup.add(antler);
      }
    }

    weaponArm.position.set(0.38, 1.12, 0.1);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.35, 5), robeMat);
    const orb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), glowMat);
    orb.position.y = 0.72;
    weaponArm.add(staff, orb);
    bodyGroup.add(robe, head, eyes, weaponArm);
    root.add(createContactShadow(textures, 0.82));
  } else if (kind === 'cinder_hound') {
    const furMat = makeMat({ color: 0x261210, roughness: 0.78 });
    const emberMat = makeMat({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.5 });
    flashables.push(furMat);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 1.05), furMat);
    body.position.set(0, 0.58, 0);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.46), furMat);
    head.position.set(0, 0.76, 0.65);
    const mane = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.46, 5), emberMat);
    mane.rotation.x = Math.PI / 2;
    mane.position.set(0, 0.76, 0.36);
    const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.05), emberMat);
    eyes.position.set(0, 0.82, 0.89);
    for (const [lx, lz] of [[-0.22, 0.38], [0.22, 0.38], [-0.22, -0.38], [0.22, -0.38]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), furMat);
      leg.position.set(lx, 0.22, lz);
      bodyGroup.add(leg);
    }
    bodyGroup.add(body, head, mane, eyes, weaponArm);
    root.add(createContactShadow(textures, 0.95));
  } else if (kind === 'magma_slime' || kind === 'magma_mite') {
    const isMite = kind === 'magma_mite';
    const rockMat = makeMat({ color: 0x3f231d, roughness: 0.65 });
    const lavaMat = makeMat({ color: 0xff6b00, emissive: 0xea580c, emissiveIntensity: 1.6 });
    flashables.push(rockMat, lavaMat);
    const scale = isMite ? 0.55 : 1.0;
    bodyGroup.scale.setScalar(scale);
    const mound = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 0), lavaMat);
    mound.scale.set(1.15, 0.82, 1.15);
    mound.position.y = 0.52;
    const crust = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.95), rockMat);
    crust.position.y = 0.28;
    const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.08), makeMat({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.8 }));
    eyes.position.set(0, 0.68, 0.65);
    bodyGroup.add(mound, crust, eyes, weaponArm);
    root.add(createContactShadow(textures, 0.9 * scale));
  } else if (kind === 'obsidian_sentinel' || kind === 'abyss_paladin') {
    const isPaladin = kind === 'abyss_paladin';
    const scale = isPaladin ? 1.24 : 1.32;
    bodyGroup.scale.setScalar(scale);
    const armorMat = makeMat({
      color: isPaladin ? 0x3b1320 : 0x1c1917,
      roughness: 0.4,
      metalness: 0.72,
    });
    const glowMat = makeMat({
      color: isPaladin ? 0xe11d48 : 0xf97316,
      emissive: isPaladin ? 0xbe123c : 0xea580c,
      emissiveIntensity: 1.5,
    });
    flashables.push(armorMat);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.6, 0.36), armorMat);
    legs.position.y = 0.3;
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.82, 0.48), armorMat);
    chest.position.y = 0.98;
    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), armorMat);
    helm.position.set(0, 1.56, 0.04);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.06), glowMat);
    visor.position.set(0, 1.58, 0.25);

    if (!isPaladin) {
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.25, 0.18), armorMat);
      shield.position.set(-0.28, 0.9, 0.42);
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 0.22), glowMat);
      trim.position.set(-0.28, 0.9, 0.43);
      bodyGroup.add(shield, trim);
    } else {
      for (const sx of [-0.22, 0.22]) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.38, 4), glowMat);
        horn.position.set(sx, 1.84, 0);
        horn.rotation.z = sx < 0 ? 0.35 : -0.35;
        bodyGroup.add(horn);
      }
    }

    weaponArm.position.set(0.52, 1.12, 0.1);
    const w = createWeaponMesh(isPaladin ? 'greatsword' : 'club');
    w.scale.setScalar(0.95);
    weaponArm.add(w);
    bodyGroup.add(legs, chest, helm, visor, weaponArm);
    root.add(createContactShadow(textures, 1.05 * scale));
  } else if (kind === 'spectral_banshee') {
    const shroudMat = makeMat({ color: 0x064e3b, emissive: 0x10b981, emissiveIntensity: 0.65, roughness: 0.65 });
    const glowMat = makeMat({ color: 0x6ee7b7, emissive: 0x34d399, emissiveIntensity: 1.5 });
    flashables.push(shroudMat);
    const gown = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.55, 7), shroudMat);
    gown.position.y = 0.95;
    const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), glowMat);
    head.position.set(0, 1.65, 0.06);
    const veil = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.56, 6), shroudMat);
    veil.position.set(0, 1.82, -0.05);
    const clawL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 4), glowMat);
    clawL.rotation.x = Math.PI / 2;
    clawL.position.set(-0.36, 1.25, 0.28);
    const clawR = clawL.clone();
    clawR.position.x = 0.36;
    bodyGroup.add(gown, head, veil, clawL, clawR, weaponArm);
    root.add(createContactShadow(textures, 0.85));
  } else {
    // robot_pistol | robot_sniper | robot_pyro | robot_tesla
    const isSniper = kind === 'robot_sniper';
    const isPyro = kind === 'robot_pyro';
    const isTesla = kind === 'robot_tesla';
    const chassisMat = makeMat({ color: isTesla ? 0x1e3a5f : isPyro ? 0x5c3a2e : 0x475569, roughness: 0.35, metalness: 0.78 });
    const shieldMat = makeMat({ map: textures.metalHazard, color: 0xffffff, roughness: 0.45, metalness: 0.55 });
    const visorMat = makeMat({
      color: isTesla ? 0x38bdf8 : isPyro ? 0xf97316 : isSniper ? 0xf43f5e : 0xfacc15,
      emissive: isTesla ? 0x0ea5e9 : isPyro ? 0xea580c : isSniper ? 0xe11d48 : 0xeab308,
      emissiveIntensity: 1.4,
    });
    const coreMat = makeMat({ color: 0xff6b00, emissive: 0xff5500, emissiveIntensity: 1.8, roughness: 0.2 });
    flashables.push(chassisMat, shieldMat);

    const treadGeo = new THREE.BoxGeometry(0.32, 0.46, 0.62);
    const treadL = new THREE.Mesh(treadGeo, chassisMat);
    treadL.position.set(-0.34, 0.23, 0);
    const treadR = new THREE.Mesh(treadGeo, chassisMat);
    treadR.position.set(0.34, 0.23, 0);

    const hull = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.92, 0.66), chassisMat);
    hull.position.y = 0.92;
    const frontShield = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.78, 0.16), shieldMat);
    frontShield.position.set(0, 0.92, 0.38);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.42), chassisMat);
    head.position.set(0, 1.56, 0.04);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.06), visorMat);
    visor.position.set(0, 1.58, 0.26);

    coreWeakPoint = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), coreMat);
    coreWeakPoint.position.set(0, 1.02, -0.45);

    weaponArm.position.set(0.56, 1.12, 0.1);
    const mount = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.34), chassisMat);
    const gun = createWeaponMesh(isTesla ? 'stormcaller_wand' : isPyro ? 'flamethrower' : isSniper ? 'sniper' : 'pistol');
    gun.scale.setScalar(1.1);
    gun.position.set(0, 0, 0.16);
    weaponArm.add(mount, gun);

    if (isTesla) {
      const coilPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.65, 6), chassisMat);
      coilPole.position.set(0, 2.02, -0.05);
      const coilRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 5, 10), visorMat);
      coilRing.rotation.x = Math.PI / 2;
      coilRing.position.set(0, 2.25, -0.05);
      bodyGroup.add(coilPole, coilRing);
    }

    if (isSniper) {
      const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 1.16, 1.1),
        new THREE.Vector3(0, 1.16, 20),
      ]);
      laserLine = new THREE.Line(
        laserGeo,
        new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.78 })
      );
      laserLine.visible = false;
      bodyGroup.add(laserLine);
    }

    bodyGroup.add(treadL, treadR, hull, frontShield, head, visor, coreWeakPoint, weaponArm);
    root.add(createContactShadow(textures, 1.15));
  }

  return {
    root,
    bodyGroup,
    weaponArm,
    coreWeakPoint,
    laserLine,
    wingGroup,
    setHitFlash: (active: boolean, colorHex = 0xffffff) => {
      for (const m of flashables) {
        m.emissive.setHex(active ? colorHex : 0x000000);
        m.emissiveIntensity = active ? 0.9 : 0;
      }
    },
    setPoisonTint: (active: boolean) => {
      for (const m of flashables) {
        if (active && m.emissiveIntensity < 0.5) {
          m.emissive.setHex(0x16a34a);
          m.emissiveIntensity = 0.32;
        } else if (!active && m.emissive.getHex() === 0x16a34a) {
          m.emissive.setHex(0x000000);
          m.emissiveIntensity = 0;
        }
      }
    },
  };
}

export function createPickupPropMesh(kind: PickupKind): THREE.Group {
  const g = new THREE.Group();
  if (kind === 'potion') {
    const glassMat = makeMat({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 1.0, roughness: 0.2 });
    const corkMat = makeMat({ color: 0x92400e, roughness: 0.85 });
    const flask = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), glassMat);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.18, 6), glassMat);
    neck.position.y = 0.24;
    const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 6), corkMat);
    cork.position.y = 0.35;
    g.add(flask, neck, cork);
  } else {
    const colorMap: Record<'boost_speed' | 'boost_rage' | 'boost_shield', number> = {
      boost_speed: 0x38bdf8,
      boost_rage: 0xf97316,
      boost_shield: 0xa855f7,
    };
    const c = colorMap[kind as 'boost_speed' | 'boost_rage' | 'boost_shield'];
    const crystalMat = makeMat({ color: c, emissive: c, emissiveIntensity: 1.1, roughness: 0.2 });
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), crystalMat);
    crystal.scale.set(0.85, 1.35, 0.85);
    g.add(crystal);
  }
  return g;
}

export function createPedestalMesh(reward: PedestalRewardItem): {
  root: THREE.Group;
  displayGroup: THREE.Group;
  ring: THREE.Mesh;
} {
  const root = new THREE.Group();
  const stoneMat = makeMat({ color: 0x334155, roughness: 0.82, metalness: 0.18 });
  const accentHex =
    reward.kind === 'weapon'
      ? 0xf59e0b
      : reward.kind === 'wearable'
      ? WEARABLES[reward.wearableId].accentInt
      : 0x38bdf8;
  const glowMat = makeMat({ color: accentHex, emissive: accentHex, emissiveIntensity: 1.25, roughness: 0.25 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.92, 0.35, 8), stoneMat);
  base.position.y = 0.175;
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.65, 8), stoneMat);
  pillar.position.y = 0.66;
  const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.54, 0.14, 8), glowMat);
  topCap.position.y = 1.04;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.95, 1.2, 16),
    new THREE.MeshBasicMaterial({ color: accentHex, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;

  const displayGroup = new THREE.Group();
  displayGroup.position.y = 1.58;
  if (reward.kind === 'weapon') {
    const w = createWeaponMesh(reward.weaponId);
    w.scale.setScalar(0.85);
    w.position.set(0, 0, -0.32);
    displayGroup.add(w);
  } else if (reward.kind === 'wearable') {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.26), glowMat);
    const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.32), stoneMat);
    pauldronL.position.set(-0.34, 0.2, 0);
    const pauldronR = pauldronL.clone();
    pauldronR.position.x = 0.34;
    displayGroup.add(plate, pauldronL, pauldronR);
  } else {
    const tome = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.16), glowMat);
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.64, 0.19), stoneMat);
    spine.position.x = -0.22;
    displayGroup.add(tome, spine);
  }

  root.add(base, pillar, topCap, ring, displayGroup);
  return { root, displayGroup, ring };
}

export function createChestMesh(): {
  root: THREE.Group;
  lidGroup: THREE.Group;
} {
  const root = new THREE.Group();
  const woodMat = makeMat({ color: 0x78350f, roughness: 0.82 });
  const ironMat = makeMat({ color: 0x94a3b8, roughness: 0.35, metalness: 0.78 });
  const rubyMat = makeMat({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 1.4, roughness: 0.2 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.56, 0.76), woodMat);
  body.position.y = 0.28;
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.8), ironMat);
  trim.position.y = 0.52;
  const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.1), rubyMat);
  clasp.position.set(0, 0.52, 0.42);

  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.56, -0.38);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.24, 0.78), woodMat);
  lid.position.set(0, 0.12, 0.38);
  const lidBand = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.82), ironMat);
  lidBand.position.set(0, 0.12, 0.38);
  lidGroup.add(lid, lidBand);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.12, 16),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;

  root.add(body, trim, clasp, lidGroup, ring);
  return { root, lidGroup };
}

export function createShrineMesh(nodeId: UpgradeNodeId): {
  root: THREE.Group;
  crystal: THREE.Mesh;
} {
  const root = new THREE.Group();
  const spec = UPGRADE_TREE[nodeId];
  const colorInt = Number.parseInt(spec.accentHex.replace('#', ''), 16) || 0x38bdf8;
  const stoneMat = makeMat({ color: 0x1e293b, roughness: 0.85, metalness: 0.2 });
  const glowMat = makeMat({ color: colorInt, emissive: colorInt, emissiveIntensity: 1.45, roughness: 0.2 });

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), stoneMat);
  plinth.position.y = 0.2;
  const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 1.65, 6), stoneMat);
  obelisk.position.y = 1.2;
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), glowMat);
  crystal.position.y = 2.45;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.15, 16),
    new THREE.MeshBasicMaterial({ color: colorInt, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  root.add(plinth, obelisk, crystal, ring);
  return { root, crystal };
}

export function createNextWaveRuneMesh(): THREE.Group {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(
    new THREE.RingGeometry(1.3, 1.65, 8),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })
  );
  outer.rotation.x = -Math.PI / 2;
  outer.position.y = 0.05;
  const inner = new THREE.Mesh(
    new THREE.CircleGeometry(1.25, 8),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })
  );
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.04;
  const beacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.32, 0),
    makeMat({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 1.5, roughness: 0.2 })
  );
  beacon.position.y = 1.15;
  g.add(outer, inner, beacon);
  return g;
}

export function createAcidPoolMesh(radius = 1.85, colorHex = 0x84cc16): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 12);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.56,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.03;
  return mesh;
}

export function createSnareTrapMesh(): THREE.Group {
  const group = new THREE.Group();
  const ironMat = makeMat({ color: 0x334155, roughness: 0.4, metalness: 0.78 });
  const glowMat = makeMat({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 1.4, roughness: 0.2 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.08, 8), ironMat);
  base.position.y = 0.04;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.82, 16), glowMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.025;
  const jawL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.1), ironMat);
  jawL.position.set(0, 0.12, -0.25);
  const jawR = jawL.clone();
  jawR.position.z = 0.25;
  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), glowMat);
  beacon.position.y = 0.18;
  group.add(base, ring, jawL, jawR, beacon);
  return group;
}

export interface ArenaEnvironment {
  group: THREE.Group;
  brazierLights: THREE.PointLight[];
  brazierFlames: THREE.Mesh[];
  portalCore?: THREE.Mesh;
  portalPad?: THREE.Mesh;
  portalRing?: THREE.Mesh;
  lavaPlane?: THREE.Mesh;
}

export function createMapArena(
  mapId: MapId,
  textures: ProceduralTextures,
  isSoftwareGl: boolean
): ArenaEnvironment {
  const spec = MAPS[mapId];
  const group = new THREE.Group();
  const brazierLights: THREE.PointLight[] = [];
  const brazierFlames: THREE.Mesh[] = [];
  let portalCore: THREE.Mesh | undefined;
  let portalPad: THREE.Mesh | undefined;
  let portalRing: THREE.Mesh | undefined;
  let lavaPlane: THREE.Mesh | undefined;

  const isLavaSea = mapId === 3 || mapId === 4 || mapId === 5;
  const groundMat = new THREE.MeshStandardMaterial({
    map: textures.groundColor,
    bumpMap: textures.groundBump,
    bumpScale: 0.15,
    color: spec.groundTint,
    roughness: 0.92,
    metalness: 0.04,
    envMapIntensity: 0.14,
    flatShading: true,
  });

  if (isLavaSea) {
    // Island arena surrounded by glowing molten sea (orange for Map 3, green for Map 4, crimson for Map 5!)
    const islandGeo = new THREE.CylinderGeometry(22.8, 24.4, 2.2, 24);
    const island = new THREE.Mesh(islandGeo, groundMat);
    island.position.y = -1.1;
    island.receiveShadow = true;
    group.add(island);

    const lavaColor = mapId === 4 ? 0x16a34a : mapId === 5 ? 0xdc2626 : 0xf97316;
    const lavaEmissive = mapId === 4 ? 0x22c55e : mapId === 5 ? 0x991b1b : 0xea580c;
    const lavaGeo = new THREE.PlaneGeometry(140, 140);
    lavaGeo.rotateX(-Math.PI / 2);
    const lavaMat = new THREE.MeshStandardMaterial({
      color: lavaColor,
      emissive: lavaEmissive,
      emissiveIntensity: mapId === 4 ? 0.72 : 1.05,
      roughness: 0.35,
      metalness: 0.1,
    });
    lavaPlane = new THREE.Mesh(lavaGeo, lavaMat);
    lavaPlane.position.y = -0.65;
    group.add(lavaPlane);
  } else {
    const groundGeo = new THREE.PlaneGeometry(130, 130, 28, 28);
    groundGeo.rotateX(-Math.PI / 2);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      if (r > 23.5) {
        const hill = Math.sin(x * 0.18) * Math.cos(z * 0.18) * 1.1 + (r - 23.5) * 0.08;
        pos.setY(i, hill);
      }
    }
    groundGeo.computeVertexNormals();
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    group.add(ground);
  }

  const stoneColorHex = mapId === 1 ? 0xffffff : mapId === 2 ? 0x8a5b52 : mapId === 4 ? 0x4b7061 : 0x5c3737;
  const stoneMat = makeMat({
    map: textures.stoneColor,
    color: stoneColorHex,
    roughness: 0.88,
    metalness: 0.06,
    envMapIntensity: 0.18,
  });

  // Perimeter stone border markers
  const markerCount = 28;
  const markerGeo = new THREE.BoxGeometry(1.4, 0.22, 0.75);
  const markers = new THREE.InstancedMesh(markerGeo, stoneMat, markerCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < markerCount; i++) {
    const a = (i / markerCount) * Math.PI * 2;
    dummy.position.set(Math.sin(a) * 21.8, 0.08, Math.cos(a) * 21.8);
    dummy.rotation.set(0, a, 0);
    dummy.scale.set(0.9 + (i % 3) * 0.1, 1, 1);
    dummy.updateMatrix();
    markers.setMatrixAt(i, dummy.matrix);
  }
  markers.instanceMatrix.needsUpdate = true;
  markers.computeBoundingSphere();
  markers.receiveShadow = true;
  group.add(markers);

  // Map-specific Backdrop & Landmarks!
  if (mapId === 1) {
    // Map 1: Nocturnal clearing + Pine trees + Opening Summoning Portal at north rim!
    const treeCount = 60;
    const trunkGeo = new THREE.CylinderGeometry(0.28, 0.44, 2.8, 6);
    trunkGeo.translate(0, 1.4, 0);
    const trunkMat = makeMat({ map: textures.barkColor, color: 0xffffff, roughness: 0.95, envMapIntensity: 0.12 });
    const foliageGeo = new THREE.ConeGeometry(2.1, 5.2, 6);
    foliageGeo.translate(0, 4.4, 0);
    const foliageMat = makeMat({ color: 0xffffff, roughness: 0.9, envMapIntensity: 0.14 });
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
    const canopies = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);
    const col = new THREE.Color();
    for (let i = 0; i < treeCount; i++) {
      const ring = i < 32 ? 25.5 : 33.0;
      let angle = (i / (i < 32 ? 32 : 28)) * Math.PI * 2 + (i % 5) * 0.11;
      if (Math.abs(Math.sin(angle)) < 0.28 && Math.cos(angle) < -0.5) {
        angle += Math.sin(angle) >= 0 ? 0.42 : -0.42; // Keep north portal sightline clear
      }
      const rad = ring + ((i * 7) % 5) * 1.2;
      const s = 0.85 + ((i * 13) % 10) * 0.032;
      dummy.position.set(Math.sin(angle) * rad, 0, Math.cos(angle) * rad);
      dummy.rotation.set(0, angle * 1.7, 0);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);
      canopies.setMatrixAt(i, dummy.matrix);
      col.setHSL(0.45 + (i % 4) * 0.03, 0.36, 0.12 + (i % 3) * 0.03);
      canopies.setColorAt(i, col);
    }
    trunks.instanceMatrix.needsUpdate = true;
    canopies.instanceMatrix.needsUpdate = true;
    if (canopies.instanceColor) canopies.instanceColor.needsUpdate = true;
    group.add(trunks, canopies);

    // North Summoning Portal Archway
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, -22.2);
    const pColL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.2, 1.4), stoneMat);
    pColL.position.set(-2.6, 3.1, 0);
    const pColR = pColL.clone();
    pColR.position.x = 2.6;
    const pArch = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.3, 1.6), stoneMat);
    pArch.position.set(0, 6.4, 0);
    portalCore = new THREE.Mesh(
      new THREE.CircleGeometry(2.3, 12),
      new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    portalCore.position.set(0, 3.1, 0);
    portalGroup.add(pColL, pColR, pArch, portalCore);
    group.add(portalGroup);

    const moon = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 12),
      new THREE.MeshBasicMaterial({ color: 0xcbe3ff, fog: false })
    );
    moon.position.set(-22, 34, -44);
    moon.lookAt(0, 0, 0);
    group.add(moon);
  } else if (mapId === 2) {
    // Map 2: Gates of Hell — Giant horned obsidian gate + iron spike perimeter!
    const gateMat = makeMat({ color: 0x1c1416, roughness: 0.6, metalness: 0.45 });
    const emberMat = makeMat({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.5 });
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, -22.2);
    const gL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 8.2, 2.0), gateMat);
    gL.position.set(-3.4, 4.1, 0);
    const gR = gL.clone();
    gR.position.x = 3.4;
    const gTop = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.6, 2.2), gateMat);
    gTop.position.set(0, 8.2, 0);
    portalCore = new THREE.Mesh(
      new THREE.PlaneGeometry(5.0, 7.2),
      new THREE.MeshBasicMaterial({ color: 0xea580c, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    portalCore.position.set(0, 3.6, 0);
    for (const sx of [-4.0, -2.0, 0, 2.0, 4.0]) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.8, 4), emberMat);
      spike.position.set(sx, 9.8, 0);
      gateGroup.add(spike);
    }
    gateGroup.add(gL, gR, gTop, portalCore);
    group.add(gateGroup);
  } else if (mapId === 3 || mapId === 4) {
    // Maps 3 & 4: North Obsidian / Emerald Portal Monolith (energizes after boss kill!)
    const isEmerald = mapId === 4;
    const portalHex = isEmerald ? 0x22c55e : 0xff6b00;
    const monMat = makeMat({ color: isEmerald ? 0x0f2e22 : 0x291a16, roughness: 0.55, metalness: 0.45 });
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -22.2);
    const mL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.8, 1.6), monMat);
    mL.position.set(-2.9, 3.4, 0);
    const mR = mL.clone();
    mR.position.x = 2.9;
    const mTop = new THREE.Mesh(new THREE.BoxGeometry(7.8, 1.2, 1.8), monMat);
    mTop.position.set(0, 6.9, 0);
    portalCore = new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 12),
      new THREE.MeshBasicMaterial({ color: portalHex, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    );
    portalCore.position.set(0, 3.3, 0);
    archGroup.add(mL, mR, mTop, portalCore);
    group.add(archGroup);
  } else if (mapId === 5) {
    // Map 5: Satan's Throne Room — Ritual Crimson Pentagram Ring + Towering Throne!
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pentRing = new THREE.Mesh(new THREE.RingGeometry(11.5, 12.2, 24), ringMat);
    pentRing.rotation.x = -Math.PI / 2;
    pentRing.position.y = 0.03;
    const innerRing = new THREE.Mesh(new THREE.RingGeometry(5.5, 5.9, 5), ringMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.03;
    group.add(pentRing, innerRing);

    const throneMat = makeMat({ color: 0x18181b, roughness: 0.5, metalness: 0.6 });
    const throne = new THREE.Group();
    throne.position.set(0, 0, -21.0);
    const dais = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.1, 4.0), stoneMat);
    dais.position.y = 0.55;
    const back = new THREE.Mesh(new THREE.BoxGeometry(3.4, 6.8, 0.9), throneMat);
    back.position.set(0, 4.2, -1.0);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 2.0), throneMat);
    seat.position.set(0, 1.6, 0);
    throne.add(dais, back, seat);
    group.add(throne);
  }

  if (mapId <= 4) {
    // Walkable Portal Pad at North Edge (z = -18.6)
    const padColor = spec.accentHex;
    portalPad = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 16),
      new THREE.MeshBasicMaterial({ color: padColor, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false })
    );
    portalPad.rotation.x = -Math.PI / 2;
    portalPad.position.set(0, 0.04, -18.6);
    portalRing = new THREE.Mesh(
      new THREE.RingGeometry(2.15, 2.5, 16),
      new THREE.MeshBasicMaterial({ color: padColor, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })
    );
    portalRing.rotation.x = -Math.PI / 2;
    portalRing.position.set(0, 0.045, -18.6);
    group.add(portalPad, portalRing);
  }

  // Obelisks / Obsidian Spires around perimeter
  const obeliskAngles = [0.55, 1.9, 3.55, 5.0];
  for (const a of obeliskAngles) {
    const obGroup = new THREE.Group();
    obGroup.position.set(Math.sin(a) * 23.0, 0, Math.cos(a) * 23.0);
    obGroup.rotation.y = -a;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.7, 2.1), stoneMat);
    plinth.position.y = 0.35;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 4.2, 5), stoneMat);
    pillar.position.y = 2.8;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.64, 1.2, 5), stoneMat);
    cap.position.y = 5.5;
    pillar.castShadow = !isSoftwareGl;
    obGroup.add(plinth, pillar, cap);
    group.add(obGroup);
  }

  // Braziers with map-themed fire color!
  const ironMat = makeMat({ color: 0x293242, roughness: 0.42, metalness: 0.72 });
  const flameColor = mapId === 4 ? 0x4ade80 : mapId === 1 ? 0xffb74d : mapId === 5 ? 0xf43f5e : 0xff6b2b;
  const flameEmissive = mapId === 4 ? 0x16a34a : mapId === 5 ? 0xe11d48 : 0xff5500;
  const flameMat = makeMat({
    color: flameColor,
    emissive: flameEmissive,
    emissiveIntensity: mapId === 4 ? 1.7 : 2.2,
    roughness: 0.2,
  });

  const brazierAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
  for (let i = 0; i < brazierAngles.length; i++) {
    const a = brazierAngles[i];
    const bGroup = new THREE.Group();
    bGroup.position.set(Math.sin(a) * 16.5, 0, Math.cos(a) * 16.5);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.62, 0.5, 6), stoneMat);
    base.position.y = 0.25;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.5, 6), ironMat);
    post.position.y = 1.25;
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.24, 0.36, 6), ironMat);
    bowl.position.y = 2.15;
    const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), flameMat);
    flame.position.y = 2.5;
    brazierFlames.push(flame);

    const light = new THREE.PointLight(flameEmissive, mapId === 4 ? 4.8 : 6.5, 16, 1.6);
    light.position.set(0, 2.8, 0);
    bGroup.add(base, post, bowl, flame, light);
    brazierLights.push(light);
    group.add(bGroup);
  }

  return { group, brazierLights, brazierFlames, portalCore, portalPad, portalRing, lavaPlane };
}
