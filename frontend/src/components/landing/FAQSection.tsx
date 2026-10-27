'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '@/lib/useScrollAnimation';
import gsap from 'gsap';
import { useRef, useEffect } from 'react';

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const headerRef = useScrollReveal<HTMLDivElement>({ y: 50, duration: 0.8 });
  const faqListRef = useStaggerReveal<HTMLDivElement>('.faq-item', {
    y: 30,
    stagger: 0.08,
    duration: 0.6,
  });

  // Animate answer expansion
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleToggle = (i: number) => {
    if (openIdx === i) {
      // Closing
      if (answerRefs.current[i]) {
        gsap.to(answerRefs.current[i], {
          height: 0,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.inOut',
          onComplete: () => setOpenIdx(null),
        });
      } else {
        setOpenIdx(null);
      }
    } else {
      // Close previous
      if (openIdx !== null && answerRefs.current[openIdx]) {
        gsap.to(answerRefs.current[openIdx], {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
        });
      }
      setOpenIdx(i);
    }
  };

  // Animate opening of the new answer
  useEffect(() => {
    if (openIdx !== null && answerRefs.current[openIdx]) {
      const el = answerRefs.current[openIdx]!;
      gsap.set(el, { height: 'auto', opacity: 1 });
      gsap.from(el, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [openIdx]);

  const faqs = [
    {
      q: 'How does Folio guarantee zero hallucinations?',
      a: 'Folio implements a strict grounded generation pipeline. The vector engine retrieves semantic text passages based on cosine similarity, and system instructions mandate that the model answers ONLY using facts explicitly present in the retrieved passages. If evidence is lacking, the model explicitly states that the documents do not contain enough information rather than inventing facts.',
    },
    {
      q: 'Can I use Folio without an external API Key?',
      a: 'Yes. When operating without an external API key, the system does not fake answers; it directly displays the most relevant extracted passages and verified page excerpts with zero fabrications.',
    },
    {
      q: 'How does multi-document comparison detect contradictions?',
      a: 'Folio executes a bounded workflow: (1) independent retrieval per document, (2) claim synthesis, (3) matrix mapping, (4) evidence gap identification, and (5) structured report generation. The resulting Claims Matrix labels assertions as Agreement, Contrast, or Contradiction with exact citations.',
    },
    {
      q: 'What file formats and sizes are supported?',
      a: 'Currently, Folio specializes in PDF documents up to 25MB each. The document parser extracts text preserving exact 1-indexed page boundaries, detects scanned pages with low text density, and performs optical character recognition (OCR) when needed.',
    },
    {
      q: 'Are my uploaded documents private and secure?',
      a: 'All files, vector embeddings, and chunk metadata are stored in your secure isolated environment. Files are never shared or used to train external models.',
    },
  ];

  return (
    <section id="faq" className="py-28 bg-transparent border-b border-[var(--color-border)] relative overflow-hidden transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header — scroll reveal */}
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-sky-700 block font-mono">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-5xl font-normal font-absans text-[var(--color-text-primary)] tracking-[-0.03em]">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-[var(--color-text-secondary)] font-absans font-normal">
            Everything you need to know about Folio&apos;s grounded architecture and privacy.
          </p>
        </div>

        {/* FAQ Items — stagger reveal */}
        <div ref={faqListRef} className="space-y-3.5">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="faq-item rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all duration-300 hover:border-sky-300 shadow-sm"
              >
                <button
                  onClick={() => handleToggle(i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-slate-900 tracking-tight font-absans">
                    {faq.q}
                  </span>
                  <div className="p-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div
                    ref={(el) => { answerRefs.current[i] = el; }}
                    className="px-5 pb-5 pt-1 text-xs text-slate-600 font-absans font-normal leading-relaxed border-t border-slate-100 bg-slate-50/60 overflow-hidden"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
