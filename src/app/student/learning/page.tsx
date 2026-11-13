'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Lightbulb,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { Intervention, PracticeQuestion } from '@/types';

export default function StudentLearningPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);

  // Interactive Practice Question states
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceResults, setPracticeResults] = useState<
    Record<string, { isCorrect: boolean; feedback: string; correctAnswer: string; explanation: string }>
  >({});
  const [submittingQ, setSubmittingQ] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningPackages();
  }, []);

  async function fetchLearningPackages() {
    try {
      const res = await fetch('/api/interventions?role=student');
      const data = await res.json();
      if (data.interventions) {
        setInterventions(data.interventions);
        if (data.interventions.length > 0) {
          setSelectedPackage(data.interventions[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function submitPractice(q: PracticeQuestion) {
    const answer = practiceAnswers[q.id];
    if (!answer || !answer.trim()) return;

    setSubmittingQ(q.id);

    try {
      const res = await fetch(`/api/interventions/${selectedPackage?.id}/practice-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceQuestionId: q.id,
          studentAnswer: answer.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPracticeResults(prev => ({
          ...prev,
          [q.id]: {
            isCorrect: data.isCorrect,
            feedback: data.feedback,
            correctAnswer: data.correctAnswer,
            explanation: data.explanation,
          },
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingQ(null);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Loading your approved personalized learning packages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Approved by Faculty
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personalized Learning & Practice Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Targeted remediations generated from your diagnostic gaps, grounded in course materials, and approved by your professor.
        </p>
      </div>

      {interventions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800 mb-1">No Active Remediation Packages Required</h2>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            You are performing well across your academic traits! When diagnostic assessments identify specific conceptual gaps, faculty-certified packages will appear here.
          </p>
          <Link
            href="/student/dashboard"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            Return to Dashboard →
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Package Selector */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Available Learning Packages ({interventions.length})
            </h2>

            {interventions.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedPackage(item)}
                className={`w-full text-left p-4 rounded-xl border transition shadow-sm ${
                  selectedPackage?.id === item.id
                    ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 mb-1">{item.title}</div>
                <div className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                  {item.learning_gap_summary}
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.targeted_traits.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-[9px] font-semibold bg-purple-100 text-purple-800">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Right: Package Content & Interactive Practice */}
          {selectedPackage && (
            <div className="lg:col-span-2 space-y-6">
              {/* Learning Content Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">
                    Grounded Course Remediation
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">{selectedPackage.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Faculty Note: {selectedPackage.faculty_feedback || 'Approved for student self-study.'}
                  </p>
                </div>

                {/* 1. Learning Gap */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block mb-1">Your Identified Gap:</span>
                  <p className="text-slate-700">{selectedPackage.learning_gap_summary}</p>
                </div>

                {/* 2. Simplified Explanation */}
                <div className="text-xs space-y-2">
                  <span className="font-bold text-slate-900 block text-sm">Concept Breakdown</span>
                  <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedPackage.content_package?.simplified_explanation}
                  </p>
                </div>

                {/* 3. Core Concepts */}
                <div>
                  <span className="font-bold text-slate-900 block text-xs mb-2">Key Principles:</span>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                    {selectedPackage.content_package?.core_concepts?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* 4. Analogy */}
                {selectedPackage.content_package?.analogy && (
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-900 block mb-0.5">Conceptual Analogy:</span>
                      <p className="text-slate-700 italic leading-relaxed">
                        {selectedPackage.content_package.analogy}
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. Worked Examples */}
                <div>
                  <span className="font-bold text-slate-900 block text-xs mb-2">Worked Examples:</span>
                  <div className="space-y-3">
                    {selectedPackage.content_package?.worked_examples?.map((ex, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                        <span className="font-bold text-purple-700 block">Problem {idx + 1}: {ex.problem}</span>
                        <p className="text-slate-700"><strong>Solution:</strong> {ex.solution}</p>
                        <p className="text-slate-500 italic"><strong>Takeaway:</strong> {ex.takeaway}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Revision Checklist */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-2">Self-Assessment Checklist:</span>
                  <div className="space-y-1.5">
                    {selectedPackage.content_package?.revision_checklist?.map((item, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input type="checkbox" className="rounded text-purple-600" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Practice Center */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Interactive Practice Activities</h3>
                    <p className="text-xs text-slate-500">Apply what you learned with instant evaluation.</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {selectedPackage.practice_questions?.length || 0} Questions
                  </span>
                </div>

                <div className="space-y-6">
                  {selectedPackage.practice_questions?.map((pq: PracticeQuestion, idx: number) => {
                    const result = practiceResults[pq.id];
                    const answer = practiceAnswers[pq.id] || '';

                    return (
                      <div key={pq.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                        <div className="font-bold text-slate-900 text-sm">
                          Practice Q{idx + 1}: {pq.question_text}
                        </div>

                        {pq.options && pq.options.length > 0 ? (
                          <div className="space-y-2">
                            {pq.options.map((opt, oIdx) => (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                                  answer === opt
                                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`pq-${pq.id}`}
                                  value={opt}
                                  checked={answer === opt}
                                  onChange={() => setPracticeAnswers({ ...practiceAnswers, [pq.id]: opt })}
                                  className="w-3.5 h-3.5 text-purple-600"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Type your answer..."
                            value={answer}
                            onChange={e => setPracticeAnswers({ ...practiceAnswers, [pq.id]: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                          />
                        )}

                        {result && (
                          <div className={`p-3 rounded-lg border text-xs ${
                            result.isCorrect
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}>
                            <div className="font-bold flex items-center gap-1.5 mb-1">
                              {result.isCorrect ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-600" /> Correct!
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 text-amber-600" /> Incorrect
                                </>
                              )}
                            </div>
                            <p className="mb-1">{result.feedback}</p>
                            <p className="text-[11px] text-slate-600"><strong>Explanation:</strong> {result.explanation}</p>
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => submitPractice(pq)}
                            disabled={submittingQ === pq.id || !answer.trim()}
                            className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition disabled:opacity-50"
                          >
                            {submittingQ === pq.id ? 'Checking...' : 'Check Answer'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
