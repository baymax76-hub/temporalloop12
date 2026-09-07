/**
 * Starfield OS - 3D Celestial Node Renderer
 * High-detail procedural planetary meshes, atmospheric fresnel glows, planetary rings,
 * pulsing holographic beacon rings, and orbital story anchors in 3D WebGL space.
 */

/* global THREE */

export class CelestialNode {
  /**
   * @param {Object} data - Planetary node configuration from universeData.js
   * @param {THREE.Scene} scene
   */
  constructor(data, scene) {
    this.data = data;
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(data.coordinates.x, data.coordinates.y, data.coordinates.z);
    this.group.userData = { id: data.id, name: data.name, type: 'celestial_node', data: data };

    this.isHovered = false;
    this.isLocked = false;
    this.isVisited = false;
    this.baseRadius = data.radius;
    this.rotationSpeed = 0.003 + (Math.random() * 0.004);

    this.initPlanetMesh();
    this.initAtmosphere();
    if (data.hasRings) this.initRings();
    this.initHoloBeacon();
    this.initOrbitalParticles();

    this.scene.add(this.group);
  }

  /**
   * Create procedural planetary texture & shader material
   */
  initPlanetMesh() {
    const geom = new THREE.SphereGeometry(this.baseRadius, 48, 48);

    // Procedural surface canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    this.drawPlanetTexture(ctx, canvas.width, canvas.height, this.data);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.65,
      metalness: 0.25,
      emissive: new THREE.Color(this.data.emissive),
      emissiveIntensity: 0.35,
    });

    this.planetMesh = new THREE.Mesh(geom, material);
    this.planetMesh.userData = { parentNode: this };
    this.group.add(this.planetMesh);
  }

  /**
   * Procedural canvas texture generator tailored to planetary classification
   */
  drawPlanetTexture(ctx, w, h, data) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);

    if (data.textureType === 'crystal') {
      gradient.addColorStop(0, '#0369a1');
      gradient.addColorStop(0.5, '#38bdf8');
      gradient.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Crystalline facets
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const s = 15 + Math.random() * 30;
        ctx.moveTo(cx, cy - s);
        ctx.lineTo(cx + s, cy);
        ctx.lineTo(cx, cy + s);
        ctx.lineTo(cx - s, cy);
        ctx.closePath();
        ctx.fill();
      }
    } else if (data.textureType === 'magma') {
      gradient.addColorStop(0, '#7c2d12');
      gradient.addColorStop(0.4, '#ea580c');
      gradient.addColorStop(0.7, '#1c1917');
      gradient.addColorStop(1, '#991b1b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Lava veins
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 4;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * w, Math.random() * h);
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(Math.random() * w, Math.random() * h);
        }
        ctx.stroke();
      }
    } else if (data.textureType === 'oceanic') {
      gradient.addColorStop(0, '#082f49');
      gradient.addColorStop(0.4, '#0284c7');
      gradient.addColorStop(0.8, '#065f46');
      gradient.addColorStop(1, '#0369a1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Swirling atmospheric storm bands
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 8; i++) {
        const y = (h / 8) * i + 10;
        ctx.beginPath();
        ctx.ellipse(w / 2, y, w / 2, 8 + Math.random() * 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (data.textureType === 'quantum' || data.textureType === 'nexus') {
      gradient.addColorStop(0, '#4c1d95');
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Energy rings & quantum lines
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 3;
      for (let i = 0; i < 20; i++) {
        ctx.strokeRect(Math.random() * w, Math.random() * h, 30 + Math.random() * 60, 20);
      }
    } else {
      // Default sci-fi terrestrial/metallic
      gradient.addColorStop(0, '#334155');
      gradient.addColorStop(0.5, '#64748b');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 10, 10);
      }
    }
  }

  /**
   * Atmospheric Fresnel Glow Shell
   */
  initAtmosphere() {
    const atmoGeom = new THREE.SphereGeometry(this.baseRadius * 1.15, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.data.atmosphereColor),
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    this.atmosphereMesh = new THREE.Mesh(atmoGeom, atmoMat);
    this.group.add(this.atmosphereMesh);
  }

  /**
   * Planetary Rings
   */
  initRings() {
    const innerRadius = this.data.ringRadius * 0.7;
    const outerRadius = this.data.ringRadius * 1.25;
    const ringGeom = new THREE.RingGeometry(innerRadius, outerRadius, 64);

    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.data.ringColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    this.ringMesh = new THREE.Mesh(ringGeom, ringMat);
    this.ringMesh.rotation.x = Math.PI / 2.3;
    this.ringMesh.rotation.y = Math.PI / 8;
    this.group.add(this.ringMesh);
  }

  /**
   * Holographic Beacon & Target Reticle Ring in 3D Space
   */
  initHoloBeacon() {
    // Pulsing outer orbit ring
    const beaconGeom = new THREE.RingGeometry(this.baseRadius * 1.5, this.baseRadius * 1.55, 48);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.data.color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    this.beaconRing = new THREE.Mesh(beaconGeom, beaconMat);
    this.beaconRing.rotation.x = Math.PI / 2;
    this.group.add(this.beaconRing);

    // Inner rotating dashed ring
    const dashGeom = new THREE.RingGeometry(this.baseRadius * 1.8, this.baseRadius * 1.82, 32);
    const dashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    });
    this.dashRing = new THREE.Mesh(dashGeom, dashMat);
    this.dashRing.rotation.x = Math.PI / 2.2;
    this.group.add(this.dashRing);
  }

  /**
   * Surrounding orbital energy motes
   */
  initOrbitalParticles() {
    const count = 35;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dist = this.baseRadius * (1.3 + Math.random() * 0.7);

      positions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = dist * Math.cos(phi);
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(this.data.color),
      size: 4.5,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geom, mat);
    this.group.add(this.particles);
  }

  setHover(hovered) {
    this.isHovered = hovered;
  }

  setLock(locked) {
    this.isLocked = locked;
  }

  setVisited(visited) {
    this.isVisited = visited;
  }

  /**
   * Per-frame animation tick
   * @param {number} delta
   * @param {number} time
   */
  update(delta, time) {
    if (this.planetMesh) {
      this.planetMesh.rotation.y += this.rotationSpeed;
    }
    if (this.atmosphereMesh) {
      this.atmosphereMesh.rotation.y += this.rotationSpeed * 0.7;
    }
    if (this.ringMesh) {
      this.ringMesh.rotation.z += this.rotationSpeed * 0.4;
    }
    if (this.beaconRing) {
      const pulse = 1 + Math.sin(time * 2.5) * 0.08;
      this.beaconRing.scale.set(pulse, pulse, pulse);
      this.beaconRing.rotation.z += 0.008;

      if (this.isHovered || this.isLocked) {
        this.beaconRing.material.opacity = 0.85;
      } else {
        this.beaconRing.material.opacity = 0.35;
      }
    }
    if (this.dashRing) {
      this.dashRing.rotation.z -= 0.012;
    }
    if (this.particles) {
      this.particles.rotation.y += 0.005;
      this.particles.rotation.x += 0.002;
    }

    // Scale up slightly on hover/lock
    const targetScale = this.isHovered ? 1.08 : (this.isLocked ? 1.05 : 1.0);
    this.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  }
}
