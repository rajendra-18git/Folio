'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Sparkles, Compass, RotateCw, Layers, ShieldCheck, Info, ZoomIn, ZoomOut } from 'lucide-react';
import { VECTOR_CLUSTERS, VectorCluster, focusVectorCluster } from './PersistentCanvas3D';

export function VectorGalaxy3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCluster, setActiveCluster] = useState<VectorCluster>(VECTOR_CLUSTERS[0]);
  const [hoveredCluster, setHoveredCluster] = useState<VectorCluster | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(11);

  // Rotation and interaction refs
  const targetRotation = useRef({ x: 0.2, y: 0.4 });
  const currentRotation = useRef({ x: 0.2, y: 0.4 });
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const cameraZ = useRef(11);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const isMobile = window.innerWidth < 768;
    const pointCount = isMobile ? 1800 : 5400;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040914, 0.03);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, cameraZ.current);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const centerPointLight = new THREE.PointLight(0x38bdf8, 3.5, 30);
    centerPointLight.position.set(0, 0, 0);
    scene.add(centerPointLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Subtle Central Coordinate Spherical Lattice
    const sphereGridGeo = new THREE.SphereGeometry(5.2, 24, 24);
    const sphereGridMat = new THREE.MeshBasicMaterial({
      color: 0x091c36,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const sphereGrid = new THREE.Mesh(sphereGridGeo, sphereGridMat);
    rootGroup.add(sphereGrid);

    // 2. 5,000+ Point InstancedMesh for 60fps
    const pGeo = new THREE.SphereGeometry(0.048, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instancedMesh = new THREE.InstancedMesh(pGeo, pMat, pointCount);
    rootGroup.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const clusterPositions: THREE.Vector3[] = [];

    // Distribute into 4 colored clusters
    for (let i = 0; i < pointCount; i++) {
      const clusterIdx = i % VECTOR_CLUSTERS.length;
      const c = VECTOR_CLUSTERS[clusterIdx];
      const centroid = new THREE.Vector3(...c.centroid);

      // Gaussian dispersion
      const u = Math.random();
      const v = Math.random();
      const spread = 2.1 * Math.sqrt(-2.0 * Math.log(u || 0.001));
      const theta = 2.0 * Math.PI * v;
      const phi = (Math.random() - 0.5) * Math.PI;

      const pos = new THREE.Vector3(
        centroid.x + spread * Math.cos(theta) * Math.cos(phi),
        centroid.y + spread * Math.sin(phi),
        centroid.z + spread * Math.sin(theta) * Math.cos(phi)
      );

      dummy.position.copy(pos);
      dummy.scale.setScalar(0.75 + Math.random() * 0.7);
      dummy.updateMatrix();

      instancedMesh.setMatrixAt(i, dummy.matrix);
      instancedMesh.setColorAt(i, new THREE.Color(c.color));

      if (i < 320) {
        clusterPositions.push(pos.clone());
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }

    // 3. Thin connecting lines to nearest neighbors
    const linePositions: number[] = [];
    for (let i = 0; i < clusterPositions.length; i += 2) {
      for (let j = i + 1; j < Math.min(i + 8, clusterPositions.length); j++) {
        const d = clusterPositions[i].distanceTo(clusterPositions[j]);
        if (d < 1.7) {
          linePositions.push(
            clusterPositions[i].x, clusterPositions[i].y, clusterPositions[i].z,
            clusterPositions[j].x, clusterPositions[j].y, clusterPositions[j].z
          );
        }
      }
    }

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
    });
    const connectorLines = new THREE.LineSegments(linesGeo, linesMat);
    rootGroup.add(connectorLines);

    // 4. Cluster Centroid Interactive Hub Meshes
    const hubMeshes: THREE.Mesh[] = [];
    VECTOR_CLUSTERS.forEach((c) => {
      const hubGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const hubMat = new THREE.MeshStandardMaterial({
        color: c.color,
        emissive: c.color,
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.8,
      });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.position.set(...c.centroid);
      hub.userData = { clusterId: c.id };
      rootGroup.add(hub);
      hubMeshes.push(hub);

      // Crystalline halo ring
      const haloGeo = new THREE.RingGeometry(0.48, 0.72, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: c.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(...c.centroid);
      halo.lookAt(0, 0, 0);
      rootGroup.add(halo);
    });

    // 5. Drag to Orbit & Scroll to Zoom Handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      setIsInteracting(true);
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Drag Orbit
      if (isDragging.current) {
        const deltaX = e.clientX - previousMouse.current.x;
        const deltaY = e.clientY - previousMouse.current.y;
        targetRotation.current.y += deltaX * 0.005;
        targetRotation.current.x += deltaY * 0.005;
        previousMouse.current = { x: e.clientX, y: e.clientY };
      }

      // Raycasting for Cluster Hover Tooltip
      const normX = (mouseX / rect.width) * 2 - 1;
      const normY = -(mouseY / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);

      const intersects = raycaster.intersectObjects(hubMeshes);
      if (intersects.length > 0) {
        const clusterId = intersects[0].object.userData.clusterId;
        const found = VECTOR_CLUSTERS.find((c) => c.id === clusterId);
        if (found) {
          setHoveredCluster(found);
          setTooltipPos({ x: mouseX + 15, y: mouseY - 20 });
        }
      } else {
        setHoveredCluster(null);
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      setTimeout(() => setIsInteracting(false), 500);
    };

    const onWheel = (e: WheelEvent) => {
      // Non-disturbing: only intercept wheel zoom if Ctrl/Meta is held or actively dragging.
      // Otherwise allow natural page scroll to flow smoothly without interruption.
      if (e.ctrlKey || e.metaKey || isDragging.current) {
        e.preventDefault();
        const zoomDelta = e.deltaY * 0.006;
        cameraZ.current = Math.min(18, Math.max(5, cameraZ.current + zoomDelta));
        setZoomLevel(Math.round(cameraZ.current));
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        setIsInteracting(true);
        previousMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMouse.current.x;
      const deltaY = e.touches[0].clientY - previousMouse.current.y;
      targetRotation.current.y += deltaX * 0.006;
      targetRotation.current.x += deltaY * 0.006;
      previousMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging.current = false;
      setTimeout(() => setIsInteracting(false), 500);
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Theme adaptation for 3D Vector Galaxy
    const applyGalaxyTheme = (t: string) => {
      const isLightMode = t === 'light';
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color.setHex(isLightMode ? 0xF4F8FC : 0x040914);
      }
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = isLightMode ? 1.4 : 0.9;
      centerPointLight.color.setHex(isLightMode ? 0x0284c7 : 0x38bdf8);
      sphereGridMat.color.setHex(isLightMode ? 0xcfdbe8 : 0x091c36);
      sphereGridMat.opacity = isLightMode ? 0.45 : 0.35;
      linesMat.color.setHex(isLightMode ? 0x0284c7 : 0x38bdf8);
      linesMat.opacity = isLightMode ? 0.35 : 0.28;
    };

    const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
    applyGalaxyTheme(initialTheme);

    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.theme) {
        applyGalaxyTheme(detail.theme);
      }
    };
    window.addEventListener('documind:theme', onThemeChange);

    // Animation Loop
    let animId: number;
    const startTime = performance.now();
    let lastTime = startTime;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Slow continuous orbit when idle
      if (!isDragging.current) {
        targetRotation.current.y += delta * 0.08;
      }

      // Smooth lerp rotation
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      rootGroup.rotation.x = currentRotation.current.x;
      rootGroup.rotation.y = currentRotation.current.y;

      // Camera zoom lerp
      camera.position.z += (cameraZ.current - camera.position.z) * 0.08;

      // Pulse hubs
      hubMeshes.forEach((mesh, idx) => {
        const s = 1 + Math.sin(elapsed * 2.5 + idx * 1.5) * 0.12;
        mesh.scale.set(s, s, s);
      });

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
      window.removeEventListener('documind:theme', onThemeChange);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      resizeObserver.disconnect();

      sphereGridGeo.dispose();
      sphereGridMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      instancedMesh.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Click to Fly Camera to Cluster Centroid
  const handleSelectCluster = (c: VectorCluster) => {
    setActiveCluster(c);
    const [x, y, z] = c.centroid;
    const targetY = -Math.atan2(x, z);
    const targetX = Math.atan2(y, Math.sqrt(x * x + z * z));
    targetRotation.current = { x: targetX, y: targetY };
    cameraZ.current = 8.5; // Zoom in on cluster
    setZoomLevel(9);

    // Also notify persistent background 3D canvas
    focusVectorCluster(c.id);
  };

  const handleReset = () => {
    targetRotation.current = { x: 0.2, y: 0.4 };
    cameraZ.current = 11;
    setZoomLevel(11);
  };

  const handleZoomIn = () => {
    cameraZ.current = Math.max(5, cameraZ.current - 1.5);
    setZoomLevel(Math.round(cameraZ.current));
  };

  const handleZoomOut = () => {
    cameraZ.current = Math.min(18, cameraZ.current + 1.5);
    setZoomLevel(Math.round(cameraZ.current));
  };

  return (
    <section
      id="knowledge-space"
      className="relative py-32 border-t border-b border-[var(--color-border)] overflow-hidden text-[var(--color-text-primary)] transition-colors duration-300"
    >
      {/* Volumetric ambient lighting */}
      <div className="prism-glow w-[550px] h-[550px] top-0 right-1/4 bg-[#38BDF8]/15" />
      <div className="prism-glow w-[500px] h-[500px] bottom-0 left-1/4 bg-[#0284C7]/15" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold tracking-widest uppercase font-mono shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            5,000+ POINT INSTANCED VECTOR GALAXY
          </div>
          <h2 className="text-3xl sm:text-5xl font-normal font-absans tracking-tight text-[var(--color-text-primary)] leading-tight">
            Explore Document Knowledge{' '}
            <span className="font-absans font-normal tracking-[-0.02em] prism-gradient-text block">
              in 3D Vector Space
            </span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-base sm:text-lg leading-relaxed font-absans font-normal">
            Drag to orbit, use zoom controls or Ctrl+scroll, hover clusters to preview source domains, and click any centroid to fly into that high-dimensional knowledge neighborhood.
          </p>
        </div>

        {/* 3D Visualizer Canvas & Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center prism-glass rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Left Canvas: 3D Galaxy (7 Cols) */}
          <div className="lg:col-span-7 relative">
            <div
              ref={containerRef}
              className="relative w-full h-[440px] sm:h-[520px] rounded-2xl overflow-hidden bg-slate-50/90 border border-sky-200/60 cursor-grab active:cursor-grabbing select-none shadow-2xl"
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* 3D Overlay Help Tag */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 text-xs text-slate-800 backdrop-blur-md shadow-sm">
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                <span>Drag to Orbit · Ctrl + Scroll to Zoom · Click Centroid to Fly</span>
              </div>

              {/* Zoom Controls & Reset Button */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/90 border border-slate-200 text-[11px] font-mono text-sky-700 shadow-sm">
                  <span>{zoomLevel}m</span>
                </div>

                <button
                  onClick={handleZoomIn}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                  title="Zoom In"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleZoomOut}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                  title="Zoom Out"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-slate-100 text-xs text-slate-800 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                  title="Reset Camera View"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reset 3D</span>
                </button>
              </div>

              {/* Hover Tooltip Overlay */}
              {hoveredCluster && tooltipPos && (
                <div
                  style={{ left: tooltipPos.x, top: tooltipPos.y }}
                  className="absolute z-30 pointer-events-none p-3 rounded-xl bg-white/95 border border-sky-300 shadow-2xl backdrop-blur-xl text-left max-w-xs animate-in fade-in duration-150"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: hoveredCluster.hexColor }}
                    />
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {hoveredCluster.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-sky-700 mb-1">
                    {hoveredCluster.count.toLocaleString()} Chunks · Cosine: {hoveredCluster.cosSim}
                  </div>
                  <p className="text-[11px] text-slate-600 italic line-clamp-2">
                    &ldquo;{hoveredCluster.extractedPassage}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Quick Cluster Selector Buttons below Canvas */}
            <div className="flex flex-wrap gap-2.5 mt-4">
              {VECTOR_CLUSTERS.map((c) => {
                const isActive = activeCluster.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCluster(c)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-50 text-sky-950 border-2 shadow-lg shadow-[#0284C7]/20 scale-[1.03]'
                        : 'bg-white/90 text-slate-700 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
                    }`}
                    style={{
                      borderColor: isActive ? c.hexColor : undefined,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.hexColor }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Inspector: Live Concept Telemetry (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-5 text-left">
            <div className="p-6 rounded-2xl bg-white/90 border border-slate-200 relative overflow-hidden shadow-xl">
              <div
                className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: activeCluster.hexColor }}
              />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded bg-sky-100 text-sky-800 border border-sky-200 font-bold">
                  {activeCluster.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold" style={{ color: activeCluster.hexColor }}>
                  <Layers className="w-3.5 h-3.5" />
                  {activeCluster.count.toLocaleString()} Chunks
                </span>
              </div>

              <h3 className="text-xl font-normal font-absans text-[var(--color-text-primary)] mb-2">
                {activeCluster.name}
              </h3>

              {/* Sample Query Input Box */}
              <div className="mt-4 mb-3">
                <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-secondary)] font-bold block mb-1">
                  Natural Language Query
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-sky-800 font-mono flex items-start gap-2">
                  <span className="text-[#0284C7] font-bold">&gt;</span>
                  <span>&quot;{activeCluster.sampleQuery}&quot;</span>
                </div>
              </div>

              {/* Grounded Retrieved Source Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-secondary)] font-bold">
                    Extracted Grounded Passage
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 font-bold">
                    Cosine Match: {activeCluster.cosSim}
                  </span>
                </div>
                <div
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans italic border-l-4"
                  style={{ borderLeftColor: activeCluster.hexColor }}
                >
                  &ldquo;{activeCluster.extractedPassage}&rdquo;
                </div>
              </div>
            </div>

            {/* Architecture Metrics Card */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/90 border border-slate-200 text-center shadow-lg">
                <div>
                  <div className="text-xl font-normal font-absans text-sky-700">1,536</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">Dimensions</div>
                </div>
                <div>
                  <div className="text-xl font-normal font-absans text-[#0284C7]">&lt; 14ms</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">Latency</div>
                </div>
                <div>
                  <div className="text-xl font-normal font-absans text-emerald-600">0.0%</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">Hallucination</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Instanced mesh with 5,000+ points rendering at 60fps with nearest-neighbor filaments.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
