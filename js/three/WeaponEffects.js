/**
 * Starfield OS - Weapon Effects, Laser Projectiles & Asteroid Collision System
 * Manages dual plasma lasers, muzzle flashes, collision hitboxes, asteroid destruction,
 * EMP shockwave rings, and quantum scanner pulses.
 */

/* global THREE */

export class WeaponEffects {
  /**
   * @param {THREE.Scene} scene
   * @param {Object} soundEngine
   */
  constructor(scene, soundEngine) {
    this.scene = scene;
    this.soundEngine = soundEngine;

    this.lasers = [];
    this.asteroids = [];
    this.particles = [];
    this.shockwaves = [];

    this.initAsteroidField();
  }

  /**
   * Populate space with floating, mineable asteroids
   */
  initAsteroidField(count = 70) {
    this.asteroidGroup = new THREE.Group();
    this.asteroidGroup.name = 'asteroid_field';

    const rockMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, metalness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95, metalness: 0.1 }),
    ];

    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 14;
      const geom = new THREE.DodecahedronGeometry(radius, 1);

      // Deform vertices for realistic rugged rock look
      const pos = geom.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const vx = pos.getX(j) + (Math.random() - 0.5) * 3;
        const vy = pos.getY(j) + (Math.random() - 0.5) * 3;
        const vz = pos.getZ(j) + (Math.random() - 0.5) * 3;
        pos.setXYZ(j, vx, vy, vz);
      }
      geom.computeVertexNormals();

      const mat = rockMaterials[Math.floor(Math.random() * rockMaterials.length)];
      const mesh = new THREE.Mesh(geom, mat);

      // Distribute in a wide torus/sphere around flight area
      const dist = 300 + Math.random() * 700;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 500;

      mesh.position.set(
        Math.cos(angle) * dist,
        height,
        Math.sin(angle) * dist - 300
      );

      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData = {
        type: 'asteroid',
        hp: 30 + radius * 3,
        maxHp: 30 + radius * 3,
        radius: radius,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.015,
        },
      };

      this.asteroids.push(mesh);
      this.asteroidGroup.add(mesh);
    }

    this.scene.add(this.asteroidGroup);
  }

  /**
   * Fire dual plasma lasers from ship camera / cockpit
   * @param {THREE.Vector3} originPos
   * @param {THREE.Vector3} forwardDir
   * @param {THREE.Vector3} rightDir
   * @param {string} shipTheme - vanguard, aegis, quantum
   */
  fireLasers(originPos, forwardDir, rightDir, shipTheme = 'vanguard') {
    let laserColor = 0x00f0ff;
    let laserLength = 24;
    let laserRadius = 0.9;
    let speed = 750;

    if (shipTheme === 'aegis') {
      laserColor = 0xffaa00;
      laserLength = 32;
      laserRadius = 1.4;
      speed = 600;
    } else if (shipTheme === 'quantum') {
      laserColor = 0xe879f9;
      laserLength = 28;
      laserRadius = 1.1;
      speed = 850;
    }

    // Sound effect
    if (this.soundEngine) {
      this.soundEngine.playLaser(shipTheme);
    }

    // Left and Right wingtip cannon offsets
    const offsets = [
      rightDir.clone().multiplyScalar(-3.2).add(new THREE.Vector3(0, -1.2, 0)),
      rightDir.clone().multiplyScalar(3.2).add(new THREE.Vector3(0, -1.2, 0)),
    ];

    offsets.forEach(offset => {
      const spawnPos = originPos.clone().add(offset).add(forwardDir.clone().multiplyScalar(4));

      const geom = new THREE.CylinderGeometry(laserRadius, laserRadius, laserLength, 8);
      geom.rotateX(Math.PI / 2); // Align with Z-forward

      const mat = new THREE.MeshBasicMaterial({
        color: laserColor,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(spawnPos);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDir.clone().normalize());

      this.scene.add(mesh);

      this.lasers.push({
        mesh,
        direction: forwardDir.clone().normalize(),
        speed: speed,
        distanceTraveled: 0,
        maxDistance: 1200,
        damage: shipTheme === 'aegis' ? 60 : (shipTheme === 'quantum' ? 45 : 35),
        color: laserColor,
      });
    });
  }

  /**
   * Trigger EMP shockwave blast
   * @param {THREE.Vector3} originPos
   * @param {string} shipTheme
   */
  triggerEmpShockwave(originPos, shipTheme = 'aegis') {
    if (this.soundEngine) {
      this.soundEngine.playEmpBlast();
    }

    const shockColor = shipTheme === 'quantum' ? 0xc084fc : 0xffaa00;
    const geom = new THREE.RingGeometry(1, 4, 32);
    geom.rotateX(Math.PI / 2);

    const mat = new THREE.MeshBasicMaterial({
      color: shockColor,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(originPos);
    this.scene.add(mesh);

    this.shockwaves.push({
      mesh,
      radius: 1,
      maxRadius: 280,
      expandSpeed: 320,
      opacity: 0.9,
    });

    // Destroy or push all nearby asteroids
    this.asteroids.forEach(ast => {
      const d = ast.position.distanceTo(originPos);
      if (d < 280) {
        this.spawnExplosionParticles(ast.position, shockColor, 20);
        ast.userData.hp -= 150;
      }
    });
  }

  /**
   * Spawn particle explosion upon projectile impact or asteroid destruction
   */
  spawnExplosionParticles(position, colorHex, count = 25) {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      const speed = 20 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      velocities.push(
        new THREE.Vector3(
          speed * Math.sin(phi) * Math.cos(theta),
          speed * Math.sin(phi) * Math.sin(theta),
          speed * Math.cos(phi)
        )
      );
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: colorHex,
      size: 3.5,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
    });

    const pMesh = new THREE.Points(geom, mat);
    this.scene.add(pMesh);

    this.particles.push({
      mesh: pMesh,
      velocities,
      life: 0.8,
      maxLife: 0.8,
    });
  }

  /**
   * Update lasers, asteroids, shockwaves, and check collisions
   * @param {number} delta
   * @returns {Object} event feedback (e.g. asteroidDestroyed, fuelGained)
   */
  update(delta) {
    let result = { destroyedCount: 0, fuelEarned: 0 };

    // 1. Rotate Asteroids
    this.asteroids.forEach(ast => {
      ast.rotation.x += ast.userData.rotSpeed.x;
      ast.rotation.y += ast.userData.rotSpeed.y;
      ast.rotation.z += ast.userData.rotSpeed.z;
    });

    // 2. Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.expandSpeed * delta;
      sw.opacity = Math.max(0, 1 - (sw.radius / sw.maxRadius));
      sw.mesh.scale.set(sw.radius, sw.radius, sw.radius);
      sw.mesh.material.opacity = sw.opacity;

      if (sw.radius >= sw.maxRadius || sw.opacity <= 0) {
        this.scene.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        sw.mesh.material.dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // 3. Update Lasers & Raycast Collisions
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      const stepDist = laser.speed * delta;
      laser.mesh.position.addScaledVector(laser.direction, stepDist);
      laser.distanceTraveled += stepDist;

      let hitAsteroid = false;

      // Check collision against asteroids
      for (let j = 0; j < this.asteroids.length; j++) {
        const ast = this.asteroids[j];
        if (ast.position.distanceTo(laser.mesh.position) < (ast.userData.radius + 3)) {
          ast.userData.hp -= laser.damage;
          hitAsteroid = true;

          // Impact spark
          this.spawnExplosionParticles(laser.mesh.position, laser.color, 12);

          if (ast.userData.hp <= 0) {
            // Asteroid shattered!
            if (this.soundEngine) this.soundEngine.playExplosion();
            this.spawnExplosionParticles(ast.position, 0xfbbf24, 35);
            this.asteroidGroup.remove(ast);
            this.asteroids.splice(j, 1);

            result.destroyedCount += 1;
            result.fuelEarned += Math.floor(10 + Math.random() * 15);
          }
          break;
        }
      }

      if (hitAsteroid || laser.distanceTraveled >= laser.maxDistance) {
        this.scene.remove(laser.mesh);
        laser.mesh.geometry.dispose();
        laser.mesh.material.dispose();
        this.lasers.splice(i, 1);
      }
    }

    // 4. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      const positions = p.mesh.geometry.attributes.position.array;

      for (let j = 0; j < p.velocities.length; j++) {
        positions[j * 3] += p.velocities[j].x * delta;
        positions[j * 3 + 1] += p.velocities[j].y * delta;
        positions[j * 3 + 2] += p.velocities[j].z * delta;
      }
      p.mesh.geometry.attributes.position.needsUpdate = true;
      p.mesh.material.opacity = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }

    return result;
  }
}
