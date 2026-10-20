import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { SimulationResult } from '../../domain/models';
import type { PlaybackPhase } from '../../simulation/playback';
import {
  FUNNEL_INTERIOR_HEIGHT,
  funnelInteriorRadius,
  liquidRadius,
  mapLiquidVolumesToFunnel,
  splitDrainedVolume,
} from '../../simulation/visualization/funnelGeometry';
import laboratoryBackground from '../../assets/laboratory-background.png';

interface ThreeExtractionSceneProps {
  readonly result: SimulationResult;
  readonly stageNumber: number;
  readonly playbackPhase: PlaybackPhase;
  readonly reducedMotion: boolean;
  readonly speed?: number;
}

interface SceneInput {
  readonly aqueousVolumeL: number;
  readonly organicVolumeL: number;
  readonly capacityBasisL: number;
  readonly stageNumber: number;
  readonly stageCount: number;
  readonly phase: PlaybackPhase;
  readonly reducedMotion: boolean;
  readonly speed: number;
}

const profileSegments = 72;

/**
 * A single WebGL scene: vessel, liquids, receiver and lab backdrop share one
 * camera. It is a deterministic, volume-conserving visual model, not CFD.
 */
export function ThreeExtractionScene({
  result,
  stageNumber,
  playbackPhase,
  reducedMotion,
  speed = 1,
}: ThreeExtractionSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const updateScene = useRef<((input: SceneInput) => void) | null>(null);
  const sceneInput = useMemo<SceneInput>(() => {
    const stage = result.stages[stageNumber];
    const volumeInput = result.visualPlan.phaseVolumeInputs.find(
      (item) => item.stageNumber === stageNumber,
    );
    return {
      aqueousVolumeL: volumeInput?.raffinateVolumeL ?? result.inputCanonical.feedVolumeL,
      organicVolumeL: volumeInput?.extractVolumeL ?? stage?.solventVolumeL ?? 0,
      capacityBasisL: result.inputCanonical.feedVolumeL + result.inputCanonical.totalSolventVolumeL,
      stageNumber,
      stageCount: result.inputCanonical.stageCount,
      phase: playbackPhase,
      reducedMotion,
      speed,
    };
  }, [playbackPhase, reducedMotion, result, speed, stageNumber]);

  useEffect(() => {
    const element = host.current;
    if (element === null || !canRenderWebGL()) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      element.textContent =
        'Thiết bị không khởi tạo được WebGL. Xem thể tích và kết quả trong bảng bên dưới.';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    element.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#071a2b');
    const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 100);
    // Keep the funnel, stopcock and receiving beaker in one camera frame.
    camera.position.set(0, 2.25, 13.2);
    camera.lookAt(0, 1.15, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    scene.environment = environment;
    pmrem.dispose();

    const backdrop = createBackdrop(() => requestRender());
    scene.add(backdrop);
    scene.add(new THREE.HemisphereLight('#c7efff', '#061426', 1.8));
    const key = new THREE.DirectionalLight('#d8f6ff', 3.4);
    key.position.set(-3, 6, 5);
    scene.add(key);
    const rim = new THREE.PointLight('#87cfff', 12, 12, 2);
    rim.position.set(3.6, 3.7, 2);
    scene.add(rim);
    const warmFill = new THREE.PointLight('#ffc66b', 5, 9, 2);
    warmFill.position.set(-3, 1.6, 3);
    scene.add(warmFill);

    const apparatus = new THREE.Group();
    apparatus.position.y = -0.35;
    scene.add(apparatus);
    const liquidGroup = new THREE.Group();
    apparatus.add(liquidGroup);
    const glass = createGlass();
    apparatus.add(glass);
    const valve = createValve();
    apparatus.add(valve.group);
    const receiver = createReceiver();
    receiver.group.position.y -= 0.35;
    scene.add(receiver.group);
    const droplets = createMixingDroplets();
    apparatus.add(droplets);
    const stream = createDrainStream();
    apparatus.add(stream);

    let activeInput = sceneInput;
    const liquids = createLiquids(activeInput, 0);
    liquidGroup.add(liquids.group);
    receiver.setFill(0);
    droplets.visible = false;
    stream.visible = false;

    let frame = 0;
    let previousTime = performance.now();
    let phaseTime = 0;
    let displayedPhase = activeInput.phase;
    let drainFraction = 0;
    let lastDrainGeometryProgress = -1;
    let lastWidth = 0;
    let lastHeight = 0;
    const requestRender = () => {
      if (frame === 0) frame = window.requestAnimationFrame(render);
    };
    updateScene.current = (next) => {
      if (displayedPhase === 'DRAINING' && next.phase !== 'DRAINING' && next.phase !== 'PAUSED') {
        drainFraction = 1;
      }
      if (next.phase !== 'PAUSED' && next.phase !== displayedPhase) {
        displayedPhase = next.phase;
        phaseTime = 0;
      }
      if (next.stageNumber !== activeInput.stageNumber || next.phase === 'READY') drainFraction = 0;
      activeInput = next;
      previousTime = performance.now();
      requestRender();
    };
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width === 0 || height === 0 || (width === lastWidth && height === lastHeight)) return;
      lastWidth = width;
      lastHeight = height;
      camera.aspect = width / height;
      camera.position.z = Math.max(13.2, 8.6 / camera.aspect);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      requestRender();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    const render = (now: number) => {
      frame = 0;
      const paused = activeInput.phase === 'PAUSED';
      if (!paused) phaseTime += Math.max(0, (now - previousTime) / 1000) * activeInput.speed;
      previousTime = now;
      const elapsed = phaseTime;
      const motionEnabled = !activeInput.reducedMotion;
      if (displayedPhase === 'DRAINING')
        drainFraction = activeInput.reducedMotion ? 1 : smoothstep(elapsed / 0.7);
      const drainProgress = drainFraction;
      if (
        displayedPhase !== 'DRAINING' ||
        lastDrainGeometryProgress < 0 ||
        Math.abs(drainProgress - lastDrainGeometryProgress) >= 0.015 ||
        drainProgress === 1
      ) {
        const transfer = splitDrainedVolume(activeInput.aqueousVolumeL, drainProgress);
        const loading = displayedPhase === 'LOADING_FEED' ? smoothstep(elapsed / 0.7) : 1;
        const adding = displayedPhase === 'ADDING_SOLVENT' ? smoothstep(elapsed / 0.7) : 1;
        const organic = displayedPhase === 'LOADING_FEED' ? 0 : activeInput.organicVolumeL * adding;
        liquids.update(transfer.funnelLowerL * loading, organic);
        receiver.setFill(transfer.beakerL, activeInput.aqueousVolumeL);
        lastDrainGeometryProgress = drainProgress;
        element.dataset.funnelVolumeL = String(transfer.funnelLowerL + organic);
        element.dataset.receiverVolumeL = String(transfer.beakerL);
      }

      const isMixing = displayedPhase === 'MIXING' || displayedPhase === 'EQUILIBRATING';
      const isSeparating = displayedPhase === 'SEPARATING';
      droplets.visible =
        motionEnabled && activeInput.organicVolumeL > 0 && (isMixing || isSeparating);
      droplets.material.opacity = isMixing ? 0.75 : Math.max(0, 0.65 * (1 - elapsed / 1.2));
      if (droplets.visible) {
        const levels = mapLiquidVolumesToFunnel(
          activeInput.aqueousVolumeL,
          activeInput.organicVolumeL,
          activeInput.capacityBasisL,
        );
        const dummy = new THREE.Object3D();
        for (let index = 0; index < 32; index += 1) {
          const y = 0.65 + deterministic(index, 2) * Math.max(0, levels.totalTop - 0.75);
          const angle = deterministic(index, 5) * Math.PI * 2 + elapsed * 0.8;
          const radius = liquidRadius(y) * Math.sqrt(deterministic(index, 9)) * 0.72;
          dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
          dummy.scale.setScalar(isSeparating ? Math.max(0, 1 - elapsed / 0.7) : 0.8);
          dummy.updateMatrix();
          droplets.setMatrixAt(index, dummy.matrix);
        }
        droplets.instanceMatrix.needsUpdate = true;
      }
      if (!paused && motionEnabled && isMixing) {
        apparatus.rotation.z = Math.sin(elapsed * 8) * 0.075;
        liquidGroup.rotation.z = 0;
        droplets.rotation.y = elapsed * 1.9;
      } else if (!paused) {
        apparatus.rotation.z *= 0.86;
        liquidGroup.rotation.z *= 0.8;
      }
      const wave = motionEnabled && (isMixing || isSeparating) ? Math.sin(elapsed * 8) * 0.024 : 0;
      liquids.setSurfaceWave(isSeparating ? wave * Math.exp(-elapsed * 5) : wave);

      const activelyDraining =
        displayedPhase === 'DRAINING' && drainProgress > 0 && drainProgress < 0.995;
      stream.visible = activelyDraining;
      if (activelyDraining)
        stream.material.emissiveIntensity = 0.22 + Math.sin(elapsed * 18) * 0.08;
      stream.scale.x = stream.scale.z = Math.max(0.18, 1 - drainProgress * 0.75);
      valve.pivot.rotation.z = activelyDraining ? -Math.PI / 2 : 0;

      renderer.render(scene, camera);
      if (!paused && motionEnabled && isAnimatedPhase(activeInput.phase)) {
        frame = window.requestAnimationFrame(render);
      }
    };
    resize();
    requestRender();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      liquids.dispose();
      disposeObject(scene);
      renderer.dispose();
      environment.dispose();
      element.replaceChildren();
      updateScene.current = null;
    };
    // Keep the renderer and GPU resources alive across playback transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => updateScene.current?.(sceneInput), [sceneInput]);

  return (
    <div
      ref={host}
      className="three-extraction-scene"
      role="img"
      tabIndex={0}
      aria-label={`Phễu chiết 3D — bậc ${stageNumber}/${result.inputCanonical.stageCount}`}
      data-testid="three-extraction-scene"
      data-playback-phase={playbackPhase}
      data-reduced-motion={reducedMotion}
    >
      <span className="three-scene-fallback">
        Cảnh 3D phễu chiết: pha nước ở dưới, pha hữu cơ ở trên.
      </span>
    </div>
  );
}

