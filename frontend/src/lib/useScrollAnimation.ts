'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * Scroll-triggered reveal animation hook using GSAP + IntersectionObserver.
 * Attaches to a single element and animates it into view when it enters the viewport.
 */
export function useScrollReveal<T extends HTMLElement>(
  options: {
    /** Starting y-offset in px (default 60) */
    y?: number;
    /** Starting x-offset in px (default 0) */
    x?: number;
    /** Starting opacity (default 0) */
    fromOpacity?: number;
    /** Starting scale (default 1) */
    scale?: number;
    /** Animation duration in seconds (default 0.9) */
    duration?: number;
    /** Delay before animation starts in seconds (default 0) */
    delay?: number;
    /** GSAP ease string (default 'power3.out') */
    ease?: string;
    /** IntersectionObserver threshold (default 0.15) */
    threshold?: number;
    /** Only animate once (default true) */
    once?: boolean;
    /** Starting rotation in degrees (default 0) */
    rotation?: number;
  } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 60,
      x = 0,
      fromOpacity = 0,
      scale = 1,
      duration = 0.9,
      delay = 0,
      ease = 'power3.out',
      threshold = 0.15,
      once = true,
      rotation = 0,
    } = options;

    // Set initial state
    gsap.set(el, {
      y,
      x,
      opacity: fromOpacity,
      scale,
      rotation,
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(el, {
              y: 0,
              x: 0,
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration,
              delay,
              ease,
            });
            if (once) observer.unobserve(el);
          } else if (!once) {
            gsap.set(el, {
              y,
              x,
              opacity: fromOpacity,
              scale,
              rotation,
            });
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}

/**
 * Stagger-reveal hook: animates multiple children of a container
 * with a staggered entrance when the container scrolls into view.
 */
export function useStaggerReveal<T extends HTMLElement>(
  childSelector: string,
  options: {
    y?: number;
    x?: number;
    fromOpacity?: number;
    scale?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
    ease?: string;
    threshold?: number;
    once?: boolean;
  } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const {
      y = 50,
      x = 0,
      fromOpacity = 0,
      scale = 1,
      duration = 0.8,
      stagger = 0.12,
      delay = 0,
      ease = 'power3.out',
      threshold = 0.1,
      once = true,
    } = options;

    const children = container.querySelectorAll(childSelector);
    if (!children.length) return;

    gsap.set(children, { y, x, opacity: fromOpacity, scale });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(children, {
              y: 0,
              x: 0,
              opacity: 1,
              scale: 1,
              duration,
              stagger,
              delay,
              ease,
            });
            if (once) observer.unobserve(container);
          }
        });
      },
      { threshold }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}

/**
 * Parallax scroll hook: moves element at a different rate
 * than normal scroll to create depth.
 */
export function useParallax<T extends HTMLElement>(speed: number = 0.3) {
  const ref = useRef<T>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const handleScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const offset = (centerY - viewCenter) * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [speed]);

  return ref;
}

/**
 * Horizontal scroll-triggered reveal: slides element from left or right.
 */
export function useSlideIn<T extends HTMLElement>(
  direction: 'left' | 'right' = 'left',
  options: {
    distance?: number;
    duration?: number;
    delay?: number;
    ease?: string;
    threshold?: number;
  } = {}
) {
  const {
    distance = 100,
    duration = 1,
    delay = 0,
    ease = 'power3.out',
    threshold = 0.15,
  } = options;

  return useScrollReveal<T>({
    x: direction === 'left' ? -distance : distance,
    y: 0,
    duration,
    delay,
    ease,
    threshold,
  });
}

/**
 * Counter animation: animates a number from 0 to target value.
 */
export function useCountUp(
  targetValue: number,
  options: {
    duration?: number;
    threshold?: number;
    suffix?: string;
    prefix?: string;
  } = {}
) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      duration = 2,
      threshold = 0.3,
    } = options;

    el.textContent = '0';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: targetValue,
              duration,
              ease: 'power2.out',
              onUpdate: () => {
                const prefix = options.prefix || '';
                const suffix = options.suffix || '';
                el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
              },
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
