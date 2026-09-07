/**
 * Starfield OS - Ship Flight Physics & Camera Kinematics
 * True 6DOF open-space flight dynamics, momentum inertia, camera banking,
 * mouse drag steering, warp boost streaks, and cinematic waypoint warp transitions.
 */

/* global THREE, gsap */

export class ShipFlightPhysics {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {Object} shipConfig - active ship definition from universeData.js
   * @param {THREE.Scene} scene
   * @param {Object} soundEngine
   */
  constructor(camera, shipConfig, scene, soundEngine) {
    this.camera = camera;
    this.shipConfig = shipConfig;
    this.scene = scene;
    this.soundEngine = soundEngine;

    // Kinematics state
    this.position = new THREE.Vector3(0, 0, 100);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.quaternion = new THREE.Quaternion();

    this.throttle = 0.0; // 0.0 to 1.0
    this.targetThrottle = 0.0;
    this.speed = 0.0; // in game units
    this.isBoosting = false;
    this.isWarpingToTarget = false;

    // Power allocation modifiers (from Cockpit power routing)
    this.powerEngines = 1.0;
    this.powerShields = 1.0;
    this.powerWeapons = 1.0;

    // Control inputs
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      rollLeft: false,
      rollRight: false,
      boost: false,
    };

    this.mouse = {
      isDown: false,
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0,
      rawX: 0,
      rawY: 0,
    };

    // Camera banking / roll tilt
    this.bankAngle = 0;
    this.targetBankAngle = 0;

