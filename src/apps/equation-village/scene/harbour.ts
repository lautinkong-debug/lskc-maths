import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { HarbourSceneProps } from "../HarbourScene";

// Original, procedurally modelled art. No external assets or network requests.
const colour = {
  sky: 0xe1f2f1,
  water: 0x68c7c6,
  waterDeep: 0x42aaa9,
  sand: 0xe7c994,
  rock: 0xc7b59c,
  grass: 0x98bd79,
  leaf: 0x629b63,
  leafLight: 0x85b87c,
  leafDark: 0x47816a,
  timber: 0xa47952,
  timberLight: 0xdbb484,
  cream: 0xfff3d9,
  white: 0xfffcf1,
  roof: 0xd78b67,
  navy: 0x214e66,
  teal: 0x2d8c90,
  brass: 0xe1b858,
  amber: 0xf4c65e,
  coral: 0xc96358,
};

type Token = {
  group: THREE.Group;
  label: string;
  slot: THREE.Vector3;
  from: THREE.Vector3;
  leaving: boolean;
};

function fractionalLabel(value: number) {
  if (Number.isInteger(value)) return String(value);
  for (let d = 2; d <= 1000; d++) {
    const n = Math.round(value * d);
    if (Math.abs(n / d - value) < 1e-9) return `${n}/${d}`;
  }
  return `≈${Number(value.toPrecision(3))}`;
}

