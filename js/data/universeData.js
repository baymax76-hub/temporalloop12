/**
 * Starfield OS - Universe Lore & Configuration Data
 * Rich sci-fi multiverse lore, celestial nodes, ship specifications, and constellation topology.
 */

export const SHIPS = {
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard Interceptor',
    class: 'Fast Recon & Precision Strike',
    tagline: 'High-mobility tactical fighter with precision sub-space navigation.',
    theme: 'vanguard',
    colors: {
      primary: '#00f0ff',
      secondary: '#0077ff',
      accent: '#38bdf8',
      glow: 'rgba(0, 240, 255, 0.4)',
      bgGlass: 'rgba(3, 18, 38, 0.75)',
      border: 'rgba(0, 240, 255, 0.35)',
    },
    specs: {
      maxSpeed: 4.8,
      accel: 0.08,
      turnRate: 0.038,
      hullMax: 100,
      shieldMax: 120,
      fuelMax: 100,
      fuelBurnRate: 0.04,
      laserDamage: 35,
      laserCooldown: 220, // ms
    },
    specialSystem: {
      name: 'Chrono-Boost Drive',
      description: 'Instant 300% sub-light burst with temporal stabilization.',
      key: 'SPACE',
    },
    cockpitStyle: {
      reticleShape: 'crosshair-circle',
      frameStyle: 'sleek-aerospace',
      hudFont: 'Orbitron, sans-serif',
      glowClass: 'shadow-[0_0_20px_rgba(0,240,255,0.5)]',
    },
    lore: 'Built by the Helios Vanguard Fleet during the final hours of the Siege of Vega. Designed for extreme evasive maneuvers in debris-heavy fracture zones.',
  },

  aegis: {
    id: 'aegis',
    name: 'Aegis Dreadnought',
    class: 'Heavy Armored Bastion',
    tagline: 'Super-heavy hull plating with reinforced kinetic dampening and EMP discharge.',
    theme: 'aegis',
    colors: {
      primary: '#ffaa00',
      secondary: '#ff5500',
      accent: '#fbbf24',
      glow: 'rgba(255, 170, 0, 0.4)',
      bgGlass: 'rgba(38, 22, 3, 0.8)',
      border: 'rgba(255, 170, 0, 0.4)',
    },
    specs: {
      maxSpeed: 3.4,
      accel: 0.045,
      turnRate: 0.024,
      hullMax: 220,
      shieldMax: 200,
      fuelMax: 160,
      fuelBurnRate: 0.03,
      laserDamage: 65,
      laserCooldown: 400, // ms
    },
    specialSystem: {
      name: 'Kinetic EMP Shockwave',
      description: '360-degree ion discharge neutralizing asteroid hazards and cosmic dampeners.',
      key: 'R',
    },
    cockpitStyle: {
      reticleShape: 'heavy-hexagon',
      frameStyle: 'industrial-armored',
      hudFont: 'Rajdhani, sans-serif',
      glowClass: 'shadow-[0_0_20px_rgba(255,170,0,0.5)]',
    },
    lore: 'Forged in the magnetic foundries of Titan. The Aegis was engineered to withstand direct singularity tidal shears and hold defensive perimeters across collapsing dimensional rifts.',
  },

  quantum: {
    id: 'quantum',
    name: 'Quantum Pathfinder',
    class: 'Experimental Multiverse Explorer',
    tagline: 'Dimensional slipstream drive with long-range tachyonic resonance scanners.',
    theme: 'quantum',
    colors: {
      primary: '#c084fc',
      secondary: '#e879f9',
      accent: '#a855f7',
      glow: 'rgba(192, 132, 252, 0.4)',
      bgGlass: 'rgba(28, 5, 42, 0.78)',
      border: 'rgba(192, 132, 252, 0.38)',
    },
    specs: {
      maxSpeed: 4.2,
      accel: 0.065,
      turnRate: 0.032,
      hullMax: 90,
      shieldMax: 150,
      fuelMax: 130,
      fuelBurnRate: 0.025,
      laserDamage: 45,
      laserCooldown: 280, // ms
    },
    specialSystem: {
      name: 'Multiversal Resonance Scanner',
      description: 'Emits a tachyonic pulse that reveals hidden audio logs and dimensional fissures.',
      key: 'T',
    },
    cockpitStyle: {
      reticleShape: 'fractal-orbital',
      frameStyle: 'nanotech-crystalline',
      hudFont: 'Orbitron, sans-serif',
      glowClass: 'shadow-[0_0_20px_rgba(192,132,252,0.5)]',
    },
    lore: 'Constructed by the Singularity Collective using chronal resonance crystals salvaged from the Void of Eternity. It does not simply fly through space; it bends dimensions around its wake.',
  },
};

