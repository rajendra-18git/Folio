'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Verify WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0, 9);

    // Soft light theme lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x5656f6, 1.8);
    dirLight1.position.set(5, 6, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.2);
    dirLight2.position.set(-6, -4, 4);
    scene.add(dirLight2);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Floating Document Stack (3 Smooth Sheets)
    const docStackGroup = new THREE.Group();
    rootGroup.add(docStackGroup);

    const sheetGeo = new THREE.BoxGeometry(2.1, 2.9, 0.04);
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95,
    });

    const edgeMatIndigo = new THREE.LineBasicMaterial({
      color: 0x5656f6,
      transparent: true,
      opacity: 0.7,
    });

    const sheets: THREE.Group[] = [];
    const sheetConfigs = [
      { x: -0.9, y: 0.1, z: 0.2, rotZ: -0.12, rotY: 0.2 },
      { x: -0.7, y: -0.2, z: -0.2, rotZ: 0.05, rotY: 0.15 },
      { x: -0.5, y: -0.4, z: -0.6, rotZ: 0.18, rotY: 0.1 },
    ];

    sheetConfigs.forEach((cfg) => {
      const sheetGrp = new THREE.Group();
      const mesh = new THREE.Mesh(sheetGeo, sheetMat);
      sheetGrp.add(mesh);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(sheetGeo), edgeMatIndigo);
      sheetGrp.add(edges);

      sheetGrp.position.set(cfg.x, cfg.y, cfg.z);
      sheetGrp.rotation.set(0.1, cfg.rotY, cfg.rotZ);

      docStackGroup.add(sheetGrp);
      sheets.push(sheetGrp);
    });

    // 2. Abstract Neural Sphere (Smooth Pearlescent Core)
    const sphereGroup = new THREE.Group();
    sphereGroup.position.set(1.4, 0.2, 0.5);
    rootGroup.add(sphereGroup);

    const sphereGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0x5656f6,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.85,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereGroup.add(sphereMesh);

    // Orbiting coordinate rings
    const ringGeo1 = new THREE.TorusGeometry(1.35, 0.02, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x5656f6,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    sphereGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.5, 0.015, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    sphereGroup.add(ring2);

    // 3. Subtle Connected Semantic Particles
    const particleCount = 28;
    const particlePositions: [number, number, number][] = [];
    const particleGroup = new THREE.Group();
    rootGroup.add(particleGroup);

    const pGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const pMatIndigo = new THREE.MeshBasicMaterial({ color: 0x5656f6 });
    const pMatViolet = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.6 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particlePositions.push([x, y, z]);

      const pMesh = new THREE.Mesh(pGeo, i % 2 === 0 ? pMatIndigo : pMatViolet);
      pMesh.position.set(x, y, z);
      particleGroup.add(pMesh);
    }

    // Dynamic connectors between close particles
    const linePositions: number[] = [];
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = particlePositions[i][0] - particlePositions[j][0];
        const dy = particlePositions[i][1] - particlePositions[j][1];
        const dz = particlePositions[i][2] - particlePositions[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1.6) {
          linePositions.push(...particlePositions[i]);
          linePositions.push(...particlePositions[j]);
        }
      }
    }
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x5656f6,
      transparent: true,
      opacity: 0.25,
    });
    const connectorLines = new THREE.LineSegments(linesGeo, linesMat);
    particleGroup.add(connectorLines);

    // Mouse movement parallax (smooth & restrained)
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // Restrained parallax range
      targetX = Math.max(-0.4, Math.min(0.4, normX * 0.4));
      targetY = Math.max(-0.3, Math.min(0.3, normY * 0.3));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      if (!prefersReducedMotion) {
        // Smooth camera lerp
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        rootGroup.rotation.y = currentX * 0.5 + Math.sin(elapsed * 0.4) * 0.06;
        rootGroup.rotation.x = currentY * 0.3 + Math.cos(elapsed * 0.3) * 0.04;

        // Gentle floating document stack
        sheets.forEach((sheet, idx) => {
          sheet.position.y = sheetConfigs[idx].y + Math.sin(elapsed * 1.2 + idx * 0.8) * 0.05;
        });

        // Slow neural sphere rotation
        ring1.rotation.z += 0.005;
        ring2.rotation.x += 0.004;
        sphereMesh.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();

      sheetGeo.dispose();
      sheetMat.dispose();
      edgeMatIndigo.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      pGeo.dispose();
      pMatIndigo.dispose();
      pMatViolet.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    // Graceful static fallback
    return (
      <div className="w-full h-full flex items-center justify-center p-6 bg-white/60 rounded-3xl border border-[#E3E8F3]">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#5656F6] to-[#8B5CF6] shadow-lg flex items-center justify-center text-white font-bold">
          DocuMind 3D
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] sm:h-[380px] pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
