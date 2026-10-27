'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function ChronoLanding() {
  const { user, isAuthenticated } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const $ = (s: string, c: HTMLElement | Document = root) => c.querySelector<HTMLElement>(s);
    const $$ = (s: string, c: HTMLElement | Document = root) => Array.from(c.querySelectorAll<HTMLElement>(s));
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

    /* 1. Reveal on scroll (staggered inside grids) */
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const intGrid = target.closest('#intGrid');
            if (intGrid) {
              const items = Array.from(intGrid.querySelectorAll<HTMLElement>('#intGrid > div'));
              const idx = items.indexOf(target);
              target.style.setProperty('--d', (idx % 5) * 0.08 + 's');
            }
            target.classList.add('in');
            io.unobserve(target);
          }
        }),
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
    );
    $$('[data-r]').forEach((el) => io.observe(el));

    /* 2. Count-up numbers */
    const countIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          countIO.unobserve(el);
          const end = +(el.dataset.count || '0');
          const dec = +(el.dataset.dec || 0);
          const suf = el.dataset.suffix || '';
          const t0 = performance.now();

          function tick(t: number) {
            const p = clamp((t - t0) / 1400, 0, 1);
            const eased = 1 - Math.pow(1 - p, 4);
            el.textContent = (end * eased).toFixed(dec) + suf;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }),
      { threshold: 0.6 }
    );
    $$('[data-count]').forEach((el) => countIO.observe(el));

    /* 3. Scroll-linked effects (one rAF loop) */
    const nav = $('#nav');
    const bar = $('#progress');
    const mock = $('#mock');
    const cta = $('#cta');
    const floats = $$('.float');
    const links = $$('.links a');
    const secs = links.map((a) => {
      const href = a.getAttribute('href');
      return href ? (root.querySelector(href) as HTMLElement | null) : null;
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;

      if (bar) {
        bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }
      if (nav) {
        nav.classList.toggle('scrolled', y > 30);
      }

      if (!reduce) {
        floats.forEach((f) => {
          const speed = +(f.dataset.speed || '0');
          f.style.transform = `translateY(${y * speed}px)`;
        });

        if (mock) {
          const m = mock.getBoundingClientRect();
          const mp = clamp(1 - (m.top - vh * 0.2) / (vh * 0.7), 0, 1);
          mock.style.setProperty('--tilt', 14 * (1 - mp) + 'deg');
          mock.style.setProperty('--sc', String(0.92 + 0.08 * mp));
        }

        if (cta) {
          const c = cta.getBoundingClientRect();
          const cp = clamp(1 - (c.top - vh * 0.35) / (vh * 0.6), 0, 1);
          cta.style.setProperty('--cs', String(0.94 + 0.06 * cp));
        }
      }

      let cur = -1;
      secs.forEach((s, i) => {
        if (s && s.getBoundingClientRect().top < vh * 0.4) cur = i;
      });
      links.forEach((a, i) => a.classList.toggle('active', i === cur));
      ticking = false;
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      io.disconnect();
      countIO.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="folio-landing-wrapper">
      <style>{`
        :root {
          --ink: #0e1530;
          --muted: #5b6784;
          --line: #e3e8f4;
          --bg: #f6f8fd;
          --card: #fff;
          --blue: #2f5bff;
          --blue-d: #1d3fd1;
          --sun: #ffd84d;
          --green: #12a36b;
          --amber: #d9830b;
          --display: 'Bricolage Grotesque', system-ui, sans-serif;
          --body: 'Figtree', system-ui, sans-serif;
          --ease: cubic-bezier(.2, .7, .2, 1);
        }

        .folio-landing-wrapper {
          font-family: var(--body);
          color: var(--ink);
          background: var(--bg);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .folio-landing-wrapper h1,
        .folio-landing-wrapper h2,
        .folio-landing-wrapper h3,
        .folio-landing-wrapper h4 {
          font-family: var(--display);
          line-height: 1.05;
          letter-spacing: -.025em;
        }

        .folio-landing-wrapper a {
          color: inherit;
          text-decoration: none;
        }

        .folio-landing-wrapper .wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .folio-landing-wrapper section {
          padding: 110px 0;
        }

        /* scroll progress */
        #progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          width: 100%;
          background: var(--blue);
          transform: scaleX(0);
          transform-origin: left;
          z-index: 100;
        }

        /* nav */
        nav#nav {
          position: fixed;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: min(1120px, calc(100% - 32px));
          z-index: 90;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px 10px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, .7);
          backdrop-filter: blur(14px);
          border: 1px solid var(--line);
          transition: all .4s var(--ease);
        }

        nav#nav.scrolled {
          background: rgba(255, 255, 255, .94);
          box-shadow: 0 10px 30px -12px rgba(15, 26, 51, .25);
          padding-top: 7px;
          padding-bottom: 7px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--display);
          font-weight: 800;
          font-size: 24px;
          letter-spacing: -.03em;
        }

        .logo .mark {
          width: 26px;
          height: 32px;
          flex: none;
          transition: transform .5s var(--ease);
        }

        .logo:hover .mark {
          transform: rotate(-8deg) scale(1.08);
        }

        .links {
          display: flex;
          gap: 26px;
          font-weight: 500;
          font-size: 15px;
          color: var(--muted);
        }

        .links a {
          position: relative;
          padding: 4px 0;
          transition: color .2s;
        }

        .links a::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 100%;
          background: var(--blue);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .35s var(--ease);
        }

        .links a:hover,
        .links a.active {
          color: var(--ink);
        }

        .links a:hover::after,
        .links a.active::after {
          transform: scaleX(1);
        }

        .nav-cta {
          display: flex;
          align-items: center;
          gap: 18px;
          font-weight: 600;
          font-size: 15px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 15px;
          border: 1px solid transparent;
          cursor: pointer;
          font-family: var(--body);
          transition: transform .25s var(--ease), box-shadow .25s, background .25s;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn-primary {
          background: var(--blue);
          color: #fff !important;
          box-shadow: 0 10px 22px -10px var(--blue);
        }

        .btn-primary:hover {
          background: var(--blue-d);
        }

        .btn-ghost {
          background: #fff;
          border-color: var(--line);
          color: var(--ink);
        }

        .btn-white {
          background: #fff;
          color: var(--blue) !important;
        }

        .btn-outline {
          border-color: rgba(255, 255, 255, .5);
          color: #fff !important;
        }

        /* hero */
        .hero {
          padding-top: 170px;
          padding-bottom: 90px;
          text-align: center;
          position: relative;
        }

        .hero h1 {
          font-size: clamp(44px, 7.4vw, 92px);
          font-weight: 800;
          max-width: 900px;
          margin: 0 auto 24px;
        }

        .hero h1 .line {
          display: block;
          overflow: hidden;
          padding-bottom: .08em;
        }

        .hero h1 .line span {
          display: block;
          transform: translateY(110%);
          animation: rise 1s var(--ease) forwards;
        }

        .hero h1 .line:nth-child(2) span {
          animation-delay: .12s;
          color: var(--blue);
        }

        @keyframes rise {
          to {
            transform: none;
          }
        }

        .hero p.sub {
          font-size: 20px;
          color: var(--muted);
          max-width: 620px;
          margin: 0 auto 34px;
        }

        .hero .actions,
        .hero .perks,
        .hero .sub {
          opacity: 0;
          animation: fadeup .9s var(--ease) .45s forwards;
        }

        .hero .actions {
          animation-delay: .6s;
        }

        .hero .perks {
          animation-delay: .75s;
        }

        @keyframes fadeup {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        .actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .perks {
          margin-top: 26px;
          display: flex;
          gap: 22px;
          justify-content: center;
          flex-wrap: wrap;
          font-size: 14px;
          color: var(--muted);
        }

        .float {
          position: absolute;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 16px 18px;
          text-align: left;
          font-size: 13px;
          box-shadow: 0 24px 40px -22px rgba(15, 26, 51, .35);
          will-change: transform;
          z-index: 2;
        }

        .float h4 {
          font-family: var(--display);
          font-size: 15px;
          margin-bottom: 8px;
        }

        .float .row {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding: 6px 0;
          border-top: 1px solid var(--line);
          color: var(--muted);
        }

        .float .row b {
          color: var(--blue);
          font-weight: 600;
        }

        .f1 {
          left: 2%;
          bottom: 60px;
          width: 240px;
          transform: rotate(-4deg);
        }

        .f2 {
          right: 2%;
          bottom: 90px;
          width: 230px;
          transform: rotate(3deg);
        }

        .f3 {
          left: 6%;
          top: 150px;
          width: 210px;
          background: var(--sun);
          border-color: #f0c82a;
          transform: rotate(-6deg);
        }

        .chip {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          background: #e6f7ef;
          color: var(--green);
          font-weight: 600;
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 99px;
        }

        /* section heads */
        .head {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 56px;
        }

        .head h2 {
          font-size: clamp(34px, 4.6vw, 56px);
          font-weight: 800;
          margin-bottom: 14px;
        }

        .head p {
          color: var(--muted);
          font-size: 18px;
        }

        /* stats */
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 60px;
          text-align: center;
        }

        .stats strong {
          display: block;
          font-family: var(--display);
          font-size: clamp(36px, 4.5vw, 56px);
          font-weight: 800;
          color: var(--blue);
          letter-spacing: -.03em;
        }

        .stats span {
          color: var(--muted);
          font-size: 15px;
        }

        /* cards */
        .grid3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .grid2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 22px;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 30px;
          transition: transform .35s var(--ease), box-shadow .35s;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 44px -26px rgba(15, 26, 51, .3);
        }

        .ico {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-size: 21px;
          margin-bottom: 18px;
          background: #eaf0ff;
        }

        .card h3 {
          font-size: 23px;
          margin-bottom: 10px;
        }

        .card p {
          color: var(--muted);
          font-size: 16px;
        }

        .card .rows {
          margin-top: 20px;
          display: grid;
          gap: 8px;
          font-size: 14px;
        }

        .card .rows div {
          display: flex;
          justify-content: space-between;
          background: var(--bg);
          border-radius: 10px;
          padding: 9px 12px;
        }

        .tag {
          font-weight: 600;
          font-size: 12px;
          border-radius: 99px;
          padding: 2px 10px;
        }

        .t-g {
          background: #e6f7ef;
          color: var(--green);
        }

        .t-b {
          background: #e8eeff;
          color: var(--blue);
        }

        .t-a {
          background: #fff2dc;
          color: var(--amber);
        }

        /* mockup: tilts flat while scrolling */
        .stage {
          perspective: 1400px;
        }

        .mock {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 26px;
          box-shadow: 0 50px 80px -40px rgba(15, 26, 51, .45);
          overflow: hidden;
          transform: rotateX(var(--tilt, 14deg)) scale(var(--sc, .92));
          transform-origin: center top;
          will-change: transform;
        }

        .bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--line);
          background: #fbfcff;
        }

        .bar i {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }

        .bar i:nth-child(1) {
          background: #ff5f57;
        }

        .bar i:nth-child(2) {
          background: #febc2e;
        }

        .bar i:nth-child(3) {
          background: #28c840;
        }

        .bar em {
          margin: 0 auto;
          font-style: normal;
          font-size: 12px;
          color: var(--muted);
          background: var(--bg);
          padding: 3px 40px;
          border-radius: 99px;
        }

        .mock-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 280px;
        }

        .pane {
          padding: 24px 26px;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .pane + .pane {
          border-left: 1px solid var(--line);
          background: #fbfcff;
        }

        .quote {
          margin-top: 14px;
          border: 1.5px solid #f2c94c;
          background: #fff9e3;
          border-radius: 12px;
          padding: 14px;
          font-style: italic;
        }

        .bubble {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .bubble.u {
          background: var(--ink);
          color: #fff;
          margin-left: auto;
          max-width: 82%;
          line-height: 1.45;
        }

        mark {
          background: var(--blue);
          color: #fff;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          white-space: nowrap;
          display: inline-block;
          vertical-align: baseline;
          letter-spacing: 0.01em;
          margin-left: 4px;
        }

        /* integrations */
        .int {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .int div {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 22px 10px;
          text-align: center;
          font-weight: 600;
          font-size: 15px;
          transition: transform .3s var(--ease), border-color .3s;
        }

        .int div:hover {
          transform: translateY(-5px) rotate(-1.5deg);
          border-color: var(--blue);
        }

        .int small {
          display: block;
          color: var(--muted);
          font-weight: 400;
          font-size: 12px;
        }

        /* cta */
        .cta {
          background: var(--blue);
          color: #fff;
          border-radius: 34px;
          padding: 90px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
          transform: scale(var(--cs, .94));
          will-change: transform;
        }

        .cta::before,
        .cta::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, .14);
        }

        .cta::before {
          width: 520px;
          height: 520px;
          right: -160px;
          top: -200px;
        }

        .cta::after {
          width: 360px;
          height: 360px;
          left: -120px;
          bottom: -190px;
        }

        .cta h2 {
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 800;
          max-width: 720px;
          margin: 0 auto 16px;
          position: relative;
        }

        .cta p {
          opacity: .85;
          font-size: 18px;
          margin-bottom: 32px;
          position: relative;
        }

        .cta .actions {
          position: relative;
        }

        footer {
          padding: 36px 0;
          color: var(--muted);
          font-size: 14px;
        }

        footer .wrap {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }

        /* scroll reveal: different motion per type */
        [data-r] {
          opacity: 0;
          transition: opacity .9s var(--ease), transform .9s var(--ease);
          transition-delay: var(--d, 0s);
        }

        [data-r=up] {
          transform: translateY(44px);
        }

        [data-r=left] {
          transform: translateX(-60px);
        }

        [data-r=right] {
          transform: translateX(60px);
        }

        [data-r=zoom] {
          transform: scale(.88);
        }

        [data-r].in {
          opacity: 1;
          transform: none;
        }

        @media (max-width: 860px) {
          .links, .float {
            display: none;
          }
          .grid3, .grid2, .mock-body {
            grid-template-columns: 1fr;
          }
          .stats {
            grid-template-columns: 1fr;
          }
          .int {
            grid-template-columns: repeat(2, 1fr);
          }
          .pane + .pane {
            border-left: 0;
            border-top: 1px solid var(--line);
          }
          section {
            padding: 80px 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
          [data-r] {
            opacity: 1;
            transform: none;
          }
          .hero h1 .line span,
          .hero .sub,
          .hero .actions,
          .hero .perks {
            opacity: 1;
            transform: none;
          }
          .mock, .cta {
            transform: none;
          }
        }
      `}</style>

      {/* Scroll Progress Bar */}
      <div id="progress" />

      {/* Navigation */}
      <nav id="nav">
        <a href="#top" className="logo">
          <svg className="mark" viewBox="0 0 34 42" aria-hidden="true">
            <path
              d="M5 0H20L34 14V37a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5Z"
              fill="var(--blue)"
            />
            <path d="M20 0L34 14H25a5 5 0 0 1-5-5Z" fill="#1d3fd1" />
            <rect x="8" y="16" width="5" height="18" rx="2.5" fill="#fff" />
            <rect x="8" y="16" width="14" height="5" rx="2.5" fill="#fff" />
            <rect x="8" y="24" width="10" height="5" rx="2.5" fill="#fff" />
          </svg>
          Folio
        </a>

        <div className="links">
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#platform">Platform</a>
          <a href="#integrations">Integrations</a>
          <a href="#testimonials">Testimonials</a>
        </div>

        <div className="nav-cta">
          {isAuthenticated && user ? (
            <Link href="/workspace" className="btn btn-primary">
              Workspace
            </Link>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register" className="btn btn-primary">
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero" id="top">
        <div className="float f3" data-speed="-0.06">
          <h4>Synthesis ready</h4>
          One grounded evidence matrix, instantly.
          <br />
          <small>14 citations linked</small>
        </div>

        <div className="float f1" data-speed="0.05">
          <h4>Today&apos;s documents</h4>
          <div className="row">
            <span>Quantum_Computing.pdf</span>
            <b>100%</b>
          </div>
          <div className="row">
            <span>Clinical_Trial_Phase3.pdf</span>
            <b>14 citations</b>
          </div>
        </div>

        <div className="float f2" data-speed="0.09">
          <h4>Connected workspaces</h4>
          Notion · GitHub · Slack · Zotero
          <br />
          <small>Auto-synced with user isolation</small>
        </div>

        <div className="wrap">
          <h1>
            <span className="line">
              <span>Think, analyze, and learn</span>
            </span>
            <span className="line">
              <span>all in one place</span>
            </span>
          </h1>

          <p className="sub">
            Synthesize multi-page PDFs, extract grounded citations, and master complex subjects with
            document intelligence. Skip the skimming and get verified insights.
          </p>

          <div className="actions">
            {isAuthenticated ? (
              <Link href="/workspace" className="btn btn-primary">
                Go to Workspace
              </Link>
            ) : (
              <Link href="/register" className="btn btn-primary">
                Get started free
              </Link>
            )}
            <a href="#platform" className="btn btn-ghost">
              ▶ Try interactive demo
            </a>
          </div>

          <div className="perks">
            <span>✓ No credit card required</span>
            <span>✓ Free 100-page upload</span>
            <span>✓ Private user partition</span>
          </div>
        </div>
      </header>

      {/* Solutions & Stats Section */}
      <section id="solutions" style={{ paddingTop: '60px' }}>
        <div className="wrap">
          <div className="stats" data-r="up">
            <div>
              <strong data-count="100" data-suffix="+">
                0
              </strong>
              <span>pages indexed per upload</span>
            </div>
            <div>
              <strong data-count="8" data-suffix="s">
                0
              </strong>
              <span>to index a document</span>
            </div>
            <div>
              <strong data-count="99.4" data-suffix="%" data-dec="1">
                0
              </strong>
              <span>verified accuracy</span>
            </div>
          </div>

          <div className="head" data-r="up">
            <h2>Solve your team&apos;s biggest challenges</h2>
            <p>
              Drowning in 500-page filings, preprints, or textbook chapters? Folio turns dense PDFs
              into queryable, grounded knowledge.
            </p>
          </div>

          <div className="grid3">
            <div className="card" data-r="up" style={{ ['--d' as string]: '0s' }}>
              <div className="ico">⚡</div>
              <h3>Boost productivity</h3>
              <p>
                Index 100+ pages in under 8 seconds. Automatic OCR, two-column layout reading, table
                extraction, and vector embedding.
              </p>
            </div>

            <div className="card" data-r="up" style={{ ['--d' as string]: '.12s' }}>
              <div className="ico" style={{ background: '#ece9ff' }}>
                ⏱
              </div>
              <h3>Track in real time</h3>
              <p>
                Every claim the assistant makes is grounded. Click any citation to inspect the
                highlighted source passage.
              </p>
            </div>

            <div className="card" data-r="up" style={{ ['--d' as string]: '.24s' }}>
              <div className="ico" style={{ background: '#e3f7ee' }}>
                ✨
              </div>
              <h3>Empower your team</h3>
              <p>
                Convert dense documentation into flashcards, practice quizzes, and executive
                synthesis memos ready to export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform & Interactive Stage Tilt Mockup */}
      <section id="platform" style={{ paddingTop: '20px' }}>
        <div className="wrap stage">
          <div className="mock" id="mock">
            <div className="bar">
              <i />
              <i />
              <i />
              <em>folio.ai/workspace/project-apollo-synthesis</em>
            </div>
            <div className="mock-body">
              <div className="pane">
                <div>
                  <b>Deep_Learning_Survey_2026.pdf</b>{' '}
                  <small style={{ float: 'right', color: 'var(--muted)' }}>Page 14 of 48</small>
                  <div className="quote">
                    “Cross-document synthesis error rates decreased from 14.2% to 0.6% when applying
                    strict page-level citation boundaries.”
                    <br />
                    <small style={{ fontStyle: 'normal', color: 'var(--amber)', fontWeight: 600 }}>
                      Source citation #1 · Confidence 98.8%
                    </small>
                  </div>
                </div>
              </div>

              <div className="pane">
                <div>
                  <div className="bubble u">
                    How much do page-anchored citations decrease synthesis error?
                  </div>
                  <div className="bubble">
                    Strict page-level boundaries cut error rates from <b>14.2%</b> to <b>0.6%</b>{' '}
                    <mark>Page&nbsp;14</mark>
                  </div>
                  <small style={{ color: 'var(--blue)', fontWeight: 600 }}>
                    Flashcard ready: “Synthesis Error Rates”
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Section */}
      <section id="features">
        <div className="wrap">
          <div className="head" data-r="up">
            <h2>Keep everything in one place</h2>
            <p>
              Consolidate PDF readers, note apps, flashcard software, and chatbots into a single
              platform.
            </p>
          </div>

          <div className="grid2">
            <div className="card" data-r="left">
              <h3>Multi-document comparison</h3>
              <p>
                Upload multiple PDFs at once. Folio finds conflicting findings between authors and
                builds an evidence matrix.
              </p>
              <div className="rows">
                <div>
                  <span>Smith et al. (2025)</span>
                  <span className="tag t-g">Validated</span>
                </div>
                <div>
                  <span>Chen et al. (2026)</span>
                  <span className="tag t-b">Consensus</span>
                </div>
                <div>
                  <span>Legacy Trial (2021)</span>
                  <span className="tag t-a">Data flagged</span>
                </div>
              </div>
            </div>

            <div className="card" data-r="right">
              <h3>Smart flashcards</h3>
              <p>
                Turn whole textbooks into flashcards with spaced repetition. Tap a card to test
                yourself.
              </p>
              <div className="rows">
                <div style={{ display: 'block', textAlign: 'center', padding: '22px' }}>
                  What primary advantage does the Leitner system give during exam prep?
                  <br />
                  <small style={{ color: 'var(--blue)', fontWeight: 600 }}>Tap to reveal</small>
                </div>
              </div>
            </div>

            <div className="card" data-r="left" style={{ ['--d' as string]: '.1s' }}>
              <h3>No made-up answers</h3>
              <p>Every summary and comparison links to an exact box on the original page.</p>
              <div className="rows">
                <div>
                  <span>Federal Reserve Minutes 2026</span>
                  <span className="tag t-b">p. 18</span>
                </div>
                <div>
                  <span>WHO Vaccine Surveillance Report</span>
                  <span className="tag t-b">p. 42</span>
                </div>
              </div>
            </div>

            <div className="card" data-r="right" style={{ ['--d' as string]: '.1s' }}>
              <h3>Private storage and your own keys</h3>
              <p>
                Your files never mix with other users. Each account has its own isolated database and
                encrypted API keys.
              </p>
              <div className="rows">
                <div>
                  <span>Isolated vector collections</span>
                  <span className="tag t-g">On</span>
                </div>
                <div>
                  <span>No training on your documents</span>
                  <span className="tag t-g">On</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations">
        <div className="wrap">
          <div className="head" data-r="up">
            <h2>Connect the tools you use every day</h2>
            <p>Sync notes, references, and repositories in one click.</p>
          </div>

          <div className="int" id="intGrid">
            <div data-r="zoom">
              Google Drive<small>Auto-sync PDFs</small>
            </div>
            <div data-r="zoom">
              Notion<small>Export summaries</small>
            </div>
            <div data-r="zoom">
              Slack<small>Query docs in chat</small>
            </div>
            <div data-r="zoom">
              Obsidian<small>Markdown sync</small>
            </div>
            <div data-r="zoom">
              Zotero<small>Sync citations</small>
            </div>
            <div data-r="zoom">
              arXiv<small>Paper ingestion</small>
            </div>
            <div data-r="zoom">
              GitHub<small>Scan code and docs</small>
            </div>
            <div data-r="zoom">
              Mendeley<small>Bibliographies</small>
            </div>
            <div data-r="zoom">
              Dropbox<small>Folder sync</small>
            </div>
            <div data-r="zoom">
              Google Scholar<small>BibTeX export</small>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials">
        <div className="wrap">
          <div className="head" data-r="up">
            <h2>People like you already use Folio</h2>
          </div>

          <div className="grid3">
            <div className="card" data-r="up">
              <p>
                “Folio cut our literature review time by 80%. The exact page citations give our team
                unconditional trust in every synthesis summary.”
              </p>
              <br />
              <b>Dr. Elena Rostova</b>
              <br />
              <small style={{ color: 'var(--muted)' }}>Bioinformatics Lead, Stanford</small>
            </div>

            <div className="card" data-r="up" style={{ ['--d' as string]: '.12s' }}>
              <p>
                “The active recall study decks extracted straight from Robbins Pathology allowed me
                to pass USMLE Step 1 with high confidence.”
              </p>
              <br />
              <b>Marcus Vance</b>
              <br />
              <small style={{ color: 'var(--muted)' }}>Medical Student, Johns Hopkins</small>
            </div>

            <div className="card" data-r="up" style={{ ['--d' as string]: '.24s' }}>
              <p>
                “Comparing complex contradictory regulatory filings across 3 jurisdictions used to
                take days. Folio highlights every delta in seconds.”
              </p>
              <br />
              <b>Sarah Jenkins, Esq.</b>
              <br />
              <small style={{ color: 'var(--muted)' }}>Compliance Partner, Apex Legal</small>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta" id="cta">
            <h2>Think, analyze, and learn faster than ever</h2>
            <p>Turn your documents into verified answers in seconds.</p>
            <div className="actions">
              {isAuthenticated ? (
                <Link href="/workspace" className="btn btn-white">
                  Go to Workspace
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn btn-white">
                    Get started free
                  </Link>
                  <Link href="/login" className="btn btn-outline">
                    Sign in to account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <a href="#top" className="logo" style={{ fontSize: '20px' }}>
            <svg className="mark" viewBox="0 0 34 42" aria-hidden="true">
              <path
                d="M5 0H20L34 14V37a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5Z"
                fill="var(--blue)"
              />
              <path d="M20 0L34 14H25a5 5 0 0 1-5-5Z" fill="#1d3fd1" />
              <rect x="8" y="16" width="5" height="18" rx="2.5" fill="#fff" />
              <rect x="8" y="16" width="14" height="5" rx="2.5" fill="#fff" />
              <rect x="8" y="24" width="10" height="5" rx="2.5" fill="#fff" />
            </svg>
            Folio
          </a>
          <span>© 2026 Folio Intelligence. All rights reserved.</span>
          <span>Features · Solutions · Integrations · Sign in · Register</span>
        </div>
      </footer>
    </div>
  );
}