export const CONSTELLATIONS = [
  {
    id: 'phoenix_core',
    name: 'The Phoenix Core',
    color: '#ff4d4d',
    glowColor: 'rgba(255, 77, 77, 0.5)',
    description: 'A cluster of hyper-energetic stars forged in the aftermath of the first dimensional collapse.',
    nodeIds: ['aethelgard', 'vespera', 'solaris'],
  },
  {
    id: 'chronos_arc',
    name: 'The Chronos Arc',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    description: 'A sweeping bridge of time-dilated worlds bending spacetime along a gravitational fault line.',
    nodeIds: ['chronos', 'nyx_station', 'zenith'],
  },
  {
    id: 'elysium_nexus',
    name: 'Elysium Nexus',
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.5)',
    description: 'The central harmonic grid connecting broken realities back to the pristine prime timeline.',
    nodeIds: ['elysium', 'astral_nexus', 'aethelgard', 'zenith'],
  },
];

export const CELESTIAL_NODES = [
  {
    id: 'aethelgard',
    name: 'Aethelgard Prime',
    classification: 'Crystalline Super-Earth',
    constellation: 'The Phoenix Core',
    coordinates: { x: -350, y: 120, z: -600 },
    radius: 34,
    color: '#38bdf8',
    emissive: '#0284c7',
    atmosphereColor: '#7dd3fc',
    hasRings: true,
    ringColor: '#0ea5e9',
    ringRadius: 65,
    textureType: 'crystal',
    status: 'Survivors Detected',
    faction: 'Aethelgard High Council',
    dimensionalFrequency: '142.880 GHz [Stable]',
    lore: `Aethelgard Prime was once the pinnacle of crystalline architectural science in Universe Alpha-7. When the Multiversal War fractured the timeline, the planet's atmospheric moisture crystallized into perpetual floating prism arrays that refract starlight into quantum power conduits.
    
    Sub-space telemetry indicates automated emergency spires are still broadcasting survivor telemetry to any passing exploratory vessel.`,
    audioLog: {
      author: 'Archivist Lyra Vance',
      timestamp: 'Cycle 944.12 // Post-Fracture',
      transcript: '"If your receiver picks up this harmonic: we managed to seal the subterranean vaults before the gravity storm inverted the lower hemisphere. The archives are intact. Connect the constellation coordinates — we need a stable slipstream bridge to survive."',
    },
    rewards: {
      fuelBonus: 50,
      loreDiscovered: 'Aethelgard Chrono-Prism Archive',
      connectionUnlocks: ['vespera', 'astral_nexus'],
    },
  },

  {
    id: 'chronos',
    name: 'Chronos VII',
    classification: 'Time-Dilated Ocean World',
    constellation: 'The Chronos Arc',
    coordinates: { x: 520, y: -180, z: -750 },
    radius: 40,
    color: '#06b6d4',
    emissive: '#0891b2',
    atmosphereColor: '#22d3ee',
    hasRings: false,
    textureType: 'oceanic',
    status: 'Temporal Anomaly',
    faction: 'Temporal Cartographers',
    dimensionalFrequency: '019.412 GHz [Dilated 1:60]',
    lore: `Caught inside the gravitational wake of a dormant micro-singularity, Chronos VII experiences severe time dilation: 1 hour in low orbit equates to 7 years in the deep galactic rim.
    
    Its sapphire-blue hyper-dense oceans conceal submerged research monoliths that possess the original temporal stabilizers needed to calibrate jump drives.`,
    audioLog: {
      author: 'Commander Thorne',
      timestamp: 'Cycle 108.04 // Time Drift',
      transcript: '"Our chronometers are spinning backwards while our sensors show the fleet burn out in seconds outside the gravity well. To any ship entering our orbit: match our drift velocity or the temporal shear will tear your inertial compensators apart."',
    },
    rewards: {
      fuelBonus: 40,
      loreDiscovered: 'Temporal Dilation Stabilizer Schema',
      connectionUnlocks: ['nyx_station'],
    },
  },

  {
    id: 'vespera',
    name: 'Vespera Core',
    classification: 'Molten Forge Star-Planet',
    constellation: 'The Phoenix Core',
    coordinates: { x: -650, y: -240, z: -350 },
    radius: 48,
    color: '#f97316',
    emissive: '#c2410c',
    atmosphereColor: '#fdba74',
    hasRings: true,
    ringColor: '#ea580c',
    ringRadius: 90,
    textureType: 'magma',
    status: 'High Thermal Signature',
    faction: 'Automata Forge Legion',
    dimensionalFrequency: '891.004 GHz [Thermal High]',
    lore: `A volcanic planetary forge where continents of liquid obsidian drift across a glowing mantle of hyper-refined plasma. The automated foundries on the surface have operated without human intervention for three centuries, continuously constructing antimatter shielding lattices.
    
    Harvesting thermal corona flares here can instantly supercharge a vessel's energy capacitors.`,
    audioLog: {
      author: 'Forge-Mind Sigma-9',
      timestamp: 'Continuous Cycle // Auto-Broadcast',
      transcript: '"Directive 004 remains active: Maintain orbital kinetic armor fabrication. Unknown vessel detected in local sector. State clearance code or receive thermal radiation warning."',
    },
    rewards: {
      fuelBonus: 80,
      loreDiscovered: 'Hyper-Dense Plasma Forge Blueprint',
      connectionUnlocks: ['solaris'],
    },
  },

  {
    id: 'nyx_station',
    name: 'Nyx Station Alpha',
    classification: 'Derelict Multiverse Ark',
    constellation: 'The Chronos Arc',
    coordinates: { x: 700, y: 280, z: -400 },
    radius: 26,
    color: '#94a3b8',
    emissive: '#475569',
    atmosphereColor: '#cbd5e1',
    hasRings: false,
    textureType: 'metallic',
    status: 'Derelict / Power Low',
    faction: 'United Colony Fleet (Lost)',
    dimensionalFrequency: '003.771 GHz [Pulsing Beacon]',
    lore: `The colossal flagship ark Nyx Alpha was meant to ferry three million souls out of Dimension Delta during the Great Tear. Its engines suffered a hyper-dimensional misfire, leaving it suspended in static orbit between parallel worldlines.
    
    Its emergency emergency beacon still pulses every 4.2 seconds with encoded biological databanks.`,
    audioLog: {
      author: 'Chief Medical Officer Karen Chen',
      timestamp: 'Emergency Log // Black Box Fragment',
      transcript: '"The stasis pods are holding at 98% efficiency, but the life support reactors are bleeding coolant into the vacuum. We locked the navigational beacon to point towards the Astral Nexus. If you find us, wake the navigation crew first."',
    },
    rewards: {
      fuelBonus: 45,
      loreDiscovered: 'Nyx Colony Cryo-Archive',
      connectionUnlocks: ['zenith'],
    },
  },

  {
    id: 'elysium',
    name: 'Elysium Singularity',
    classification: 'Quantum Gateway Horizon',
    constellation: 'Elysium Nexus',
    coordinates: { x: 100, y: 450, z: -850 },
    radius: 42,
    color: '#a855f7',
    emissive: '#7e22ce',
    atmosphereColor: '#d8b4fe',
    hasRings: true,
    ringColor: '#9333ea',
    ringRadius: 80,
    textureType: 'quantum',
    status: 'Active Multiverse Gateway',
    faction: 'Unknown Precursor Entities',
    dimensionalFrequency: '999.999 GHz [Infinite Resonance]',
    lore: `The crowning wonder of the deep cosmos: a stable Kerr-metric singularity encased inside a giant artificial Dyson Ring. It functions as the central multiversal transit corridor, allowing instantaneous passage across divergent universe filaments.
    
    Interfacing with its resonant quantum field unlocks real-time star coordinates across the entire galaxy.`,
    audioLog: {
      author: 'Precursor Echo // Translated',
      timestamp: 'Epoch Unknown',
      transcript: '"Form is transient; connection is eternal. We woven the constellations not as boundaries, but as bridges. Align the triad of Phoenix, Chronos, and Elysium, and the pathway to the Prime Universe shall unseal."',
    },
    rewards: {
      fuelBonus: 100,
      loreDiscovered: 'Elysium Key Matrix',
      connectionUnlocks: ['astral_nexus', 'aethelgard'],
    },
  },

  {
    id: 'solaris',
    name: 'Solaris Obelisk',
    classification: 'Dyson Swarm Relic Planet',
    constellation: 'The Phoenix Core',
    coordinates: { x: -480, y: -450, z: -800 },
    radius: 36,
    color: '#eab308',
    emissive: '#ca8a04',
    atmosphereColor: '#fef08a',
    hasRings: true,
    ringColor: '#eab308',
    ringRadius: 70,
    textureType: 'solar',
    status: 'Broadcasting Sol Frequency',
    faction: 'Solar Guardians',
    dimensionalFrequency: '540.100 GHz [Harmonic Sun]',
    lore: `Constructed around an artificial micro-sun, Solaris Obelisk shines with a golden luminescence that pierces deep-space nebulae for five hundred lightyears. 
    
    Ancient solar arrays capture quantum neutrinos, providing infinite power to the planetary shield relays that hold the surrounding asteroid belt in geometric equilibrium.`,
    audioLog: {
      author: 'Solar Guardian Aria',
      timestamp: 'Solar Log 771',
      transcript: '"The cosmic dust storm from the fracture has partially blinded our solar prisms, but the light still burns. If your engines are starving for antimatter, draw near our corona shields and initiate harmonic extraction."',
    },
    rewards: {
      fuelBonus: 70,
      loreDiscovered: 'Solaris Neutrino Capacitor',
      connectionUnlocks: ['vespera', 'aethelgard'],
    },
  },

  {
    id: 'zenith',
    name: 'Zenith Fracture',
    classification: 'Shattered Moon in Stasis',
    constellation: 'The Chronos Arc',
    coordinates: { x: 380, y: -380, z: -550 },
    radius: 30,
    color: '#ec4899',
    emissive: '#db2777',
    atmosphereColor: '#f472b6',
    hasRings: false,
    textureType: 'fractured',
    status: 'Stasis Field Active',
    faction: 'Void Harvesters',
    dimensionalFrequency: '333.109 GHz [Phase Locked]',
    lore: `During the climax of the Multiversal War, Zenith was split into hundreds of megalithic fragments by a kinetic tachyon cannon. Before the moon could disperse into a ring of dust, an emergency stasis field was activated, freezing every tectonic shard in mid-explosion.
    
    Pilots can weave their spacecraft through the hovering crystal canyons of the shattered moon.`,
    audioLog: {
      author: 'Chief Engineer Kaelen Voss',
      timestamp: 'Final Transmission // Hour of Fracturing',
      transcript: '"The stasis capacitors will hold for another hundred thousand cycles. We stored the dimensional navigational core inside the central fracture cavern. Navigate carefully — one miscalculated thruster burst could trigger a catastrophic phase collapse."',
    },
    rewards: {
      fuelBonus: 60,
      loreDiscovered: 'Stasis Field Harmonic Resonator',
      connectionUnlocks: ['astral_nexus', 'chronos'],
    },
  },

  {
    id: 'astral_nexus',
    name: 'Astral Nexus Prime',
    classification: 'Cosmic Constellation Core',
    constellation: 'Elysium Nexus',
    coordinates: { x: 0, y: 0, z: -1050 },
    radius: 56,
    color: '#8b5cf6',
    emissive: '#6d28d9',
    atmosphereColor: '#c4b5fd',
    hasRings: true,
    ringColor: '#7c3aed',
    ringRadius: 110,
    textureType: 'nexus',
    status: 'Universal Nexus Active',
    faction: 'The Multiverse Keepers',
    dimensionalFrequency: '777.777 GHz [Prime Harmony]',
    lore: `The heart of the known universe and the master coordinate node where all constellation lines converge. Here, the boundary between space, time, and consciousness becomes porous.
    
    Reaching the Astral Nexus and lighting all constellation links restores harmonic equilibrium to the fractured cosmos, opening the gateway back to the unbroken prime dimension.`,
    audioLog: {
      author: 'The Architect of Realities',
      timestamp: 'Zero Hour // Prime Cycle',
      transcript: '"Pilot of the Broken Void: You have traversed the fallen stars, bridged the severed constellations, and pieced together the memories of a million lost souls. The gate to the Prime Universe is ready. Step through, and let the cosmos be reborn."',
    },
    rewards: {
      fuelBonus: 100,
      loreDiscovered: 'Universal Master Codex',
      connectionUnlocks: ['elysium', 'aethelgard', 'chronos', 'vespera'],
    },
  },
];