function createBackdrop(onLoaded: () => void) {
  const group = new THREE.Group();
  const texture = new THREE.TextureLoader().load(laboratoryBackground, onLoaded);
  texture.colorSpace = THREE.SRGBColorSpace;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 9),
    new THREE.MeshBasicMaterial({
      map: texture,
      color: '#7291ad',
      transparent: true,
      opacity: 0.48,
    }),
  );
  plane.position.set(0, 2.3, -3.4);
  group.add(plane);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 64),
    new THREE.MeshStandardMaterial({ color: '#0b2437', roughness: 0.38, metalness: 0.28 }),
  );
  floor.rotation.x = -Math.PI / 2;
  // Keep the receiver in front of the floor plane at every responsive aspect ratio.
  floor.position.y = -2.55;
  floor.receiveShadow = true;
  group.add(floor);
  return group;
}

function createGlass() {
  const group = new THREE.Group();
  const outer = latheFromProfile(0.055);
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#d6f4ff',
    roughness: 0.04,
    metalness: 0,
    transmission: 0.82,
    thickness: 0.14,
    ior: 1.46,
    transparent: true,
    opacity: 0.19,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const shell = new THREE.Mesh(outer, glassMaterial);
  shell.renderOrder = 8;
  group.add(shell);
  const stopper = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 16), glassMaterial);
  stopper.position.y = FUNNEL_INTERIOR_HEIGHT + 0.29;
  group.add(stopper);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(funnelInteriorRadius(FUNNEL_INTERIOR_HEIGHT) + 0.074, 0.038, 12, 72),
    new THREE.MeshPhysicalMaterial({
      color: '#e8faff',
      roughness: 0.08,
      metalness: 0.05,
      transmission: 0.7,
    }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = FUNNEL_INTERIOR_HEIGHT;
  rim.renderOrder = 10;
  group.add(rim);
  return group;
}

