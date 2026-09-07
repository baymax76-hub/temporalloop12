/**
 * Starfield OS - Master 3D Space Engine
 * Orchestrates WebGL rendering, 15,000+ starfield particles, volumetric cosmic nebulae,
 * planetary nodes, constellation meshes, flight physics, and raycasting targeting.
 */

/* global THREE */
import { CELESTIAL_NODES, CONSTELLATIONS } from '../data/universeData.js';
import { CelestialNode } from './CelestialNode.js';
import { ConstellationLines } from './ConstellationLines.js';
import { WeaponEffects } from './WeaponEffects.js';
import { ShipFlightPhysics } from './ShipFlightPhysics.js';

export class SpaceEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} shipConfig
   * @param {Object} soundEngine
   * @param {Object} callbacks - { onTargetHover, onTargetSelect, onDockWithNode, onFuelEarned }
   */
  constructor(canvas, shipConfig, soundEngine, callbacks = {}) {
    this.canvas = canvas;
    this.shipConfig = shipConfig;
    this.soundEngine = soundEngine;
    this.callbacks = callbacks;

    this.celestialNodes = [];
    this.fleetShips = new Map(); // id -> { group, mesh, data }
    this.hoveredNode = null;
    this.lockedNode = null;
    this.nearestNode = null;

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse2D = new THREE.Vector2(-999, -999);

    this.initScene();
    this.initLighting();
    this.initDeepStarfield();
    this.initCosmicNebulae();
    this.initCelestialNodes();
    this.initConstellations();

    this.weaponEffects = new WeaponEffects(this.scene, this.soundEngine);
    this.flightPhysics = new ShipFlightPhysics(this.camera, this.shipConfig, this.scene, this.soundEngine);

    this.bindEvents();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.00035);

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      15000
    );
    this.camera.position.set(0, 20, 150);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(0x384252, 1.2);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(500, 800, 400);
    this.scene.add(sunLight);

    // Deep blue rim light
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    rimLight.position.set(-600, -300, -500);
    this.scene.add(rimLight);
  }

  /**
   * 15,000+ procedural multi-spectral starfield particles
   */
  initDeepStarfield() {
    const count = 16000;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Spectral stellar colors: O(Blue), B(Cyan), A(White), G(Yellow), M(Red-Orange)
    const spectralColors = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#7dd3fc'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#fef08a'),
      new THREE.Color('#fb923c'),
      new THREE.Color('#c084fc'),
    ];

    for (let i = 0; i < count; i++) {
      // Wide sphere distribution around the cosmos
      const radius = 1800 + Math.random() * 8000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 1.2 + Math.random() * 3.5;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom circular star particle texture
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32;
    starCanvas.height = 32;
    const ctx = starCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const mat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.starfield = new THREE.Points(geom, mat);
    this.scene.add(this.starfield);
  }

  /**
   * Volumetric procedural cosmic nebulae
   */
  initCosmicNebulae() {
    this.nebulaGroup = new THREE.Group();
    this.nebulaGroup.name = 'nebulae';

    const nebulaColors = ['#4c1d95', '#0369a1', '#be185d', '#1e1b4b', '#065f46'];

    // Generate cloud sprite texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const cloudTexture = new THREE.CanvasTexture(canvas);

    for (let c = 0; c < nebulaColors.length; c++) {
      const count = 40;
      const geom = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);

      const clusterCenter = new THREE.Vector3(
        (Math.random() - 0.5) * 3500,
        (Math.random() - 0.5) * 2000,
        -1200 - Math.random() * 2500
      );

      for (let i = 0; i < count; i++) {
        positions[i * 3] = clusterCenter.x + (Math.random() - 0.5) * 900;
        positions[i * 3 + 1] = clusterCenter.y + (Math.random() - 0.5) * 700;
        positions[i * 3 + 2] = clusterCenter.z + (Math.random() - 0.5) * 900;
      }

      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color: new THREE.Color(nebulaColors[c]),
        size: 320,
        map: cloudTexture,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const cluster = new THREE.Points(geom, mat);
      this.nebulaGroup.add(cluster);
    }

    this.scene.add(this.nebulaGroup);
  }

  /**
   * Instantiate all 3D Planetary Story Nodes
   */
  initCelestialNodes() {
    this.celestialNodes = CELESTIAL_NODES.map(nodeData => {
      return new CelestialNode(nodeData, this.scene);
    });
  }

  /**
   * Instantiate 3D Constellation Mesh
   */
  initConstellations() {
    this.constellationMesh = new ConstellationLines(
      CONSTELLATIONS,
      this.celestialNodes,
      this.scene
    );
  }

  bindEvents() {
    this.onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    this.onMouseMove = (e) => {
      this.mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse2D.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    this.onClick = (e) => {
      if (e.target.closest('.interactive-hud')) return;

      // If clicked on hovered node, lock onto it and initiate warp / docking
      if (this.hoveredNode) {
        this.selectNode(this.hoveredNode);
      }
    };

    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('click', this.onClick);
  }

  /**
   * Lock on and fly to celestial node
   */
  selectNode(node) {
    if (this.lockedNode) this.lockedNode.setLock(false);
    this.lockedNode = node;
    node.setLock(true);

    if (this.soundEngine) this.soundEngine.playTargetLock();

    if (this.callbacks.onTargetSelect) {
      this.callbacks.onTargetSelect(node.data);
    }

    // Warp ship to near orbit
    const targetCoord = new THREE.Vector3(
      node.data.coordinates.x,
      node.data.coordinates.y,
      node.data.coordinates.z
    );

    this.flightPhysics.warpToCoordinates(targetCoord, () => {
      if (this.callbacks.onDockWithNode) {
        this.callbacks.onDockWithNode(node.data);
      }
    });
  }

  /**
   * Fire active weapons
   */
  fireWeapons(theme) {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    this.weaponEffects.fireLasers(this.camera.position, forward, right, theme);
  }

  /**
   * Fire special ability (EMP / Pulse)
   */
  triggerSpecialAbility(theme) {
    this.weaponEffects.triggerEmpShockwave(this.camera.position, theme);
  }

  /**
   * Compute 2D projected screen coordinates for all celestial nodes
   * Used for HUD target reticles and radar
   */
  getProjectedNodeScreenPositions() {
    const projected = [];
    const camPos = this.camera.position;

    this.celestialNodes.forEach(node => {
      const worldPos = new THREE.Vector3(
        node.data.coordinates.x,
        node.data.coordinates.y,
        node.data.coordinates.z
      );

      const distance = camPos.distanceTo(worldPos);

      // Project into screen space
      const screenPos = worldPos.clone().project(this.camera);
      const isVisibleInFront = screenPos.z < 1.0;

      const screenX = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

      // Direction vector relative to camera heading
      const relVector = worldPos.clone().sub(camPos);

      projected.push({
        id: node.data.id,
        name: node.data.name,
        color: node.data.color,
        constellation: node.data.constellation,
        distance: distance,
        screenX,
        screenY,
        inFront: isVisibleInFront,
        isLocked: this.lockedNode?.data.id === node.data.id,
        isHovered: this.hoveredNode?.data.id === node.data.id,
        relVector: relVector,
        nodeData: node.data,
      });
    });

    // Sort by distance
    projected.sort((a, b) => a.distance - b.distance);
    this.nearestNode = projected[0] || null;

    return projected;
  }

  /**
   * Raycast mouse cursor against planetary nodes
   */
  checkRaycastIntersections() {
    this.raycaster.setFromCamera(this.mouse2D, this.camera);

    const hitTargets = [];
    this.celestialNodes.forEach(node => {
      if (node.planetMesh) hitTargets.push(node.planetMesh);
    });

    const intersects = this.raycaster.intersectObjects(hitTargets, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const parentNode = hitMesh.userData.parentNode;

      if (parentNode && this.hoveredNode !== parentNode) {
        if (this.hoveredNode) this.hoveredNode.setHover(false);
        this.hoveredNode = parentNode;
        this.hoveredNode.setHover(true);

        if (this.soundEngine) this.soundEngine.playHoverTone();
        if (this.callbacks.onTargetHover) this.callbacks.onTargetHover(parentNode.data);
      }
    } else {
      if (this.hoveredNode) {
        this.hoveredNode.setHover(false);
        this.hoveredNode = null;
        if (this.callbacks.onTargetHover) this.callbacks.onTargetHover(null);
      }
    }
  }

  /**
   * Synchronize 3D Fleet Ship Models from Cloud Engine Telemetry
   * @param {Array} fleetMembers
   */
  updateFleetMembers(fleetMembers) {
    if (!fleetMembers) return;
    const currentIds = new Set(fleetMembers.map(f => f.id));

    // Remove disconnected ships
    for (const [id, ship] of this.fleetShips.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(ship.group);
        this.fleetShips.delete(id);
      }
    }

    // Add / update active ships
    fleetMembers.forEach(pilot => {
      let shipObj = this.fleetShips.get(pilot.id);

      if (!shipObj) {
        // Create 3D vessel mesh
        const group = new THREE.Group();
        group.position.set(pilot.x, pilot.y, pilot.z);

        const colorHex = pilot.theme === 'aegis' ? 0xffaa00 : (pilot.theme === 'quantum' ? 0xc084fc : 0x00f0ff);
        const geom = new THREE.ConeGeometry(2.5, 6, 4);
        geom.rotateX(Math.PI / 2);

        const mat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          emissive: new THREE.Color(colorHex),
          emissiveIntensity: 0.6,
          roughness: 0.4,
          metalness: 0.8,
        });

        const mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);

        // Engine glow beacon
        const beaconGeom = new THREE.SphereGeometry(1.2, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
        });
        const beacon = new THREE.Mesh(beaconGeom, beaconMat);
        beacon.position.set(0, 0, 3);
        group.add(beacon);

        this.scene.add(group);
        shipObj = { group, mesh, data: pilot };
        this.fleetShips.set(pilot.id, shipObj);
      } else {
        // Interpolate position smoothly
        shipObj.group.position.lerp(new THREE.Vector3(pilot.x, pilot.y, pilot.z), 0.15);
        shipObj.data = pilot;
      }
    });
  }

  /**
   * Main Render and Physics Animation Loop
   */
  animate = () => {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Update Flight Kinematics
    const flightTelemetry = this.flightPhysics.update(delta, this.shipConfig.specs);

    // 2. Update Celestial Nodes
    this.celestialNodes.forEach(node => node.update(delta, elapsedTime));

    // 3. Update Constellation Mesh
    if (this.constellationMesh) {
      this.constellationMesh.update(delta);
    }

    // 4. Update Weapons & Asteroids
    const weaponResult = this.weaponEffects.update(delta);
    if (weaponResult.fuelEarned > 0 && this.callbacks.onFuelEarned) {
      this.callbacks.onFuelEarned(weaponResult.fuelEarned);
    }

    // 5. Raycast Intersections
    this.checkRaycastIntersections();

    // 6. Slow cosmic drift of starfield
    if (this.starfield) {
      this.starfield.rotation.y += 0.00008;
    }

    // 7. Render WebGL scene
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onClick);
    if (this.flightPhysics) this.flightPhysics.dispose();
  }
}
