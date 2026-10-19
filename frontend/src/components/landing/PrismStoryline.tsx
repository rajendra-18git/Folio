'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Layers, Cpu, Network, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  techBadge: string;
  icon: React.ElementType;
}

const STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'STAGE 1 — DISCOVERY',
    subtitle: 'The Luminous Core',
    description: 'Raw, unindexed information exists in isolation. The crystalline foundation represents pure potential waiting to be parsed.',
    techBadge: 'Deterministic Ingestion · Magic Byte Validation',
    icon: Sparkles,
  },
  {
    id: 2,
    name: 'STAGE 2 — DOCUMENTS',
    subtitle: 'Orbital Ingestion',
    description: 'Translucent document sheets emerge and align around the central prism. Sentence-aware sliding windows preserve paragraph context without truncated words.',
    techBadge: '800-Char Windows · 150-Char Overlap · 1-Indexed Pages',
    icon: Layers,
  },
  {
    id: 3,
    name: 'STAGE 3 — UNDERSTANDING',
    subtitle: 'Faceted Knowledge Separation',
    description: 'The crystal separates into geometric facets. Dense neural embeddings project document semantics into high-dimensional vector representations.',
    techBadge: 'High-Density Embeddings · 1,536-D Vector Projections',
    icon: Cpu,
  },
  {
    id: 4,
    name: 'STAGE 4 — CONNECTION',
    subtitle: 'Embedding Lattice',
    description: 'Fine coordinates and light filaments connect related concepts across multiple files. Top-k cosine similarity surfaces exact grounding passages in under 40ms.',
    techBadge: 'Persistent Vector Store · Cosine Distance Metric',
    icon: Network,
  },
  {
    id: 5,
    name: 'STAGE 5 — CLARITY',
    subtitle: 'Grounded Evidence Synthesis',
    description: 'The visual complexity resolves into razor-sharp, citation-backed answers. Every assertion points to verified page numbers with zero hallucination.',
    techBadge: 'Production AI Grounding · 150 DPI Page Rendering',
    icon: ShieldCheck,
  },
];