    this.initWarpStreakSystem();
    this.bindEvents();
  }

  setShip(shipConfig) {
    this.shipConfig = shipConfig;
  }

  setPowerAllocation(engines, shields, weapons) {
    this.powerEngines = engines;
    this.powerShields = shields;
    this.powerWeapons = weapons;
  }

  /**
   * Initialize hyper-speed warp streak lines in front of ship
   */
  initWarpStreakSystem() {
    const count = 350;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 6); // 2 points per line

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 600;
      const y = (Math.random() - 0.5) * 400;
      const z = -Math.random() * 800;

      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;

      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z - 20;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });

    this.warpStreaks = new THREE.LineSegments(geom, mat);
    this.camera.add(this.warpStreaks); // Attach to camera so streaks move with player
    this.scene.add(this.camera);
  }

  bindEvents() {
    this.onKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'KeyQ':
          this.keys.rollLeft = true;
          break;
        case 'KeyE':
          this.keys.rollRight = true;
          break;
        case 'Space':
          this.keys.boost = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.boost = true;
          break;
      }
    };

    this.onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'KeyQ':
          this.keys.rollLeft = false;
          break;
        case 'KeyE':
          this.keys.rollRight = false;
          break;
        case 'Space':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.boost = false;
          break;
      }
    };

    this.onMouseDown = (e) => {
      if (e.button === 0 && !e.target.closest('.interactive-hud')) {
        this.mouse.isDown = true;
        this.mouse.startX = e.clientX;
        this.mouse.startY = e.clientY;
      }
    };

    this.onMouseMove = (e) => {
      this.mouse.rawX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.rawY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.mouse.isDown) {
        this.mouse.deltaX = (e.clientX - this.mouse.startX) * 0.0035;
        this.mouse.deltaY = (e.clientY - this.mouse.startY) * 0.0035;
      } else {
        // Subtle flight stick cursor steering
        this.mouse.deltaX = this.mouse.rawX * 0.015;
        this.mouse.deltaY = -this.mouse.rawY * 0.015;
      }
    };

    this.onMouseUp = () => {
      this.mouse.isDown = false;
      this.mouse.deltaX = 0;
      this.mouse.deltaY = 0;
    };

    this.onWheel = (e) => {
      if (e.target.closest('.scrollable-panel')) return;
      this.targetThrottle = Math.min(Math.max(this.targetThrottle - e.deltaY * 0.001, 0), 1.0);
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('wheel', this.onWheel, { passive: true });
  }

  /**
   * Initiate cinematic hyper-warp jump towards a celestial target coordinate
   * @param {THREE.Vector3} targetCoord
   * @param {Function} onComplete
   */
  warpToCoordinates(targetCoord, onComplete) {
    if (this.isWarpingToTarget) return;
    this.isWarpingToTarget = true;

    if (this.soundEngine) {
      this.soundEngine.playWarpJump();
    }

    // Calculate arrival position (offset slightly from planet center so we don't land inside it)
    const direction = new THREE.Vector3().subVectors(targetCoord, this.camera.position).normalize();
    const arrivalPos = targetCoord.clone().sub(direction.clone().multiplyScalar(90));

    // Align camera rotation towards destination first
    const lookAtMatrix = new THREE.Matrix4();
    lookAtMatrix.lookAt(this.camera.position, targetCoord, new THREE.Vector3(0, 1, 0));
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix);

    const tl = gsap.timeline({
      onComplete: () => {
        this.isWarpingToTarget = false;
        this.throttle = 0.15;
        this.targetThrottle = 0.15;
        if (onComplete) onComplete();
      },
    });

    // 1. Align & Charge Warp
    tl.to(this.camera.quaternion, {
      x: targetQuat.x,
      y: targetQuat.y,
      z: targetQuat.z,
      w: targetQuat.w,
      duration: 0.8,
      ease: 'power2.inOut',
    });

    // 2. Warp Streaks Surge & FOV distortion
    tl.to(this.warpStreaks.material, { opacity: 0.95, duration: 0.4 }, '-=0.2');
    tl.to(this.camera, { fov: 95, duration: 0.5, onUpdate: () => this.camera.updateProjectionMatrix() }, '-=0.4');

    // 3. Hyperspace Translation
    tl.to(this.camera.position, {
      x: arrivalPos.x,
      y: arrivalPos.y,
      z: arrivalPos.z,
      duration: 2.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.position.copy(this.camera.position);
      },
    });

    // 4. Deceleration & Normalization
    tl.to(this.warpStreaks.material, { opacity: 0.0, duration: 0.6 }, '-=0.5');
    tl.to(this.camera, { fov: 65, duration: 0.8, ease: 'power2.out', onUpdate: () => this.camera.updateProjectionMatrix() }, '-=0.6');
  }

  /**
   * Main per-frame flight physics integration loop
   * @param {number} delta
   * @param {Object} shipStats
   * @returns {Object} current flight telemetry
   */
  update(delta, shipStats) {
    if (this.isWarpingToTarget) {
      return {
        speed: 9.9,
        throttle: 1.0,
        isBoosting: true,
        coords: this.camera.position,
        fuelBurn: 0.15 * delta,
      };
    }

    const maxSpeed = (shipStats?.maxSpeed || 4.0) * this.powerEngines;
    const accel = (shipStats?.accel || 0.06) * this.powerEngines;
    const turnRate = (shipStats?.turnRate || 0.03) * (this.powerEngines * 0.5 + 0.5);

    // Throttle integration
    if (this.keys.forward) {
      this.targetThrottle = Math.min(this.targetThrottle + accel * 1.5, 1.0);
    } else if (this.keys.backward) {
      this.targetThrottle = Math.max(this.targetThrottle - accel * 1.5, -0.3);
    }

    // Boost toggle
    this.isBoosting = this.keys.boost;
    const boostMultiplier = this.isBoosting ? 2.2 : 1.0;

    // Smooth throttle lerp
    this.throttle += (this.targetThrottle - this.throttle) * 0.08;
    this.speed = this.throttle * maxSpeed * boostMultiplier;

    // Angular steering (Pitch, Yaw, Roll)
    let pitchDelta = -this.mouse.deltaY * turnRate * 35 * delta;
    let yawDelta = -this.mouse.deltaX * turnRate * 35 * delta;
    let rollDelta = 0;

    if (this.keys.rollLeft) rollDelta += turnRate * 60 * delta;
    if (this.keys.rollRight) rollDelta -= turnRate * 60 * delta;

    // Auto-bank camera slightly into yaw turns
    this.targetBankAngle = -this.mouse.deltaX * 0.45;
    this.bankAngle += (this.targetBankAngle - this.bankAngle) * 0.06;

    // Apply rotation quaternions
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitchDelta);
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawDelta);
    const rollQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rollDelta + this.bankAngle * 0.02);

    this.camera.quaternion.multiply(yawQuat);
    this.camera.quaternion.multiply(pitchQuat);
    this.camera.quaternion.multiply(rollQuat);

    // Forward direction vector
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

    // Lateral strafe keys
    if (this.keys.left) this.camera.position.addScaledVector(right, -maxSpeed * 30 * delta);
    if (this.keys.right) this.camera.position.addScaledVector(right, maxSpeed * 30 * delta);

    // Forward thrust velocity
    this.camera.position.addScaledVector(forward, this.speed * 85 * delta);
    this.position.copy(this.camera.position);

    // Sound engine updates
    if (this.soundEngine) {
      this.soundEngine.updateEngineSpeed(Math.abs(this.speed), this.isBoosting);
    }

    // Warp streaks visual opacity
    if (this.warpStreaks) {
      const streakOpacity = this.isBoosting ? 0.75 : Math.max(0, (this.speed - 3.0) * 0.35);
      this.warpStreaks.material.opacity = THREE.MathUtils.lerp(this.warpStreaks.material.opacity, streakOpacity, 0.1);
    }

    // Fuel consumption rate
    const fuelBurn = (Math.abs(this.throttle) * 0.03 + (this.isBoosting ? 0.08 : 0)) * delta;

    return {
      speed: Math.abs(this.speed),
      throttle: this.throttle,
      isBoosting: this.isBoosting,
      coords: this.camera.position,
      forwardDir: forward,
      rightDir: right,
      fuelBurn: fuelBurn,
    };
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('wheel', this.onWheel);
  }
}