export function createHarbour(
  host: HTMLElement,
  initial: HarbourSceneProps,
  onFailure: () => void,
) {
  let state = initial;
  let dead = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let transition = 1;
  let bridgeOpen = initial.restored ? 1 : 0;
  let failed = false;
  let needsRender = true;
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = !initial.lowQuality;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(colour.sky);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colour.sky);
  const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 100);
  camera.position.set(9, 13, 18);
  camera.lookAt(0.3, 1.2, 0.2);

  const hemisphere = new THREE.HemisphereLight(0xe6f6ff, 0xc8bd8e, 2.1);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight(0xffedcf, 3.1);
  sun.position.set(-7, 15, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.00015;
  sun.shadow.radius = 3;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc3e9ed, 0.65);
  fill.position.set(8, 6, -10);
  scene.add(fill);

  function mat(hex: number, extra: THREE.MeshStandardMaterialParameters = {}) {
    const m = new THREE.MeshStandardMaterial({
      color: hex,
      roughness: 0.83,
      metalness: 0,
      ...extra,
    });
    materials.add(m);
    return m;
  }
  const palette = Object.fromEntries(
    Object.entries(colour).map(([key, value]) => [key, mat(value)]),
  ) as Record<keyof typeof colour, THREE.MeshStandardMaterial>;
  const brass = mat(colour.brass, { metalness: 0.36, roughness: 0.36 });
  const dark = mat(0x273f44);
  const glowing = mat(0xffd783, {
    emissive: 0xf9be4e,
    emissiveIntensity: 0.25,
  });

  function mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
  ) {
    geometries.add(geometry);
    const result = new THREE.Mesh(geometry, material);
    result.position.set(x, y, z);
    result.castShadow = true;
    result.receiveShadow = true;
    parent.add(result);
    return result;
  }
  function box(
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    radius = 0.07,
  ) {
    return mesh(
      new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 3, h / 3, d / 3)),
      material,
      parent,
      x,
      y,
      z,
    );
  }
  function ball(
    parent: THREE.Object3D,
    r: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    scale: [number, number, number] = [1, 1, 1],
  ) {
    const m = mesh(
      new THREE.SphereGeometry(r, 16, 12),
      material,
      parent,
      x,
      y,
      z,
    );
    m.scale.set(...scale);
    return m;
  }
  function cylinder(
    parent: THREE.Object3D,
    top: number,
    bottom: number,
    height: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    segments = 16,
  ) {
    return mesh(
      new THREE.CylinderGeometry(top, bottom, height, segments),
      material,
      parent,
      x,
      y,
      z,
    );
  }
  function beam(
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    material: THREE.Material,
  ) {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const m = cylinder(
      parent,
      radius,
      radius,
      a.distanceTo(b),
      mid.x,
      mid.y,
      mid.z,
      material,
      8,
    );
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    );
    return m;
  }
  function ring(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    r: number,
    material: THREE.Material,
  ) {
    return mesh(
      new THREE.TorusGeometry(r, 0.035, 7, 24),
      material,
      parent,
      x,
      y,
      z,
    );
  }

  // Two grassy banks sit above a calm harbour channel.
  box(scene, 34, 0.12, 30, 0, -0.55, -2, palette.water, 0.03);
  for (const x of [-4.25, 4.25]) {
    box(scene, 5.95, 0.7, 9.2, x, -0.16, -1.05, palette.rock, 0.44);
    box(scene, 6.12, 0.25, 9.4, x, 0.24, -1.05, palette.sand, 0.4);
    box(scene, 5.8, 0.2, 9.05, x, 0.42, -1.05, palette.grass, 0.38);
  }
  const ripples: THREE.Mesh[] = [];
  const rippleMat = mat(0xc3f1e9, {
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
  });
  for (let i = 0; i < 26; i++) {
    const x = i < 12 ? ((i % 3) - 1) * 0.63 : ((i % 7) - 3) * 2.6;
    const z =
      i < 12 ? -5 + Math.floor(i / 3) * 2 : -8.4 - Math.floor(i / 7) * 1.3;
    const m = box(
      scene,
      0.36 + (i % 3) * 0.22,
      0.008,
      0.06,
      x,
      -0.48,
      z,
      rippleMat,
      0.02,
    );
    m.castShadow = false;
    ripples.push(m);
  }
  // Sandstone stepping paths and scattered tuft patterns give the grass texture.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      const stone = box(
        scene,
        0.68,
        0.065,
        0.62,
        side * (1.65 + i * 0.5),
        0.55,
        -0.1 + Math.sin(i) * 0.08,
        palette.cream,
        0.16,
      );
      stone.rotation.y = Math.sin(i * 2) * 0.13;
    }
    for (let i = 0; i < 28; i++) {
      const x = side * (1.65 + ((i * 17) % 46) / 10);
      const z = -4.7 + ((i * 31) % 78) / 10;
      const tuft = mesh(
        new THREE.ConeGeometry(0.07, 0.14, 3),
        i % 3 ? palette.leafLight : palette.leaf,
        scene,
        x,
        0.59,
        z,
      );
      tuft.rotation.z = 0.15;
      tuft.castShadow = false;
    }
  }

  const treeCrowns: THREE.Group[] = [];
  function tree(x: number, z: number, scale: number, alternate = false) {
    const group = new THREE.Group();
    group.position.set(x, 0.52, z);
    group.scale.setScalar(scale);
    scene.add(group);
    cylinder(group, 0.13, 0.22, 1.45, 0, 0.73, 0, palette.timber);
    const crown = new THREE.Group();
    crown.position.y = 1.1;
    group.add(crown);
    ball(
      crown,
      0.69,
      -0.25,
      0.55,
      0.06,
      alternate ? palette.leafDark : palette.leaf,
      [1, 1.12, 1],
    );
    ball(
      crown,
      0.72,
      0.26,
      0.69,
      -0.08,
      alternate ? palette.leaf : palette.leafLight,
      [1, 1.1, 0.95],
    );
    ball(crown, 0.57, 0, 1.13, 0, palette.leafLight);
    for (let i = 0; i < 3; i++)
      ball(
        crown,
        0.09,
        Math.sin(i * 2.5) * 0.45,
        0.7 + i * 0.18,
        0.5,
        palette.amber,
      );
    treeCrowns.push(crown);
  }
  tree(-6.15, -4.2, 1.03);
  tree(-6.3, -0.9, 0.8, true);
  tree(-5.9, 2.1, 0.73);
  tree(6.1, -2.4, 1.0, true);
  tree(6.35, 0.5, 0.88);
  tree(3.0, -4.8, 0.7);

  function flowerBox(x: number, z: number) {
    box(scene, 1.1, 0.28, 0.42, x, 0.67, z, palette.timber, 0.06);
    for (let i = 0; i < 5; i++) {
      const fx = x - 0.42 + i * 0.21;
      cylinder(scene, 0.018, 0.018, 0.32, fx, 0.92, z, palette.leafDark, 5);
      ball(
        scene,
        0.1,
        fx,
        1.08,
        z,
        i % 2 ? palette.white : palette.amber,
        [1, 0.65, 1],
      );
    }
  }
  flowerBox(-4.55, -0.9);
  flowerBox(5.2, 1.75);

  // Workshop: pitched shingle roof, real eaves, porthole, awning and a gear sign.
  const house = new THREE.Group();
  house.position.set(-4.15, 0.53, -2.6);
  scene.add(house);
  box(house, 2.5, 1.9, 2.3, 0, 0.95, 0, palette.cream, 0.13);
  box(house, 2.65, 0.22, 2.46, 0, 0.15, 0, palette.timber, 0.04);
  for (const x of [-1.14, 1.14])
    box(house, 0.14, 1.8, 0.14, x, 1.03, 1.14, palette.timber, 0.035);
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-1.5, 0);
  roofShape.lineTo(0, 1.03);
  roofShape.lineTo(1.5, 0);
  roofShape.closePath();
  const roof = mesh(
    new THREE.ExtrudeGeometry(roofShape, {
      depth: 2.72,
      bevelEnabled: true,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      bevelSegments: 2,
      steps: 1,
    }),
    palette.roof,
    house,
    0,
    1.85,
    -1.36,
  );
  roof.receiveShadow = true;
  for (const side of [-1, 1]) {
    for (let row = 0; row < 4; row++) {
      const shingle = box(
        house,
        0.48,
        0.07,
        2.8,
        side * (0.22 + row * 0.35),
        2.85 - row * 0.24,
        0,
        palette.roof,
        0.02,
      );
      shingle.rotation.z = side * -0.6;
    }
  }
  box(house, 0.67, 1.35, 0.1, -0.48, 0.82, 1.2, palette.teal, 0.12);
  ball(house, 0.055, -0.22, 0.78, 1.27, brass);
  const porthole = cylinder(
    house,
    0.34,
    0.34,
    0.12,
    0.65,
    1.12,
    1.2,
    palette.navy,
    32,
  );
  porthole.rotation.x = Math.PI / 2;
  ring(house, 0.65, 1.12, 1.28, 0.36, palette.white);
  box(house, 0.035, 0.62, 0.05, 0.65, 1.12, 1.31, palette.cream, 0.005);
  box(house, 0.62, 0.035, 0.05, 0.65, 1.12, 1.31, palette.cream, 0.005);
  for (let i = 0; i < 6; i++) {
    const awning = box(
      house,
      0.31,
      0.09,
      0.62,
      -0.85 + i * 0.31,
      1.9,
      1.42,
      i % 2 ? palette.white : palette.teal,
      0.03,
    );
    awning.rotation.x = 0.18;
  }
  cylinder(house, 0.34, 0.34, 0.18, 1.36, 1.78, 1.52, brass, 12).rotation.x =
    Math.PI / 2;
  cylinder(
    house,
    0.16,
    0.16,
    0.2,
    1.36,
    1.78,
    1.64,
    palette.teal,
    12,
  ).rotation.x = Math.PI / 2;
  box(house, 0.42, 0.75, 0.48, -0.65, 2.72, -0.7, palette.cream, 0.07);
  box(house, 0.54, 0.13, 0.6, -0.65, 3.1, -0.7, palette.timber, 0.04);

  // Lighthouse and railing establish a destination beyond the repaired bridge.
  const lighthouse = new THREE.Group();
  lighthouse.position.set(4.55, 0.52, -3.65);
  scene.add(lighthouse);
  cylinder(lighthouse, 0.64, 0.86, 0.26, 0, 0.13, 0, palette.sand);
  cylinder(lighthouse, 0.45, 0.65, 2.48, 0, 1.48, 0, palette.cream, 24);
  cylinder(lighthouse, 0.53, 0.56, 0.38, 0, 1.42, 0, palette.teal, 24);
  cylinder(lighthouse, 0.63, 0.63, 0.14, 0, 2.74, 0, palette.navy, 24);
  cylinder(lighthouse, 0.44, 0.44, 0.64, 0, 3.1, 0, glowing, 16);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    cylinder(
      lighthouse,
      0.035,
      0.035,
      0.67,
      Math.cos(a) * 0.45,
      3.1,
      Math.sin(a) * 0.45,
      palette.navy,
      6,
    );
  }
  cylinder(lighthouse, 0, 0.72, 0.56, 0, 3.7, 0, palette.teal, 24);
  ball(lighthouse, 0.1, 0, 4.03, 0, brass);
  box(lighthouse, 0.38, 0.8, 0.11, 0, 0.75, 0.59, palette.navy, 0.12);
  for (let i = 0; i < 6; i++) {
    const a = (i / 5) * Math.PI * 1.2;
    cylinder(
      lighthouse,
      0.038,
      0.038,
      0.52,
      Math.cos(a) * 0.69,
      2.95,
      Math.sin(a) * 0.69,
      palette.white,
      6,
    );
  }
  const lightRing = ring(lighthouse, 0, 2.85, 0, 0.69, palette.white);
  lightRing.rotation.x = Math.PI / 2;

  // Original little kingfisher mechanic, with a cap and tool belt.
  const bird = new THREE.Group();
  bird.position.set(-2.45, 0.58, 1.9);
  bird.rotation.y = 0.48;
  bird.scale.setScalar(1.32);
  scene.add(bird);
  const body = new THREE.Group();
  bird.add(body);
  ball(body, 0.37, 0, 0.49, 0, palette.teal, [0.9, 1.14, 0.85]);
  ball(body, 0.29, 0, 0.47, 0.16, palette.cream, [0.86, 0.95, 0.5]);
  ball(body, 0.33, 0, 0.95, 0.025, palette.teal, [1.08, 0.96, 1]);
  ball(body, 0.24, 0, 0.91, 0.2, palette.cream, [1, 0.64, 0.6]);
  const eyes: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    eyes.push(
      ball(body, 0.055, side * 0.13, 1.01, 0.37, dark, [0.8, 1.1, 0.5]),
    );
    ball(body, 0.016, side * 0.13 - 0.01, 1.025, 0.395, palette.white);
    const foot = ball(
      bird,
      0.11,
      side * 0.15,
      0.075,
      0.12,
      palette.amber,
      [0.9, 0.6, 1.6],
    );
    foot.rotation.y = side * 0.2;
  }
  const beak = cylinder(body, 0, 0.105, 0.32, 0, 0.89, 0.4, palette.amber, 6);
  beak.rotation.x = Math.PI / 2;
  const wingLeft = ball(
    body,
    0.23,
    -0.34,
    0.54,
    -0.01,
    palette.leafDark,
    [0.38, 1.15, 0.7],
  );
  const wingRight = ball(
    body,
    0.23,
    0.34,
    0.54,
    -0.01,
    palette.leafDark,
    [0.38, 1.15, 0.7],
  );
  cylinder(body, 0.25, 0.32, 0.13, 0, 1.22, 0, palette.navy, 24);
  box(body, 0.4, 0.055, 0.28, 0, 1.19, 0.25, palette.navy, 0.04);
  box(body, 0.53, 0.1, 0.53, 0, 0.38, 0.02, palette.timber, 0.1);
  box(body, 0.11, 0.27, 0.08, 0.3, 0.35, 0.14, brass, 0.025);
  const birdBaseY = bird.position.y;

  // Two drawbridge leaves open upwards until the original equation is checked.
  const bridgeLeaves: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 1.48, 0.63, -0.12);
    scene.add(pivot);
    for (let i = 0; i < 6; i++)
      box(
        pivot,
        0.23,
        0.14,
        1.7,
        -side * (0.12 + i * 0.245),
        0,
        0,
        i % 2 ? palette.timber : palette.timberLight,
        0.04,
      );
    for (const z of [-0.83, 0.83]) {
      box(pivot, 1.5, 0.14, 0.12, -side * 0.74, -0.11, z, palette.timber, 0.03);
      for (const x of [-side * 0.1, -side * 1.35])
        cylinder(pivot, 0.06, 0.07, 0.62, x, 0.34, z, palette.timber, 8);
      beam(
        pivot,
        new THREE.Vector3(-side * 0.1, 0.6, z),
        new THREE.Vector3(-side * 1.35, 0.6, z),
        0.028,
        palette.cream,
      );
    }
    pivot.rotation.z = -side * 0.92;
    bridgeLeaves.push(pivot);
    for (const z of [-1.0, 0.76]) {
      cylinder(
        scene,
        0.17,
        0.19,
        1.28,
        side * 1.62,
        0.8,
        z,
        palette.timber,
        12,
      );
      ball(scene, 0.19, side * 1.62, 1.46, z, brass, [1, 0.6, 1]);
    }
  }
  const bridgeLamps: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const post = cylinder(
      scene,
      0.07,
      0.09,
      1.6,
      side * 1.95,
      1.34,
      -1.1,
      palette.navy,
      10,
    );
    post.castShadow = true;
    const lamp = ball(scene, 0.2, side * 1.95, 2.14, -1.1, glowing);
    bridgeLamps.push(lamp);
    cylinder(scene, 0, 0.3, 0.23, side * 1.95, 2.4, -1.1, palette.navy, 12);
  }

  // Workshop dock: the equation is physically represented on paired trays.
  box(scene, 12.5, 0.22, 3.0, 0, 0.54, 4.12, palette.timber, 0.16);
  for (let i = 0; i < 25; i++)
    box(
      scene,
      0.46,
      0.06,
      2.91,
      -6 + i * 0.5,
      0.68,
      4.12,
      palette.timberLight,
      0.02,
    );
  for (const x of [-5.9, -3, 0, 3, 5.9])
    cylinder(scene, 0.11, 0.14, 1.3, x, 0.08, 5.35, palette.timber, 10);
  const trayGroups: THREE.Group[] = [];
  for (const x of [-2.9, 2.9]) {
    const tray = new THREE.Group();
    tray.position.set(x, 0.77, 4.15);
    scene.add(tray);
    box(tray, 4.95, 0.15, 2.1, 0, 0, 0, palette.navy, 0.16);
    box(tray, 4.72, 0.08, 1.9, 0, 0.12, 0, palette.cream, 0.12);
    for (const z of [-1, 1]) box(tray, 4.9, 0.13, 0.1, 0, 0.2, z, brass, 0.035);
    trayGroups.push(tray);
  }
  for (const y of [1.19, 1.41])
    box(scene, 0.55, 0.09, 0.11, 0, y, 4.2, palette.cream, 0.03);

  // Every token's numeric label is generated from its mathematical coefficient.
  const labelCache = new Map<string, THREE.SpriteMaterial>();
  function labelSprite(label: string, width: number) {
    let m = labelCache.get(label);
    if (!m) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.clearRect(0, 0, 256, 128);
      ctx.fillStyle = "#183c4d";
      ctx.font = `700 ${label.length > 5 ? 44 : 62}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 128, 65, 244);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.add(texture);
      m = new THREE.SpriteMaterial({
        map: texture,
        depthTest: true,
        transparent: true,
      });
      materials.add(m);
      labelCache.set(label, m);
    }
    const sprite = new THREE.Sprite(m);
    sprite.scale.set(width, width / 2, 1);
    return sprite;
  }
  function tokenMesh(label: string, unknown: boolean, negative: boolean) {
    const group = new THREE.Group();
    if (unknown) {
      cylinder(
        group,
        0.19,
        0.19,
        0.48,
        0,
        0.33,
        0,
        negative ? palette.coral : palette.teal,
        20,
      );
      ball(
        group,
        0.19,
        0,
        0.57,
        0,
        negative ? palette.coral : palette.teal,
        [1, 0.5, 1],
      );
      cylinder(group, 0.2, 0.2, 0.065, 0, 0.13, 0, brass, 20);
      cylinder(group, 0.2, 0.2, 0.065, 0, 0.53, 0, brass, 20);
      const badge = ball(
        group,
        0.17,
        0,
        0.36,
        0.17,
        palette.cream,
        [1, 1, 0.25],
      );
      badge.castShadow = false;
    } else {
      box(
        group,
        0.34,
        0.27,
        0.34,
        0,
        0.28,
        0,
        negative ? palette.coral : palette.amber,
        0.07,
      );
      box(group, 0.29, 0.04, 0.29, 0, 0.43, 0, palette.cream, 0.03);
    }
    const labelObject = labelSprite(label, label.length > 3 ? 0.68 : 0.44);
    labelObject.position.set(0, unknown ? 0.4 : 0.34, 0.24);
    group.add(labelObject);
    return group;
  }
  let tokens: Token[][] = [[], []];
  let departing: Token[] = [];
  let partitioning = false;
  const partitionLines = trayGroups.map((tray) => {
    const line = box(tray, 4.5, 0.025, 0.035, 0, 0.18, 0, palette.teal, 0.008);
    line.visible = false;
    return line;
  });
  function disposeGroup(group: THREE.Group) {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        geometries.delete(child.geometry);
      }
    });
    group.removeFromParent();
  }
  function labelsFor(coefficient: number, unknown: boolean) {
    if (Math.abs(coefficient) < 1e-10) return [];
    const abs = Math.abs(coefficient);
    const sign = coefficient < 0 ? "−" : "";
    if (Number.isInteger(abs) && abs <= 12)
      return Array.from({ length: abs }, () => `${sign}${unknown ? "x" : "1"}`);
    return [`${sign}${fractionalLabel(abs)}${unknown ? "x" : ""}`];
  }
  function updateTokens(next: HarbourSceneProps, animate: boolean) {
    for (const token of departing) disposeGroup(token.group);
    departing = [];
    const values = [
      [next.leftX, next.leftUnits],
      [next.rightX, next.rightUnits],
    ];
    const before = [
      state.leftX,
      state.leftUnits,
      state.rightX,
      state.rightUnits,
    ];
    const after = values.flat();
    partitioning =
      next.operation === "divide" &&
      before.some((value) => value !== 0) &&
      before.every(
        (value, i) =>
          Number.isInteger(value) &&
          value >= 0 &&
          value <= 12 &&
          Number.isInteger(after[i]) &&
          value === after[i] * 2,
      );
    tokens = values.map(([x, unit], side) => {
      const wanted = [
        ...labelsFor(x, true).map((label) => ({
          label,
          unknown: true,
          negative: x < 0,
        })),
        ...labelsFor(unit, false).map((label) => ({
          label,
          unknown: false,
          negative: unit < 0,
        })),
      ];
      const available = [...tokens[side]];
      const result = wanted.map((info, index) => {
        const reuseIndex = available.findIndex(
          (token) => token.label === info.label,
        );
        const old =
          reuseIndex >= 0 ? available.splice(reuseIndex, 1)[0] : undefined;
        const group =
          old?.group ?? tokenMesh(info.label, info.unknown, info.negative);
        const columns = Math.min(6, Math.max(1, wanted.length));
        const rows = Math.ceil(wanted.length / columns);
        const col = index % columns;
        const row = Math.floor(index / columns);
        const slot = new THREE.Vector3(
          (col - (columns - 1) / 2) * 0.66,
          0.14,
          (row - (rows - 1) / 2) * 0.67,
        );
        const from = old
          ? old.group.position.clone()
          : slot.clone().add(new THREE.Vector3(0, animate ? 1.0 : 0, 0));
        group.position.copy(animate ? from : slot);
        trayGroups[side].add(group);
        return { group, label: info.label, slot, from, leaving: false };
      });
      for (const [index, token] of available.entries()) {
        if (animate) {
          token.from.copy(token.group.position);
          if (partitioning && result[index])
            token.slot.copy(result[index].slot);
          token.leaving = true;
          departing.push(token);
        } else disposeGroup(token.group);
      }
      return result;
    });
    transition = animate ? 0 : 1;
    needsRender = true;
  }
  updateTokens(initial, false);

  // A small moored boat and harbour buoys complete the view without clutter.
  const boat = new THREE.Group();
  boat.position.set(0.25, -0.22, -3.4);
  boat.rotation.y = 0.1;
  scene.add(boat);
  ball(boat, 0.48, 0, 0.02, 0, palette.cream, [0.66, 0.3, 1.65]);
  box(boat, 0.48, 0.09, 0.9, 0, 0.08, 0, palette.timber, 0.12);
  box(boat, 0.54, 0.06, 0.12, 0, 0.15, 0, palette.timberLight, 0.03);
  const sail = new THREE.Shape();
  sail.moveTo(0, 0);
  sail.lineTo(0, 1.1);
  sail.lineTo(0.65, 0.1);
  sail.closePath();
  const sailMat = mat(colour.white, { side: THREE.DoubleSide });
  mesh(new THREE.ShapeGeometry(sail), sailMat, boat, -0.03, 0.22, 0);
  cylinder(boat, 0.025, 0.025, 1.35, -0.05, 0.66, 0, palette.timber, 6);

  // Animation is driven by semantic props, never used to determine an answer.
  function pose(dt: number) {
    const still = state.reducedMotion || state.paused;
    if (!still) elapsed += dt;
    transition = still
      ? 1
      : Math.min(1, transition + dt / (partitioning ? 1.5 : 0.65));
    const t = 1 - Math.pow(1 - transition, 3);
    const split = partitioning && transition < 1 && !still;
    const grouping = Math.min(1, transition / 0.48);
    const selecting = Math.max(0, (transition - 0.55) / 0.45);
    partitionLines.forEach((line) => {
      line.visible = split && transition < 0.8;
    });
    for (const side of tokens) {
      for (const token of side) {
        if (split) {
          const grouped = token.slot.clone().add(new THREE.Vector3(0, 0, 0.45));
          token.group.position.lerpVectors(token.from, grouped, grouping);
          token.group.position.lerp(token.slot, selecting);
        } else token.group.position.lerpVectors(token.from, token.slot, t);
      }
    }
    for (const token of departing) {
      if (split) {
        const grouped = token.slot.clone().add(new THREE.Vector3(0, 0, -0.45));
        token.group.position.lerpVectors(token.from, grouped, grouping);
        token.group.position.y += selecting * 0.7;
        token.group.scale.setScalar(Math.max(0.001, 1 - selecting));
      } else {
        token.group.position.copy(token.from);
        token.group.position.y += t * 0.85;
        token.group.scale.setScalar(Math.max(0.001, 1 - t));
      }
    }
    if (transition >= 1 && departing.length) {
      departing.forEach((token) => disposeGroup(token.group));
      departing = [];
    }
    const target = state.restored ? 1 : 0;
    bridgeOpen = still
      ? target
      : THREE.MathUtils.damp(bridgeOpen, target, 3.0, dt);
    bridgeLeaves.forEach((leaf, index) => {
      leaf.rotation.z = (index ? -1 : 1) * 0.92 * (1 - bridgeOpen);
    });
    glowing.emissiveIntensity = 0.15 + bridgeOpen * 0.8;
    const celebration =
      state.restored && !still
        ? Math.max(0, Math.sin(elapsed * 3.7)) * 0.05
        : 0;
    bird.position.y = birdBaseY + celebration;
    body.rotation.z = still ? 0 : Math.sin(elapsed * 1.4) * 0.025;
    body.scale.y = still ? 1 : 1 + Math.sin(elapsed * 2.0) * 0.012;
    wingLeft.rotation.z = state.restored
      ? 0.8 + (still ? 0 : Math.sin(elapsed * 4) * 0.12)
      : 0.1;
    wingRight.rotation.z = -wingLeft.rotation.z;
    const blink = !still && elapsed % 4.7 > 4.53;
    eyes.forEach((eye) => {
      eye.scale.y = blink ? 0.12 : 1.1;
    });
    treeCrowns.forEach((crown, i) => {
      crown.rotation.z = still ? 0 : Math.sin(elapsed * 0.8 + i) * 0.013;
    });
    ripples.forEach((ripple, i) => {
      ripple.scale.x = still ? 1 : 1 + Math.sin(elapsed * 1.1 + i) * 0.14;
    });
    boat.position.y = -0.22 + (still ? 0 : Math.sin(elapsed * 1.6) * 0.025);
    boat.rotation.z = still ? 0 : Math.sin(elapsed * 1.3) * 0.025;
  }
  let lastWidth = 0;
  let lastHeight = 0;
  function resize() {
    if (dead) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width;
    lastHeight = height;
    const aspect = width / height;
    // Widen the camera vertically for phones so both algebra trays stay visible.
    const halfWidth = Math.max(9.1, 6.1 * aspect);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfWidth / aspect;
    camera.bottom = -halfWidth / aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, state.lowQuality ? 1 : 1.5),
    );
    needsRender = true;
  }
  function failure() {
    if (failed || dead) return;
    failed = true;
    cancelAnimationFrame(frame);
    onFailure();
  }
  const onContextLost = (event: Event) => {
    event.preventDefault();
    failure();
  };
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  function animate(now: number) {
    if (dead || failed) return;
    const dt = Math.min(0.05, lastTime ? (now - lastTime) / 1000 : 0.016);
    lastTime = now;
    const moving = !state.paused && !state.reducedMotion && !document.hidden;
    if (moving || needsRender) {
      try {
        pose(dt);
        renderer.render(scene, camera);
        needsRender = false;
      } catch {
        failure();
        return;
      }
    }
    frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);

  return {
    setState(next: HarbourSceneProps) {
      if (dead) return;
      const revisionChanged =
        next.revision !== state.revision ||
        next.leftX !== state.leftX ||
        next.leftUnits !== state.leftUnits ||
        next.rightX !== state.rightX ||
        next.rightUnits !== state.rightUnits;
      if (next.lowQuality !== state.lowQuality) {
        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, next.lowQuality ? 1 : 1.5),
        );
        renderer.shadowMap.enabled = !next.lowQuality;
      }
      const animateChange = !next.reducedMotion && !next.paused;
      if (revisionChanged) updateTokens(next, animateChange);
      state = next;
      needsRender = true;
    },
    dispose() {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onContextLost,
      );
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      scene.clear();
    },
  };
}