function createLiquids(input: SceneInput, drainProgress: number) {
  const group = new THREE.Group();
  const lowerMaterial = new THREE.MeshPhysicalMaterial({
    color: '#289fda',
    roughness: 0.13,
    metalness: 0,
    transmission: 0.18,
    thickness: 0.72,
    transparent: true,
    opacity: 0.79,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const upperMaterial = new THREE.MeshPhysicalMaterial({
    color: '#eeb34d',
    roughness: 0.16,
    metalness: 0,
    transmission: 0.16,
    thickness: 0.62,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const lower = new THREE.Mesh(new THREE.BufferGeometry(), lowerMaterial);
  const upper = new THREE.Mesh(new THREE.BufferGeometry(), upperMaterial);
  lower.renderOrder = 2;
  upper.renderOrder = 3;
  group.add(lower, upper);

  const lowerMeniscus = createMeniscus('#d8f8ff');
  const upperMeniscus = createMeniscus('#fff0ba');
  lowerMeniscus.renderOrder = 6;
  upperMeniscus.renderOrder = 7;
  group.add(lowerMeniscus, upperMeniscus);

  let lastAqueous = -1;
  let lastOrganic = -1;
  const update = (aqueousVolumeL: number, organicVolumeL: number) => {
    if (aqueousVolumeL === lastAqueous && organicVolumeL === lastOrganic) return;
    lastAqueous = aqueousVolumeL;
    lastOrganic = organicVolumeL;
    const levels = mapLiquidVolumesToFunnel(aqueousVolumeL, organicVolumeL, input.capacityBasisL);
    replaceGeometry(lower, latheLiquid(0, levels.aqueousTop));
    lower.visible = levels.aqueousTop > 0.015;
    replaceGeometry(upper, latheLiquid(levels.aqueousTop, levels.totalTop));
    upper.visible = organicVolumeL > 0 && levels.totalTop - levels.aqueousTop > 0.015;
    setMeniscus(lowerMeniscus, levels.aqueousTop, lower.visible);
    setMeniscus(upperMeniscus, levels.totalTop, upper.visible);
  };
  const setSurfaceWave = (wave: number) => {
    // Deform only the horizontal cap. The side wall remains inside its glass profile.
    for (const mesh of [upper.visible ? upper : lower]) {
      const positions = mesh.geometry.getAttribute('position');
      if (!positions || !mesh.visible) continue;
      const top = mesh === lower ? lowerMeniscus.position.y : upperMeniscus.position.y;
      const radius = liquidRadius(top);
      for (let index = 0; index < positions.count; index += 1) {
        const x = positions.getX(index);
        const z = positions.getZ(index);
        if (Math.abs(positions.getY(index) - top) > 0.04) continue;
        const radial = Math.sqrt(x * x + z * z);
        positions.setY(index, top + wave * Math.sin(x * 4) * Math.max(0, 1 - radial / radius));
      }
      positions.needsUpdate = true;
    }
  };
  update(input.aqueousVolumeL * (1 - drainProgress), input.organicVolumeL);
  return {
    group,
    update,
    setSurfaceWave,
    dispose: () => {
      lower.geometry.dispose();
      upper.geometry.dispose();
      lowerMaterial.dispose();
      upperMaterial.dispose();
    },
  };
}

function createMeniscus(color: string) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.006, 8, 64),
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.14,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function setMeniscus(meniscus: THREE.Mesh, height: number, visible: boolean) {
  meniscus.visible = visible;
  meniscus.position.y = height;
  const radius = Math.max(0.1, funnelInteriorRadius(height) - 0.018);
  meniscus.scale.setScalar(radius);
}

function latheFromProfile(thickness: number) {
  const points = Array.from({ length: profileSegments + 1 }, (_, index) => {
    const y = (index / profileSegments) * FUNNEL_INTERIOR_HEIGHT;
    return new THREE.Vector2(funnelInteriorRadius(y) + thickness, y);
  });
  for (let index = profileSegments; index >= 0; index -= 1) {
    const y = (index / profileSegments) * FUNNEL_INTERIOR_HEIGHT;
    points.push(new THREE.Vector2(funnelInteriorRadius(y), y));
  }
  points.push(points[0].clone());
  return new THREE.LatheGeometry(points, 64);
}

function latheLiquid(bottom: number, top: number) {
  if (top <= bottom) return new THREE.BufferGeometry();
  const height = top - bottom;
  const steps = Math.max(8, Math.ceil((height / FUNNEL_INTERIOR_HEIGHT) * profileSegments));
  const points = [new THREE.Vector2(0, bottom)];
  for (let index = 0; index <= steps; index += 1) {
    const y = bottom + (height * index) / steps;
    points.push(new THREE.Vector2(liquidRadius(y), y));
  }
  points.push(new THREE.Vector2(0, top));
  return new THREE.LatheGeometry(points, 64);
}

function createValve() {
  const group = new THREE.Group();
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.38, 24),
    new THREE.MeshPhysicalMaterial({ color: '#c9f2ff', transmission: 0.55, roughness: 0.12 }),
  );
  stem.position.y = -0.19;
  group.add(stem);
  const pivot = new THREE.Group();
  pivot.position.y = -0.3;
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 0.12, 0.22),
    new THREE.MeshStandardMaterial({ color: '#315e7a', roughness: 0.28, metalness: 0.55 }),
  );
  pivot.add(handle);
  group.add(pivot);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.045, 0.26, 24), stem.material);
  spout.position.y = -0.48;
  group.add(spout);
  return { group, pivot };
}

