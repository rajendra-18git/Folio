'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Cluster definitions for the 3D Vector Space
export interface VectorCluster {
  id: string;
  name: string;
  category: string;
  color: number;
  hexColor: string;
  count: number;
  sampleQuery: string;
  extractedPassage: string;
  cosSim: string;
  centroid: [number, number, number];
}

export const VECTOR_CLUSTERS: VectorCluster[] = [
  {
    id: 'biomed',
    name: 'Biomedical Clinical Protocols',
    category: 'BioASQ / Clinical Trial Records',
    color: 0x60d5fa, // Glacier Cyan
    hexColor: '#60D5FA',
    count: 1420,
    sampleQuery: 'Efficacy of PD-1 checkpoint inhibitors in combination therapy',
    extractedPassage:
      'In a randomized phase 3 trial (N=724), progression-free survival improved by 41% (HR 0.59, 95% CI 0.47-0.74, p<0.001) compared to standard chemotherapeutic protocols.',
    cosSim: '0.964',
    centroid: [3.5, 1.8, -1.2],
  },
  {
    id: 'finance',
    name: 'SEC Financial Disclosures',
    category: 'Corporate 10-K Filings & Audits',
    color: 0x38bdf8, // Electric Ice
    hexColor: '#38BDF8',
    count: 980,
    sampleQuery: 'Reconciliation of non-GAAP operating margins across FY25',
    extractedPassage:
      'Free cash flow conversion stood at 108% of net income, driven by a 140 bps contraction in working capital requirements across European subsidiaries.',
    cosSim: '0.948',
    centroid: [-3.2, -1.5, 1.6],
  },
  {
    id: 'nlp',
    name: 'Transformer Model Architectures',
    category: 'Machine Learning & NLP Research',
    color: 0xadd8e6, // Icy Blue
    hexColor: '#ADD8E6',
    count: 2150,
    sampleQuery: 'Multi-head rotary position embedding extrapolation beyond 32k tokens',
    extractedPassage:
      'Applying YaRN scaled frequencies preserves perplexity across context lengths up to 128k tokens with zero additional fine-tuning steps.',
    cosSim: '0.982',
    centroid: [1.2, -2.8, -2.2],
  },
  {
    id: 'law',
    name: 'Commercial Governance NDAs',
    category: 'Corporate Contracts & SLA Precedents',
    color: 0x6d8196, // Slate Gray
    hexColor: '#6D8196',
    count: 670,
    sampleQuery: 'Standard limitation of liability caps in enterprise cloud SLAs',
    extractedPassage:
      'Neither party aggregate liability under section 14 shall exceed twelve (12) times the monthly fees paid in the immediately preceding billing period.',
    cosSim: '0.931',
    centroid: [-2.4, 2.6, 0.5],
  },
];

// Global Event Bridge to communicate between scroll / DOM cards and Persistent Canvas
export function setStoryStep(step: number) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('documind:step', { detail: { step } }));
  }
}

export function focusVectorCluster(clusterId: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('documind:cluster', { detail: { clusterId } }));
  }
}

