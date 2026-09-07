/**
 * Starfield OS - 3D Constellation Line Renderer
 * Draws glowing 3D constellation vector paths and travelling energy pulses between celestial nodes.
 */

/* global THREE */

export class ConstellationLines {
  /**
   * @param {Array} constellations - Constellation definitions from universeData.js
   * @param {Array} celestialNodes - Array of CelestialNode instances
   * @param {THREE.Scene} scene
   */
  constructor(constellations, celestialNodes, scene) {
    this.constellations = constellations;
    this.celestialNodes = celestialNodes;
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'constellation_lines';

    this.lineSegments = [];
    this.pulses = [];

    this.buildConstellationMesh();
    this.scene.add(this.group);
  }

  buildConstellationMesh() {
    // Map node id to node instance
    const nodeMap = new Map();
    this.celestialNodes.forEach(node => {
      nodeMap.set(node.data.id, node);
    });

    this.constellations.forEach(c => {
      const color = new THREE.Color(c.color);
      const points = [];

      for (let i = 0; i < c.nodeIds.length - 1; i++) {
        const n1 = nodeMap.get(c.nodeIds[i]);
        const n2 = nodeMap.get(c.nodeIds[i + 1]);
        if (n1 && n2) {
          const p1 = new THREE.Vector3(n1.data.coordinates.x, n1.data.coordinates.y, n1.data.coordinates.z);
          const p2 = new THREE.Vector3(n2.data.coordinates.x, n2.data.coordinates.y, n2.data.coordinates.z);
          points.push(p1, p2);

          this.lineSegments.push({
            p1,
            p2,
            constellationId: c.id,
            color: c.color,
          });

          // Energy pulse photon
          const pulseMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
          });
          const pulseMesh = new THREE.Mesh(new THREE.SphereGeometry(3.5, 12, 12), pulseMat);
          this.group.add(pulseMesh);

          this.pulses.push({
            mesh: pulseMesh,
            p1,
            p2,
            progress: Math.random(),
            speed: 0.12 + Math.random() * 0.08,
          });
        }
      }

      if (points.length > 0) {
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          linewidth: 2,
        });
        const lines = new THREE.LineSegments(geom, mat);
        lines.userData = { constellationId: c.id };
        this.group.add(lines);
      }
    });
  }

  /**
   * Update pulse positions along lines
   * @param {number} delta
   */
  update(delta) {
    this.pulses.forEach(pulse => {
      pulse.progress += pulse.speed * delta;
      if (pulse.progress > 1.0) {
        pulse.progress = 0.0;
      }
      pulse.mesh.position.lerpVectors(pulse.p1, pulse.p2, pulse.progress);
    });
  }

  /**
   * Highlight a specific constellation
   */
  highlightConstellation(constellationId, active = true) {
    this.group.children.forEach(child => {
      if (child.userData && child.userData.constellationId === constellationId) {
        if (child.material) {
          child.material.opacity = active ? 0.95 : 0.45;
        }
      }
    });
  }
}