function createReceiver() {
  const group = new THREE.Group();
  group.position.set(0, -1.55, 0.06);
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.66, 1.02, 64, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: '#d5f4ff',
      transmission: 0.86,
      transparent: true,
      opacity: 0.28,
      roughness: 0.08,
      thickness: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  group.add(glass);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.028, 10, 64),
    new THREE.MeshStandardMaterial({ color: '#ddf7ff', metalness: 0.2, roughness: 0.12 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.51;
  group.add(rim);
  const fillMaterial = new THREE.MeshPhysicalMaterial({
    color: '#68c9ee',
    transmission: 0.22,
    transparent: true,
    opacity: 0.67,
    roughness: 0.12,
    depthWrite: false,
  });
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.6, 0.01, 64), fillMaterial);
  fill.renderOrder = 2;
  glass.renderOrder = 8;
  group.add(fill);
  let previousRatio = -1;
  return {
    group,
    setFill: (volumeL: number, maximumL = 1) => {
      const ratio = Math.min(1, Math.max(0, volumeL / Math.max(maximumL, Number.EPSILON)));
      if (ratio === previousRatio) return;
      previousRatio = ratio;
      // Invert the receiving vessel's frustum volume as well.
      const volume = (height: number) => {
        const topRadius = 0.6 + (0.12 * height) / 0.88;
        return (Math.PI * height * (0.6 ** 2 + 0.6 * topRadius + topRadius ** 2)) / 3;
      };
      const target = ratio * volume(0.88);
      let low = 0;
      let high = 0.88;
      for (let index = 0; index < 28; index += 1) {
        const midpoint = (low + high) / 2;
        if (volume(midpoint) < target) low = midpoint;
        else high = midpoint;
      }
      const height = Math.max(0.001, (low + high) / 2);
      replaceGeometry(
        fill,
        new THREE.CylinderGeometry(0.6 + (0.12 * height) / 0.88, 0.6, height, 48),
      );
      fill.position.y = -0.51 + height / 2;
      fill.visible = ratio > 0.002;
    },
  };
}