export function PersistentCanvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // Detect low-end / mobile for adaptive rendering
    const pointCount = isMobile ? 1400 : 5200;

    // 1. Renderer Setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance',
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Scene & Camera - Frozen Lake Arctic Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040914, 0.026);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    camera.position.set(0, 0, 14);

    // 3. Lighting Setup - Cool Arctic Glacial
    const ambientLight = new THREE.AmbientLight(0x07152b, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 3.6);
    keyLight.position.set(8, 10, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60d5fa, 2.6);
    rimLight.position.set(-8, -6, 6);
    scene.add(rimLight);

    const cyanPointLight = new THREE.PointLight(0xadd8e6, 4.5, 25);
    cyanPointLight.position.set(0, 1, 3);
    scene.add(cyanPointLight);

    // =========================================================================
    // A. BACKGROUND PERSPECTIVE GRID FLOOR (Frozen Lake Lines)
    // =========================================================================
    const gridHelper = new THREE.GridHelper(80, 50, 0x38bdf8, 0x091c36);
    gridHelper.position.y = -6.5;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.38;
    scene.add(gridHelper);

    // =========================================================================
    // B. BACKGROUND STARFIELD (Frosted Snow, Icy Blue, Slate Gray, Glacier Cyan)
    // =========================================================================
    const starCount = isMobile ? 400 : 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x60d5fa), // Glacier Cyan
      new THREE.Color(0xadd8e6), // Icy Blue
      new THREE.Color(0x6d8196), // Slate Gray
      new THREE.Color(0xfffafa), // Snow White
      new THREE.Color(0x38bdf8), // Electric Ice
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 70;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      const col = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // =========================================================================
    // C. HERO LAUNCH MOMENT OBJECTS (Frosted Glass & Glacier Core)
    // =========================================================================
    const heroGroup = new THREE.Group();
    heroGroup.position.set(isMobile ? 0 : 3.2, isMobile ? -0.5 : 0.3, isMobile ? -2.2 : 0);
    if (isMobile) {
      heroGroup.scale.setScalar(0.6);
    }
    scene.add(heroGroup);

    // 1. Point of light expanding into Glowing Neural-Lattice Sphere
    const latticeGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: 0x60d5fa,
      wireframe: true,
      transparent: true,
      opacity: isMobile ? 0.22 : 0.48,
    });
    const neuralLatticeSphere = new THREE.Mesh(latticeGeo, latticeMat);
    heroGroup.add(neuralLatticeSphere);

    // Inner bright expanding point-core (Snow White)
    const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfffafa,
    });
    const corePointMesh = new THREE.Mesh(coreGeo, coreMat);
    heroGroup.add(corePointMesh);

    // 2. Floating Stack of Frosted Glass Document Pages (3 sheets)
    const glassDocStackGroup = new THREE.Group();
    heroGroup.add(glassDocStackGroup);

    const sheetGeo = new THREE.PlaneGeometry(1.6, 2.2);
    const sheetMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffafa,
      transmission: 0.94,
      roughness: 0.06,
      ior: 1.54,
      thickness: 0.7,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      attenuationColor: new THREE.Color(0xadd8e6),
      attenuationDistance: 1.6,
    });

    const sheetEdgeMat = new THREE.LineBasicMaterial({
      color: 0x60d5fa,
      transparent: true,
      opacity: 0.88,
    });

    const docSheets: THREE.Group[] = [];
    const sheetConfigs = [
      { x: -0.2, y: 0.15, z: 0.4, rotZ: -0.1, rotY: 0.25 },
      { x: 0.0, y: -0.1, z: 0.0, rotZ: 0.04, rotY: 0.15 },
      { x: 0.25, y: -0.35, z: -0.4, rotZ: 0.18, rotY: 0.05 },
    ];

    sheetConfigs.forEach((cfg) => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(sheetGeo, sheetMat);
      g.add(m);

      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(sheetGeo), sheetEdgeMat);
      g.add(edge);

      g.position.set(cfg.x, cfg.y, cfg.z);
      g.rotation.set(0.1, cfg.rotY, cfg.rotZ);

      glassDocStackGroup.add(g);
      docSheets.push(g);
    });

    // 3. Glowing Data Points flowing out into Vector-Embedding Cloud
    const streamParticleCount = 80;
    const streamGeo = new THREE.BufferGeometry();
    const streamPositions = new Float32Array(streamParticleCount * 3);
    const streamInitial: [number, number, number][] = [];

    for (let i = 0; i < streamParticleCount; i++) {
      const px = (Math.random() - 0.5) * 1.5;
      const py = (Math.random() - 0.5) * 2.0;
      const pz = (Math.random() - 0.5) * 0.8;
      streamPositions[i * 3] = px;
      streamPositions[i * 3 + 1] = py;
      streamPositions[i * 3 + 2] = pz;
      streamInitial.push([px, py, pz]);
    }

    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
    const streamMat = new THREE.PointsMaterial({
      color: 0x60d5fa,
      size: 0.07,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const streamPoints = new THREE.Points(streamGeo, streamMat);
    heroGroup.add(streamPoints);

    // =========================================================================
    // D. SCROLL-DRIVEN HOW-IT-WORKS 4-STEP OBJECTS
    // =========================================================================
    const storyGroup = new THREE.Group();
    storyGroup.position.set(0, -18, 0);
    scene.add(storyGroup);

    // 1. Documents flying in and snapping into a stack (Step 1)
    const flyInDocs: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(sheetGeo, sheetMat);
      storyGroup.add(mesh);
      flyInDocs.push(mesh);
    }

    // 2. Chunks breaking out into glowing vector nodes (Step 2)
    const chunkNodeCount = 28;
    const chunkNodeGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const chunkNodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const chunkNodes: THREE.Mesh[] = [];

    for (let i = 0; i < chunkNodeCount; i++) {
      const cMesh = new THREE.Mesh(chunkNodeGeo, chunkNodeMat);
      storyGroup.add(cMesh);
      chunkNodes.push(cMesh);
    }

    // 3. Query Ray shooting through point cloud (Step 3)
    const rayGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 8);
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0x60d5fa,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const queryRay = new THREE.Mesh(rayGeo, rayMat);
    queryRay.rotation.z = Math.PI / 3;
    queryRay.visible = false;
    storyGroup.add(queryRay);

    // Cosine similarity highlighted node
    const highlightedNodeGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const highlightedNodeMat = new THREE.MeshBasicMaterial({
      color: 0xadd8e6,
      wireframe: true,
    });
    const highlightedNodeMesh = new THREE.Mesh(highlightedNodeGeo, highlightedNodeMat);
    highlightedNodeMesh.visible = false;
    storyGroup.add(highlightedNodeMesh);

    // 4. Cited Page Proof unfolded (Step 4)
    const pageProofMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 3.8),
      new THREE.MeshStandardMaterial({
        color: 0x07152b,
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
        roughness: 0.2,
      })
    );
    const pageProofEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.8, 3.8)),
      new THREE.LineBasicMaterial({ color: 0x60d5fa })
    );
    pageProofMesh.add(pageProofEdge);
    pageProofMesh.visible = false;
    storyGroup.add(pageProofMesh);

    // =========================================================================
    // E. 5,000+ POINT INSTANCED VECTOR GALAXY (Frozen Lake Palette)
    // =========================================================================
    const vectorSpaceGroup = new THREE.Group();
    vectorSpaceGroup.position.set(0, -36, 0);
    scene.add(vectorSpaceGroup);

    const pointSphereGeo = new THREE.SphereGeometry(0.042, 6, 6);
    const instancedMat = new THREE.MeshBasicMaterial({
      color: 0xfffafa,
    });
    const instancedPoints = new THREE.InstancedMesh(pointSphereGeo, instancedMat, pointCount);
    vectorSpaceGroup.add(instancedPoints);

    const dummy = new THREE.Object3D();
    const clusterPositions: THREE.Vector3[] = [];

    // Assign points to 4 colored clusters
    for (let i = 0; i < pointCount; i++) {
      const clusterIdx = i % VECTOR_CLUSTERS.length;
      const cluster = VECTOR_CLUSTERS[clusterIdx];
      const centroid = new THREE.Vector3(...cluster.centroid);

      // Gaussian-like dispersion around cluster centroid
      const u = Math.random();
      const v = Math.random();
      const spread = 2.4 * Math.sqrt(-2.0 * Math.log(u || 0.001));
      const theta = 2.0 * Math.PI * v;
      const phi = (Math.random() - 0.5) * Math.PI;

      const pos = new THREE.Vector3(
        centroid.x + spread * Math.cos(theta) * Math.cos(phi),
        centroid.y + spread * Math.sin(phi),
        centroid.z + spread * Math.sin(theta) * Math.cos(phi)
      );

      dummy.position.copy(pos);
      dummy.scale.setScalar(0.7 + Math.random() * 0.8);
      dummy.updateMatrix();

      instancedPoints.setMatrixAt(i, dummy.matrix);
      instancedPoints.setColorAt(i, new THREE.Color(cluster.color));

      if (i < 300) {
        clusterPositions.push(pos.clone());
      }
    }
    instancedPoints.instanceMatrix.needsUpdate = true;
    if (instancedPoints.instanceColor) {
      instancedPoints.instanceColor.needsUpdate = true;
    }

    // Thin connecting lines to nearest neighbors
    const lineCoords: number[] = [];
    for (let i = 0; i < clusterPositions.length; i += 2) {
      for (let j = i + 1; j < Math.min(i + 8, clusterPositions.length); j++) {
        const d = clusterPositions[i].distanceTo(clusterPositions[j]);
        if (d < 1.8) {
          lineCoords.push(
            clusterPositions[i].x, clusterPositions[i].y, clusterPositions[i].z,
            clusterPositions[j].x, clusterPositions[j].y, clusterPositions[j].z
          );
        }
      }
    }

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
    });
    const connectingLines = new THREE.LineSegments(linesGeo, linesMat);
    vectorSpaceGroup.add(connectingLines);

    // =========================================================================
    // F. CONVERGENCE PORTAL (FINAL CTA - Frozen Singularity)
    // =========================================================================
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, -60, 0);
    scene.add(portalGroup);

    // Glowing Ring / Portal
    const ringGeo = new THREE.TorusGeometry(3.6, 0.06, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x60d5fa,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const portalRing = new THREE.Mesh(ringGeo, ringMat);
    portalGroup.add(portalRing);

    const innerRingGeo = new THREE.TorusGeometry(3.2, 0.04, 16, 80);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const innerPortalRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    portalGroup.add(innerPortalRing);

    // Singularity Convergence Particles
    const convCount = 180;
    const convGeo = new THREE.BufferGeometry();
    const convPos = new Float32Array(convCount * 3);
    for (let i = 0; i < convCount; i++) {
      const angle = (i / convCount) * Math.PI * 2;
      const radius = 3.6 + (Math.random() - 0.5) * 1.5;
      convPos[i * 3] = Math.cos(angle) * radius;
      convPos[i * 3 + 1] = Math.sin(angle) * radius;
      convPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    convGeo.setAttribute('position', new THREE.BufferAttribute(convPos, 3));
    const convMat = new THREE.PointsMaterial({
      color: 0xadd8e6,
      size: 0.09,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
    });
    const convPoints = new THREE.Points(convGeo, convMat);
    portalGroup.add(convPoints);

    // =========================================================================
    // MOUSE PARALLAX & SCROLL TRACKING (Smooth, Eased, Non-Disturbing)
    // =========================================================================
    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouseX = Math.max(-0.5, Math.min(0.5, nx * 0.5));
      targetMouseY = Math.max(-0.35, Math.min(0.35, ny * 0.35));
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Track active story step and targeted vector cluster
    let activeStoryStep = 1;
    let targetCameraCluster: THREE.Vector3 | null = null;

    const onStoryStepChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.step === 'number') {
        activeStoryStep = detail.step;
      }
    };

    const onClusterFocusChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.clusterId) {
        const found = VECTOR_CLUSTERS.find((c) => c.id === detail.clusterId);
        if (found) {
          targetCameraCluster = new THREE.Vector3(...found.centroid);
        }
      }
    };

    // Theme switching support for WebGL scene
    const applySceneTheme = (t: string) => {
      const isLightMode = t === 'light';
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color.setHex(isLightMode ? 0xF4F8FC : 0x040914);
        (scene.fog as THREE.FogExp2).density = isLightMode ? 0.022 : 0.026;
      }
      ambientLight.color.setHex(isLightMode ? 0xf8fafc : 0x07152b);
      ambientLight.intensity = isLightMode ? 2.4 : 1.8;

      keyLight.color.setHex(isLightMode ? 0x0284c7 : 0x38bdf8);
      rimLight.color.setHex(isLightMode ? 0x38bdf8 : 0x60d5fa);
      cyanPointLight.color.setHex(isLightMode ? 0x0ea5e9 : 0xadd8e6);

      gridHelper.traverse((child) => {
        if ((child as THREE.LineSegments).isLineSegments) {
          const mat = (child as THREE.LineSegments).material as THREE.LineBasicMaterial;
          mat.color.setHex(isLightMode ? 0x0284c7 : 0x38bdf8);
          mat.opacity = isLightMode ? 0.42 : 0.38;
        }
      });

      latticeMat.color.setHex(isLightMode ? 0x0284c7 : 0x60d5fa);
      latticeMat.opacity = isMobile ? (isLightMode ? 0.18 : 0.22) : (isLightMode ? 0.38 : 0.48);
      coreMat.color.setHex(isLightMode ? 0x0284c7 : 0xfffafa);

      sheetEdgeMat.color.setHex(isLightMode ? 0x0284c7 : 0x60d5fa);
      sheetMat.attenuationColor.setHex(isLightMode ? 0x38bdf8 : 0xadd8e6);

      streamMat.color.setHex(isLightMode ? 0x0284c7 : 0x60d5fa);
      starMat.opacity = isLightMode ? 0.45 : 0.78;

      portalRing.material && ((portalRing.material as THREE.MeshBasicMaterial).color.setHex(isLightMode ? 0x0284c7 : 0x60d5fa));
      innerPortalRing.material && ((innerPortalRing.material as THREE.MeshBasicMaterial).color.setHex(isLightMode ? 0x0ea5e9 : 0x38bdf8));
    };

    const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
    applySceneTheme(initialTheme);

    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.theme) {
        applySceneTheme(detail.theme);
      }
    };

    window.addEventListener('documind:step', onStoryStepChange);
    window.addEventListener('documind:cluster', onClusterFocusChange);
    window.addEventListener('documind:theme', onThemeChange);

    // Animation Loop
    let animId: number;
    const startTime = performance.now();
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      // Calculate total normalized page scroll
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const scrollFraction = Math.min(1, Math.max(0, currentScroll / maxScroll));

      // Damped smooth mouse parallax (gentle, non-intrusive)
      smoothMouseX += (targetMouseX - smoothMouseX) * 0.035;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.035;

      // Camera moves gracefully down the vertical scene story track
      const baseCameraY = -scrollFraction * 60;
      const targetCameraZ = 14 + Math.sin(scrollFraction * Math.PI) * 2.8;

      camera.position.y += (baseCameraY - camera.position.y) * 0.055;
      camera.position.x += (smoothMouseX * 0.65 - camera.position.x) * 0.045;
      camera.position.z += (targetCameraZ - camera.position.z) * 0.055;

      // Smooth lookAt target interpolation prevents camera snapping on section transition or cluster click
      if (targetCameraCluster && scrollFraction > 0.35 && scrollFraction < 0.78) {
        targetLookAt.copy(targetCameraCluster).add(vectorSpaceGroup.position);
      } else {
        targetLookAt.set(smoothMouseX * 0.25, camera.position.y, 0);
      }
      currentLookAt.lerp(targetLookAt, 0.05);
      camera.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);

      // Section visibility culling: prevents offscreen meshes from disturbing other sections & saves GPU cycles
      heroGroup.visible = scrollFraction < 0.24;
      storyGroup.visible = scrollFraction >= 0.12 && scrollFraction <= 0.62;
      vectorSpaceGroup.visible = scrollFraction >= 0.32 && scrollFraction <= 0.88;
      portalGroup.visible = scrollFraction >= 0.68;

      if (!prefersReducedMotion) {
        // Subtle forward drift of Grid Floor
        gridHelper.position.z = (elapsed * 0.7) % 2;

        // Subtle slow rotation of Starfield
        starField.rotation.y = elapsed * 0.012;

        // ---------------- HERO ANIMATIONS ----------------
        const launchProgress = Math.min(1, elapsed / 1.6);
        corePointMesh.scale.setScalar(0.2 + launchProgress * 0.8 + Math.sin(elapsed * 2.8) * 0.06);
        neuralLatticeSphere.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.06);
        neuralLatticeSphere.rotation.y = elapsed * 0.18 + smoothMouseX * 0.35;
        neuralLatticeSphere.rotation.x = Math.sin(elapsed * 0.14) * 0.15 + smoothMouseY * 0.25;

        // Floating Glass Document Pages rotate gently
        glassDocStackGroup.rotation.y = elapsed * 0.15 + smoothMouseX * 0.25;
        glassDocStackGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.12 + smoothMouseY * 0.2;

        docSheets.forEach((sheet, idx) => {
          sheet.position.y = sheetConfigs[idx].y + Math.sin(elapsed * 1.3 + idx * 0.85) * 0.07;
        });

        // Glowing data points streaming out of pages
        const streamPosAttr = streamGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < streamParticleCount; i++) {
          const init = streamInitial[i];
          const flow = (elapsed * 0.75 + (i / streamParticleCount) * 4) % 4;
          streamPosAttr.setXYZ(
            i,
            init[0] + Math.cos(elapsed + i) * flow * 0.55,
            init[1] + flow * 0.48,
            init[2] + Math.sin(elapsed + i) * flow * 0.55
          );
        }
        streamPosAttr.needsUpdate = true;

        // ---------------- HOW IT WORKS 4-STEP MORPH ----------------
        flyInDocs.forEach((doc, idx) => {
          const t = Math.max(0, Math.min(1, 1 - Math.abs(activeStoryStep - 1)));
          doc.position.set(
            (idx - 1.5) * (1 - t) * 3,
            Math.sin(elapsed + idx) * 0.1,
            -idx * 0.15
          );
          doc.rotation.y = elapsed * 0.1;
        });

        chunkNodes.forEach((node, idx) => {
          const isStep2 = activeStoryStep >= 2;
          const spread = isStep2 ? 2.5 : 0.2;
          const ang = (idx / chunkNodeCount) * Math.PI * 2;
          node.position.set(
            Math.cos(ang + elapsed * 0.2) * spread,
            Math.sin(ang + elapsed * 0.2) * spread * 0.7,
            Math.sin(elapsed + idx) * 0.5
          );
          node.visible = activeStoryStep >= 2 && activeStoryStep <= 3;
        });

        if (activeStoryStep === 3) {
          queryRay.visible = true;
          queryRay.position.set(Math.sin(elapsed * 2) * 0.4, 0, 0);
          highlightedNodeMesh.visible = true;
          highlightedNodeMesh.position.set(1.4, 0.4, 0);
          highlightedNodeMesh.scale.setScalar(1 + Math.sin(elapsed * 5.5) * 0.18);
        } else {
          queryRay.visible = false;
          highlightedNodeMesh.visible = false;
        }

        if (activeStoryStep === 4) {
          pageProofMesh.visible = true;
          pageProofMesh.rotation.y = Math.sin(elapsed * 0.3) * 0.08;
          pageProofMesh.scale.setScalar(1 + Math.sin(elapsed * 1.2) * 0.025);
        } else {
          pageProofMesh.visible = false;
        }

        // ---------------- 3D VECTOR SPACE ROTATION ----------------
        vectorSpaceGroup.rotation.y = elapsed * 0.045 + smoothMouseX * 0.35;
        vectorSpaceGroup.rotation.x = Math.sin(elapsed * 0.035) * 0.08 + smoothMouseY * 0.18;

        // ---------------- FINAL CTA CONVERGENCE PORTAL ----------------
        portalRing.rotation.z = elapsed * 0.25;
        innerPortalRing.rotation.z = -elapsed * 0.35;
        portalGroup.rotation.y = smoothMouseX * 0.4;

        const convPosAttr = convGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < convCount; i++) {
          const ang = (i / convCount) * Math.PI * 2 + elapsed * 0.75;
          const r = 3.6 + Math.sin(elapsed * 1.8 + i) * 0.45;
          convPosAttr.setXYZ(i, Math.cos(ang) * r, Math.sin(ang) * r, Math.sin(ang * 3) * 0.45);
        }
        convPosAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('documind:step', onStoryStepChange);
      window.removeEventListener('documind:cluster', onClusterFocusChange);
      window.removeEventListener('documind:theme', onThemeChange);

      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();
      starGeo.dispose();
      starMat.dispose();
      latticeGeo.dispose();
      latticeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      sheetGeo.dispose();
      sheetMat.dispose();
      sheetEdgeMat.dispose();
      streamGeo.dispose();
      streamMat.dispose();
      chunkNodeGeo.dispose();
      chunkNodeMat.dispose();
      rayGeo.dispose();
      rayMat.dispose();
      highlightedNodeGeo.dispose();
      highlightedNodeMat.dispose();
      pointSphereGeo.dispose();
      instancedMat.dispose();
      instancedPoints.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      convGeo.dispose();
      convMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
