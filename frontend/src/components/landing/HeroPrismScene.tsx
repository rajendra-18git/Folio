'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function HeroPrismScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // WebGL Renderer check
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      60
    );
    camera.position.set(0, 0, 10.5);

    // Cinematic Lighting setup for Glass / Crystal Refraction
    const ambientLight = new THREE.AmbientLight(0x0a0f28, 1.2);
    scene.add(ambientLight);

    // Key Light: Electric Blue
    const lightElectricBlue = new THREE.DirectionalLight(0x5577ff, 3.5);
    lightElectricBlue.position.set(6, 7, 5);
    scene.add(lightElectricBlue);

    // Rim Light: Violet / Ultraviolet
    const lightViolet = new THREE.DirectionalLight(0x9865ff, 3.0);
    lightViolet.position.set(-6, -5, 4);
    scene.add(lightViolet);

    // Core Caustic Point Light: Cyan
    const lightCyan = new THREE.PointLight(0x65dfff, 4.5, 18);
    lightCyan.position.set(0, 0.5, 1.5);
    scene.add(lightCyan);

    // Main 3D Pivot Group
    const prismGroup = new THREE.Group();
    scene.add(prismGroup);

    // 1. Signature Multifaceted Refractive Crystal Prism
    // Bipyramidal faceted crystal geometry
    const prismGeo = new THREE.OctahedronGeometry(2.3, 1);

    // Physically-based transmission glass material (PrismX optical glass)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      metalness: 0.05,
      roughness: 0.04,
      transmission: 0.94,
      ior: 1.54,
      thickness: 2.0,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0x65dfff),
      attenuationColor: new THREE.Color(0x9865ff),
      attenuationDistance: 1.4,
      transparent: true,
      opacity: 0.96,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
    });

    const prismMesh = new THREE.Mesh(prismGeo, glassMaterial);
    prismGroup.add(prismMesh);

    // Outer Crystal Facet Bevel Wire / Edge Highlights
    const edgesGeo = new THREE.EdgesGeometry(prismGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x65dfff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const prismEdges = new THREE.LineSegments(edgesGeo, edgesMat);
    prismMesh.add(prismEdges);

    // 2. Inner Glowing Chromatic Core (Optical Dispersion Heart)
    const innerCoreGeo = new THREE.IcosahedronGeometry(0.95, 0);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x5577ff,
      emissive: 0x9865ff,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    prismGroup.add(innerCoreMesh);

    // 3. Orbiting Translucent Document Crystal Sheets & Coordinate Rings
    const orbitGroup = new THREE.Group();
    prismGroup.add(orbitGroup);

    const docSheetGeo = new THREE.PlaneGeometry(1.3, 1.8, 1, 1);
    const docSheetMat = new THREE.MeshPhysicalMaterial({
      color: 0x101329,
      transmission: 0.85,
      roughness: 0.2,
      thickness: 0.4,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      emissive: 0x5577ff,
      emissiveIntensity: 0.15,
    });

    const docEdgeMat = new THREE.LineBasicMaterial({
      color: 0x65dfff,
      transparent: true,
      opacity: 0.8,
    });

    const docPlanes: THREE.Group[] = [];
    const docConfigs = [
      { radius: 3.6, angle: 0, y: 0.6, rotX: 0.2, rotY: -0.4 },
      { radius: 3.8, angle: (Math.PI * 2) / 3, y: -0.5, rotX: -0.3, rotY: 0.6 },
      { radius: 3.4, angle: (Math.PI * 4) / 3, y: 0.3, rotX: 0.4, rotY: 0.2 },
    ];

    docConfigs.forEach((cfg) => {
      const g = new THREE.Group();
      const mesh = new THREE.Mesh(docSheetGeo, docSheetMat);
      g.add(mesh);

      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(docSheetGeo), docEdgeMat);
      g.add(edge);

      // Add miniature node point at the top corner of each sheet
      const nodeGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x65dfff });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(0.65, 0.9, 0);
      g.add(nodeMesh);

      orbitGroup.add(g);
      docPlanes.push(g);
    });

    // 4. Fine Refractive Orbit Rings (Caustic Light Bands)
    const ringGeo1 = new THREE.TorusGeometry(3.5, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x5577ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.8;
    prismGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.9, 0.012, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x9865ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 3.2;
    prismGroup.add(ring2);

    // 5. Floating Dust Particles & Light Sparkles
    const particleCount = 65;
    const particlePositions: number[] = [];
    const pGeo = new THREE.BufferGeometry();

    for (let i = 0; i < particleCount; i++) {
      const r = 2.2 + Math.random() * 4.2;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      particlePositions.push(r * Math.sin(ph) * Math.cos(th));
      particlePositions.push(r * Math.sin(ph) * Math.sin(th));
      particlePositions.push(r * Math.cos(ph));
    }

    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x65dfff,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(pGeo, pMat);
    prismGroup.add(particleSystem);

    // Mouse Pointer Parallax (Clamped & Damped)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = Math.max(-0.6, Math.min(0.6, normX * 0.6));
      targetY = Math.max(-0.5, Math.min(0.5, normY * 0.5));
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
        // Smooth lerp parallax
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        // Smooth slow crystal rotation
        prismMesh.rotation.y = elapsed * 0.25 + mouseX * 0.4;
        prismMesh.rotation.x = Math.sin(elapsed * 0.18) * 0.15 + mouseY * 0.3;
        prismMesh.rotation.z = Math.cos(elapsed * 0.14) * 0.1;

        // Inner core counter-rotation
        innerCoreMesh.rotation.y = -elapsed * 0.4;
        innerCoreMesh.rotation.x = elapsed * 0.2;

        // Orbit document panes smoothly around the prism
        docConfigs.forEach((cfg, idx) => {
          const plane = docPlanes[idx];
          const currentAngle = cfg.angle + elapsed * 0.15;
          plane.position.x = Math.cos(currentAngle) * cfg.radius;
          plane.position.z = Math.sin(currentAngle) * cfg.radius;
          plane.position.y = cfg.y + Math.sin(elapsed * 1.5 + idx) * 0.15;
          plane.rotation.y = -currentAngle + Math.PI / 2;
        });

        // Pulsate caustic cyan light
        lightCyan.intensity = 4.0 + Math.sin(elapsed * 2.5) * 1.2;

        // Slow drift for floating dust particles
        particleSystem.rotation.y = elapsed * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
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

      prismGeo.dispose();
      glassMaterial.dispose();
      edgesGeo.dispose();
      edgesMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      docSheetGeo.dispose();
      docSheetMat.dispose();
      docEdgeMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-[#101329]/80 rounded-3xl border border-white/10">
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-[#5577FF] via-[#9865FF] to-[#65DFFF] shadow-2xl flex items-center justify-center text-white font-bold tracking-wider">
          DocuMind 3D Prism
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450px] sm:h-[540px] lg:h-[600px] pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