function createMixingDroplets() {
  const geometry = new THREE.SphereGeometry(0.035, 12, 8);
  const material = new THREE.MeshPhysicalMaterial({
    color: '#e9f8ff',
    transmission: 0.4,
    transparent: true,
    opacity: 0.75,
    roughness: 0.1,
  });
  const droplets = new THREE.InstancedMesh(geometry, material, 32);
  const dummy = new THREE.Object3D();
  for (let index = 0; index < 32; index += 1) {
    const y = 0.8 + deterministic(index, 2) * 2.45;
    const radius = funnelInteriorRadius(y) * 0.72;
    dummy.position.set(
      (deterministic(index, 5) - 0.5) * radius * 2,
      y,
      (deterministic(index, 9) - 0.5) * radius * 1.25,
    );
    const scale = 0.55 + deterministic(index, 13) * 0.85;
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    droplets.setMatrixAt(index, dummy.matrix);
  }
  droplets.instanceMatrix.needsUpdate = true;
  return droplets;
}

function createDrainStream() {
  const material = new THREE.MeshPhysicalMaterial({
    color: '#92ddf5',
    transmission: 0.35,
    transparent: true,
    opacity: 0.76,
    roughness: 0.08,
    emissive: '#277ba0',
    emissiveIntensity: 0.2,
  });
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.044, 1.3, 20), material);
  stream.position.y = -1.23;
  return stream;
}

function replaceGeometry(mesh: THREE.Mesh, next: THREE.BufferGeometry) {
  mesh.geometry.dispose();
  mesh.geometry = next;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.InstancedMesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if ('map' in material && material.map instanceof THREE.Texture) material.map.dispose();
      material.dispose();
    });
  });
}

function canRenderWebGL() {
  return typeof window !== 'undefined' && 'WebGLRenderingContext' in window;
}

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function deterministic(index: number, salt: number) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function isAnimatedPhase(phase: PlaybackPhase) {
  return (
    phase === 'LOADING_FEED' ||
    phase === 'ADDING_SOLVENT' ||
    phase === 'MIXING' ||
    phase === 'EQUILIBRATING' ||
    phase === 'SEPARATING' ||
    phase === 'DRAINING'
  );
}
