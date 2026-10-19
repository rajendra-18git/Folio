'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  isSquare: boolean;
}

interface ClickWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Disable on touch devices or if user prefers reduced motion
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsTouch(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Dither particles & click ripples
    const particles: Particle[] = [];
    const clickWaves: ClickWave[] = [];

    let lastX = width / 2;
    let lastY = height / 2;
    let animId: number;

    const darkColors = ['#60D5FA', '#38BDF8', '#ADD8E6', '#0284C7', '#7DD3FC'];
    const lightColors = ['#0284C7', '#0369A1', '#0EA5E9', '#2563EB', '#38BDF8'];

    const getColors = () => {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark');
      return isDark ? darkColors : lightColors;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.hypot(dx, dy);

      // Spawn dither particles on motion
      if (dist > 3) {
        const colors = getColors();
        const count = Math.min(Math.floor(dist / 5) + 1, 5);

        for (let i = 0; i < count; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.4;
          const speed = Math.random() * 1.6;

          particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: -Math.cos(angle) * speed + (Math.random() - 0.5) * 0.4,
            vy: -Math.sin(angle) * speed + (Math.random() - 0.5) * 0.4,
            size: Math.random() > 0.4 ? Math.floor(Math.random() * 3) + 2 : 2,
            alpha: 0.85,
            maxLife: 26 + Math.random() * 16,
            life: 0,
            color,
            isSquare: Math.random() > 0.35, // Dither pixel aesthetic
          });
        }
      }

      lastX = x;
      lastY = y;
    };

    // Click burst ripple effect
    const handleMouseDown = (e: MouseEvent) => {
      const colors = getColors();
      clickWaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 38,
        alpha: 0.85,
      });

      // Spawn radial micro-burst particles
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 1.8 + Math.random() * 2.4;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.floor(Math.random() * 3) + 2,
          alpha: 1,
          maxLife: 26 + Math.random() * 14,
          life: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          isSquare: true,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render click waves
      for (let i = clickWaves.length - 1; i >= 0; i--) {
        const wave = clickWaves[i];
        wave.radius += 2.2;
        wave.alpha *= 0.91;

        ctx.save();
        ctx.strokeStyle = `rgba(56, 189, 248, ${wave.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        if (wave.alpha < 0.05 || wave.radius >= wave.maxRadius) {
          clickWaves.splice(i, 1);
        }
      }

      // Render dither particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;

        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);

        if (progress >= 1 || currentAlpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;

        if (p.isSquare) {
          // Sharp pixel / dither aesthetic
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (isTouch) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