export function PrismStoryline() {
  const [activeStage, setActiveStage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to 3D objects for dynamic stage transition
  const stageTargetRef = useRef(1);

  useEffect(() => {
    stageTargetRef.current = activeStage;
  }, [activeStage]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070816, 0.04);

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0, 9);

    // Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x0e1335, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x5577ff, 3.2);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9865ff, 2.5);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    const pointCyan = new THREE.PointLight(0x65dfff, 4.0, 15);
    pointCyan.position.set(0, 0, 1);
    scene.add(pointCyan);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Crystal Prism (Stage 1 Core)
    const prismGeo = new THREE.OctahedronGeometry(1.9, 0);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      roughness: 0.06,
      ior: 1.52,
      thickness: 1.6,
      transparent: true,
      opacity: 0.95,
      specularColor: new THREE.Color(0x65dfff),
      attenuationColor: new THREE.Color(0x9865ff),
      attenuationDistance: 1.2,
      clearcoat: 1.0,
    });
    const prismMesh = new THREE.Mesh(prismGeo, glassMat);
    rootGroup.add(prismMesh);

    const prismEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(prismGeo),
      new THREE.LineBasicMaterial({ color: 0x65dfff, transparent: true, opacity: 0.7 })
    );
    prismMesh.add(prismEdge);

    // 2. Translucent Document Sheets (Stage 2)
    const docGroup = new THREE.Group();
    rootGroup.add(docGroup);

    const sheetGeo = new THREE.PlaneGeometry(1.1, 1.5);
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0x101329,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      emissive: 0x5577ff,
      emissiveIntensity: 0.3,
    });
    const sheetEdgeMat = new THREE.LineBasicMaterial({ color: 0x65dfff, opacity: 0.8, transparent: true });

    const sheets: THREE.Group[] = [];
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const m = new THREE.Mesh(sheetGeo, sheetMat);
      g.add(m);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(sheetGeo), sheetEdgeMat));
      docGroup.add(g);
      sheets.push(g);
    }

    // 3. Facet Clusters (Stage 3 Exploding Facets)
    const facetGroup = new THREE.Group();
    rootGroup.add(facetGroup);

    const shardGeo = new THREE.TetrahedronGeometry(0.7, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x5577ff,
      emissive: 0x9865ff,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8,
      wireframe: true,
    });
    const shards: THREE.Mesh[] = [];
    const shardDirs: THREE.Vector3[] = [
      new THREE.Vector3(1, 1, 0).normalize(),
      new THREE.Vector3(-1, 1, 0).normalize(),
      new THREE.Vector3(0, -1, 1).normalize(),
      new THREE.Vector3(0, -1, -1).normalize(),
      new THREE.Vector3(1, 0, -1).normalize(),
      new THREE.Vector3(-1, 0, 1).normalize(),
    ];
    shardDirs.forEach((dir) => {
      const s = new THREE.Mesh(shardGeo, shardMat);
      facetGroup.add(s);
      shards.push(s);
    });

    // 4. Embedding Lattice Points & Filaments (Stage 4)
    const latticeGroup = new THREE.Group();
    rootGroup.add(latticeGroup);

    const pointCount = 36;
    const pointPositions: number[] = [];
    const ptGeo = new THREE.BufferGeometry();
    for (let i = 0; i < pointCount; i++) {
      const r = 1.8 + Math.random() * 2.2;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      pointPositions.push(r * Math.sin(ph) * Math.cos(th));
      pointPositions.push(r * Math.sin(ph) * Math.sin(th));
      pointPositions.push(r * Math.cos(ph));
    }
    ptGeo.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));
    const ptMat = new THREE.PointsMaterial({
      color: 0x65dfff,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const latticePoints = new THREE.Points(ptGeo, ptMat);
    latticeGroup.add(latticePoints);

    // Lines connecting points
    const connCoords: number[] = [];
    for (let i = 0; i < pointCount; i += 3) {
      connCoords.push(pointPositions[i * 3], pointPositions[i * 3 + 1], pointPositions[i * 3 + 2]);
      connCoords.push(pointPositions[(i + 1) * 3], pointPositions[(i + 1) * 3 + 1], pointPositions[(i + 1) * 3 + 2]);
    }
    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute('position', new THREE.Float32BufferAttribute(connCoords, 3));
    const connMat = new THREE.LineBasicMaterial({ color: 0x5577ff, transparent: true, opacity: 0.4 });
    const connLines = new THREE.LineSegments(connGeo, connMat);
    latticeGroup.add(connLines);

    // Animation Loop with Smooth Stage Interpolation
    let animId: number;
    const startTime = performance.now();
    let currentStageVal = 1;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      // Smooth lerp toward target stage
      currentStageVal += (stageTargetRef.current - currentStageVal) * 0.06;

      if (!prefersReducedMotion) {
        rootGroup.rotation.y = elapsed * 0.2;
        rootGroup.rotation.x = Math.sin(elapsed * 0.15) * 0.1;

        // Stage 1 (Discovery): Focus on central prism
        const stage1Weight = Math.max(0, 1 - Math.abs(currentStageVal - 1));
        prismMesh.scale.setScalar(1 + stage1Weight * 0.2);

        // Stage 2 (Documents): Orbiting sheets expand
        const stage2Weight = Math.max(0, 1 - Math.abs(currentStageVal - 2));
        docGroup.visible = currentStageVal > 1.2 && currentStageVal < 3.8;
        sheets.forEach((sh, idx) => {
          const ang = (idx * Math.PI) / 2 + elapsed * 0.3;
          const rad = 2.4 * stage2Weight + 1.2;
          sh.position.set(Math.cos(ang) * rad, Math.sin(elapsed + idx) * 0.3, Math.sin(ang) * rad);
          sh.rotation.y = -ang;
        });

        // Stage 3 (Understanding): Facet explosion
        const stage3Weight = Math.max(0, 1 - Math.abs(currentStageVal - 3));
        facetGroup.visible = currentStageVal > 2.2 && currentStageVal < 4.8;
        shards.forEach((s, idx) => {
          const dist = 1.2 + stage3Weight * 1.6;
          s.position.copy(shardDirs[idx].clone().multiplyScalar(dist));
          s.rotation.x += 0.01;
          s.rotation.y += 0.015;
        });

        // Stage 4 (Connection): Lattice visibility
        const stage4Weight = Math.max(0, 1 - Math.abs(currentStageVal - 4));
        latticeGroup.visible = currentStageVal > 3.2;
        latticePoints.rotation.y = elapsed * 0.1;
        ptMat.opacity = 0.2 + stage4Weight * 0.8;

        // Stage 5 (Clarity): Focus point convergence
        if (currentStageVal > 4.2) {
          prismMesh.scale.setScalar(0.9);
          pointCyan.intensity = 5.5;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      prismGeo.dispose();
      glassMat.dispose();
      prismEdge.dispose();
      sheetGeo.dispose();
      sheetMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      ptGeo.dispose();
      ptMat.dispose();
      connGeo.dispose();
      connMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section id="experience" className="relative py-28 bg-[#070816] text-[#F7F8FF] overflow-hidden border-t border-b border-white/[0.08]">
      {/* Volumetric glow */}
      <div className="prism-glow w-[600px] h-[600px] top-1/4 -left-40 bg-[#5577FF]/20" />
      <div className="prism-glow w-[600px] h-[600px] bottom-10 -right-40 bg-[#9865FF]/20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101329] border border-white/10 text-[#65DFFF] text-xs font-bold tracking-widest uppercase shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#65DFFF]" />
            Scroll-Driven 3D Storytelling
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            From Raw Documents{' '}
            <span className="prism-gradient-text block">
              to Refracted Clarity
            </span>
          </h2>
          <p className="text-[#A5ACC8] text-base sm:text-lg leading-relaxed">
            Follow the 5-stage transformation of your files through DocuMind’s refractive document intelligence engine.
          </p>
        </div>

        {/* 5-Stage Interactive Scrub Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-10">
          {STAGES.map((st) => {
            const Icon = st.icon;
            const isActive = activeStage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setActiveStage(st.id)}
                className={`p-3.5 rounded-2xl text-left transition-all duration-300 border cursor-pointer ${
                  isActive
                    ? 'bg-[#101329] border-[#65DFFF]/60 shadow-xl shadow-[#5577FF]/20 ring-1 ring-[#65DFFF]/40 scale-[1.02]'
                    : 'bg-[#0a0d1e]/80 hover:bg-[#101329]/60 border-white/[0.06] text-[#A5ACC8]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-[#5577FF] text-white' : 'bg-white/5 text-[#A5ACC8]'
                  }`}>
                    0{st.id}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#65DFFF]' : 'text-[#A5ACC8]'}`} />
                </div>
                <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-[#A5ACC8]'}`}>
                  {st.name.replace(`STAGE ${st.id} — `, '')}
                </div>
              </button>
            );
          })}
        </div>

        {/* 3D Story Canvas & Active Stage Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center prism-glass rounded-3xl p-6 sm:p-10">
          {/* Left Canvas (7 cols) */}
          <div className="lg:col-span-7 relative">
            <div
              ref={containerRef}
              className="relative w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden bg-[#0a0c20]/90 border border-white/10 shadow-2xl"
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Status Tag */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-slate-300 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#65DFFF] animate-pulse" />
                <span className="font-mono text-[11px]">{STAGES[activeStage - 1].name}</span>
              </div>
            </div>
          </div>

          {/* Right Narrative Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="space-y-3">
              <span className="text-[11px] font-mono tracking-wider uppercase text-[#65DFFF] font-bold block">
                {STAGES[activeStage - 1].subtitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {STAGES[activeStage - 1].name}
              </h3>
              <p className="text-sm sm:text-base text-[#A5ACC8] leading-relaxed">
                {STAGES[activeStage - 1].description}
              </p>
            </div>

            {/* Architecture Pill */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#65DFFF] flex items-center gap-2">
              <span className="text-indigo-400 font-bold">&gt;</span>
              <span>{STAGES[activeStage - 1].techBadge}</span>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white prism-blue-gradient shadow-lg shadow-[#5577FF]/30 hover:scale-[1.02] transition"
              >
                <span>Experience In Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
