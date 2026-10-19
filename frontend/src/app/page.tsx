'use client';

import React from 'react';
import { SmoothScroll } from '@/components/landing/SmoothScroll';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { WorkflowShowcase } from '@/components/landing/WorkflowShowcase';
import { FeatureStorytelling } from '@/components/landing/FeatureStorytelling';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { CustomCursor } from '@/components/landing/CustomCursor';

export default function LandingPage() {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col antialiased selection:bg-[#38BDF8] selection:text-[#040914] transition-colors duration-300">
        {/* Interactive Custom Cursor */}
        <CustomCursor />

        {/* Translucent Glass Navigation */}
        <LandingNav />

        <main className="flex-1 relative z-10">
          {/* 1. Hero — Big headline + product card */}
          <LandingHero />

          {/* 2. Workflow — 4-step grounded lifecycle */}
          <WorkflowShowcase />

          {/* 3. Features — Chat, Study, Multimodal, Compare */}
          <FeatureStorytelling />

          {/* 4. FAQ */}
          <FAQSection />

          {/* 5. Final CTA */}
          <FinalCTA />
        </main>

        {/* Footer */}
        <LandingFooter />
      </div>
    </SmoothScroll>
  );
}
