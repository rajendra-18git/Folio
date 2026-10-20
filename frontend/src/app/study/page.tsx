'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Copy,
  RotateCw,
  Sparkles,
  Layers,
  FileQuestion,
  FileCheck,
  Clock,
  Award,
  Loader2,
  ChevronRight,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api';
import { DocumentItem, StudyGenerationResponse, Citation } from '@/lib/types';
import { CitationBadge } from '@/components/CitationBadge';
import { PdfViewerModal } from '@/components/PdfViewerModal';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useToast } from '@/components/Toast';
import { FolioShell } from '@/components/FolioShell';

const STUDY_TYPES = [
  { id: 'summary', name: 'Executive Summary', icon: BookOpen, desc: 'High-level synthesis and key takeaways' },
  { id: 'two_mark', name: '2-Mark Answers', icon: Award, desc: 'Concise definitions and core principles' },
  { id: 'five_mark', name: '5-Mark Answers', icon: Layers, desc: 'Structured analytical explanations' },
  { id: 'ten_mark', name: '10-Mark Exam Essay', icon: GraduationCap, desc: 'Comprehensive academic essays' },
  { id: 'flashcards', name: 'Flashcards', icon: RotateCw, desc: 'Interactive active recall cards' },
  { id: 'mcqs', name: 'MCQ Quiz', icon: FileQuestion, desc: 'Multiple-choice questions with verified explanations' },
  { id: 'practice_test', name: 'Practice Test', icon: FileCheck, desc: 'Structured mock exam with marked sections' },
];

function StudyContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get('doc');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || '');
  const [activeStudyType, setActiveStudyType] = useState<string>('summary');
  const [topic, setTopic] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [studyResult, setStudyResult] = useState<StudyGenerationResponse | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  
  // Interactive Flashcard State
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  // Interactive MCQ State
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.listDocuments().then((docs) => {
      setDocuments(docs);
      if (!selectedDocId && docs.length > 0) {
        setSelectedDocId(docs[0].id);
      }
    });
  }, []);

  const handleGenerate = async () => {
    if (!selectedDocId) {
      showToast('Please select a document first.', 'error');
      return;
    }
    setGenerating(true);
    setFlippedCards({});
    setSelectedMcqAnswers({});
    showToast(`Generating ${STUDY_TYPES.find(t => t.id === activeStudyType)?.name}...`, 'info');

    try {
      const result = await api.generateStudyMaterial(selectedDocId, activeStudyType, topic);
      setStudyResult(result);
      showToast('Study material generated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Generation failed.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyAll = () => {
    if (!studyResult) return;
    navigator.clipboard.writeText(JSON.stringify(studyResult.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSelectOption = (mcqIndex: number, optionLetter: string) => {
    setSelectedMcqAnswers((prev) => ({ ...prev, [mcqIndex]: optionLetter }));
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Study Assistant</h2>
        <p className="text-sm text-slate-500">
          Transform uploaded documents into structured exam prep materials, flashcards, and verified assessments.
        </p>
      </div>

      {/* Control Panel: Document Selector, Topic, & Action Tabs */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Source Document</label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {documents.length === 0 ? (
                <option value="">No documents available</option>
              ) : (
                documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.original_filename} ({d.page_count} pages)
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Topic or Chapter (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Neural Networks, Chapter 3, Core Algorithms"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Study Type Selection Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STUDY_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = activeStudyType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setActiveStudyType(type.id)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold leading-tight">{type.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedDocId}
            className="pb-ai-button"
            title={!selectedDocId ? 'Select a document first' : undefined}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Generating Materials...</span>
              </>
            ) : (
              <>
                <span>Generate {STUDY_TYPES.find(t => t.id === activeStudyType)?.name}</span>
                <span className="pb-ai-sparkle">✦</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Content Area */}
      {studyResult && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">
                {studyResult.study_type.replace('_', ' ')}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {studyResult.data.document_name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {(studyResult.data.tokens_used ?? 0) > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs font-semibold">
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
                  {studyResult.data.tokens_used?.toLocaleString()} tokens
                </span>
              )}
              {(studyResult.data.latency_ms ?? 0) > 0 && (
                <span className="text-xs text-slate-400 font-medium">
                  {studyResult.data.latency_ms?.toFixed(0)}ms
                </span>
              )}
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                title="Regenerate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1. Summary View */}
          {studyResult.study_type === 'summary' && (
            <div className="space-y-4">
              <div className="max-w-none text-slate-800 leading-relaxed">
                <MarkdownRenderer content={studyResult.data.summary_markdown || ''} />
              </div>
              {studyResult.data.key_takeaways && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/70 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Core Takeaways</h4>
                  <ul className="space-y-1.5">
                    {studyResult.data.key_takeaways.map((point, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-600 font-bold shrink-0">•</span>
                        <div className="flex-1">
                          <MarkdownRenderer content={point} className="text-xs" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 2. Exam Answers (2-mark, 5-mark, 10-mark) */}
          {['two_mark', 'five_mark', 'ten_mark'].includes(studyResult.study_type) && (
            <div className="space-y-4">
              {studyResult.data.exam_answers?.map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                      Q{i + 1}. {item.question}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold shrink-0">
                      {item.marks} Marks
                    </span>
                  </div>

                  {item.key_points && item.key_points.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.key_points.map((pt, pIdx) => (
                        <span key={pIdx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-600">
                          {pt}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                    <MarkdownRenderer content={item.detailed_answer} className="text-xs" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Interactive Flashcards */}
          {studyResult.study_type === 'flashcards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyResult.data.flashcards?.map((card, i) => {
                const isFlipped = flippedCards[i];
                return (
                  <div
                    key={i}
                    onClick={() => toggleFlip(i)}
                    className="cursor-pointer p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all min-h-[160px] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-600">CARD #{i + 1}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-medium">
                        {card.difficulty}
                      </span>
                    </div>

                    <div className="py-3">
                      {isFlipped ? (
                        <div className="text-xs text-slate-800 leading-relaxed font-medium">
                          <MarkdownRenderer content={card.answer} className="text-xs font-medium" />
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-slate-900">
                          {card.question}
                        </p>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span>{isFlipped ? 'Answer revealed' : 'Click to flip'}</span>
                      {card.page_number && <span>Page {card.page_number}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Interactive MCQ Quiz */}
          {studyResult.study_type === 'mcqs' && (
            <div className="space-y-5">
              {studyResult.data.mcqs?.map((mcq, i) => {
                const userChoice = selectedMcqAnswers[i];
                const correctLetter = mcq.correct_option.trim().toUpperCase()[0];
                return (
                  <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {i + 1}. {mcq.question}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mcq.options.map((opt, optIdx) => {
                        const optLetter = opt.trim().substring(0, 1).toUpperCase();
                        const isChosen = userChoice === optLetter;
                        const isAnswer = correctLetter === optLetter;

                        let style = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
                        if (userChoice) {
                          if (isAnswer) style = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                          else if (isChosen) style = 'bg-rose-50 border-rose-300 text-rose-800';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(i, optLetter)}
                            className={`p-3 rounded-xl border text-left text-xs transition ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {userChoice && (
                      <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                        <span className="font-bold">Explanation: </span>
                        <MarkdownRenderer content={mcq.explanation} className="text-xs inline" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Practice Test */}
          {studyResult.study_type === 'practice_test' && studyResult.data.practice_test && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 border-b pb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Duration: {studyResult.data.practice_test.duration_minutes} mins
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  Total Marks: {studyResult.data.practice_test.total_marks}
                </span>
              </div>

              {studyResult.data.practice_test.sections.map((sec, secIdx) => (
                <div key={secIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    {sec.section_name}
                  </h4>
                  <div className="space-y-2">
                    {sec.questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-800 font-medium">
                        {qIdx + 1}. {q}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grounding Citations */}
          {studyResult.data.citations && studyResult.data.citations.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Grounding Document Citations
              </span>
              <div className="flex flex-wrap gap-2">
                {studyResult.data.citations.map((c, i) => (
                  <CitationBadge
                    key={i}
                    citation={c}
                    onClick={(cit) => setActiveCitation(cit)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Citation Page Preview Modal */}
      <PdfViewerModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />
    </div>
  );
}

export default function StudyPage() {
  return (
    <FolioShell
      activeRoute="/study"
      pageTitle="Document Intelligence & Study Assistant"
    >
      <main className="content">
        <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading study assistant...</div>}>
          <StudyContent />
        </React.Suspense>
      </main>
    </FolioShell>
  );
}
