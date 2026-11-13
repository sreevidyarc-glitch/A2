'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  ArrowRight,
  Sparkles,
  Clock,
  Lock,
} from 'lucide-react';
import { Question, ResponseRecord, HintEvent } from '@/types';
import { BLOOMS_TRAIT_INFO } from '@/lib/constants';

export default function StudentAssessmentPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const router = useRouter();
  const { assessmentId } = use(params);

  const [assessment, setAssessment] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [unlockedHints, setUnlockedHints] = useState<HintEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentInput, setStudentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    text: string;
    isCorrect?: boolean;
    hintUnlocked?: number;
    hintText?: string;
  } | null>(null);

  useEffect(() => {
    initAttempt();
  }, [assessmentId]);

  async function initAttempt() {
    try {
      // 1. Fetch sanitized assessment (answer keys and unearned hints are completely stripped)
      const asmtRes = await fetch(`/api/assessments/${assessmentId}`);
      const asmtData = await asmtRes.json();
      if (asmtData.assessment) {
        setAssessment(asmtData.assessment);
      }

      // 2. Start or resume attempt
      const attRes = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId }),
      });
      const attData = await attRes.json();
      if (attData.attempt) {
        setAttempt(attData.attempt);
        setResponses(attData.responses || []);
        setUnlockedHints(attData.unlockedHints || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const currentQuestion: Question | undefined = assessment?.questions?.[currentIndex];
  const qResponses = currentQuestion
    ? responses.filter(r => r.question_id === currentQuestion.id)
    : [];
  const qHints = currentQuestion
    ? unlockedHints.filter(h => h.question_id === currentQuestion.id)
    : [];

  const isFinalized = qResponses.some(r => r.is_final || r.is_correct) || qResponses.length >= 3;
  const latestResponse = qResponses[qResponses.length - 1];
  const currentAttemptNumber = Math.min(3, qResponses.length + 1);

  // Set initial input when navigating questions
  useEffect(() => {
    if (latestResponse && isFinalized) {
      setStudentInput(latestResponse.submitted_answer);
    } else {
      setStudentInput('');
    }
    setFeedbackMsg(null);
  }, [currentIndex, isFinalized, latestResponse]);

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!currentQuestion || !studentInput.trim() || isFinalized) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/attempts/${attempt.id}/submit-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          submittedAnswer: studentInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponses(prev => [...prev, data.response]);

        if (data.transition.unlockedHintNumber) {
          setUnlockedHints(prev => [
            ...prev,
            {
              id: `he-client-${Date.now()}`,
              attempt_id: attempt.id,
              question_id: currentQuestion.id,
              hint_number: data.transition.unlockedHintNumber,
              unlocked_at: new Date().toISOString(),
              response_number_triggered: data.transition.responseNumber,
              hint_text: data.transition.unlockedHintText,
            } as any,
          ]);
        }

        setFeedbackMsg({
          text: data.transition.feedback,
          isCorrect: data.transition.isCorrect,
          hintUnlocked: data.transition.unlockedHintNumber,
          hintText: data.transition.unlockedHintText,
        });

        if (data.isAssessmentComplete) {
          setAttempt((prev: any) => ({ ...prev, status: 'evaluated' }));
        }
      } else {
        setFeedbackMsg({ text: data.error || 'Submission failed' });
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Initializing secure progressive examination session...</p>
      </div>
    );
  }

  if (!assessment || !currentQuestion) {
    return <div className="py-12 text-center text-slate-500">Assessment not available.</div>;
  }

  const traitInfo = BLOOMS_TRAIT_INFO[currentQuestion.primary_trait];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assessment Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {assessment.type.toUpperCase()} EXAM
            </span>
            <span className="text-xs font-mono text-slate-500">
              Question {currentIndex + 1} of {assessment.questions.length}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900">{assessment.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {attempt?.status === 'evaluated' ? (
            <Link
              href="/student/reports"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> View Final Trait Report
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
              <Clock className="w-4 h-4 text-blue-600" /> In Progress
            </div>
          )}
        </div>
      </div>

      {/* Question Stepper Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {assessment.questions.map((q: Question, idx: number) => {
          const qResps = responses.filter(r => r.question_id === q.id);
          const isDone = qResps.some(r => r.is_final || r.is_correct) || qResps.length >= 3;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition shrink-0 ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : isDone
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Trait Metadata & Attempt Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${traitInfo?.badgeColor}`}>
              {currentQuestion.primary_trait} Dimension
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Max Marks: {currentQuestion.maximum_marks}
            </span>
          </div>

          {/* Attempt State Indicator */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isFinalized
                ? latestResponse?.is_correct
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-700'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {isFinalized
                ? latestResponse?.is_correct
                  ? 'Question Completed (Correct)'
                  : 'Question Completed (Final Attempt Evaluated)'
                : `Attempt ${currentAttemptNumber} of 3`}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
          {currentQuestion.question_text}
        </div>

        {/* Progressive Hint Drawer (Appears when eligible) */}
        {qHints.length > 0 && (
          <div className="space-y-2.5 pt-2">
            {qHints.map((hintEvent: any) => (
              <div
                key={hintEvent.id}
                className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
              >
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">
                    Progressive Hint {hintEvent.hint_number}:
                  </span>
                  <p className="text-amber-950 font-medium leading-relaxed">
                    {hintEvent.hint_text || `Consider analyzing the problem step-by-step.`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Form based on Question Type */}
        <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-2">
          {currentQuestion.options && currentQuestion.options.length > 0 ? (
            /* MCQ / Option Radio List */
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = studentInput === opt || studentInput === opt.charAt(0);
                return (
                  <label
                    key={oIdx}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    } ${isFinalized ? 'cursor-not-allowed opacity-90' : ''}`}
                  >
                    <input
                      type="radio"
                      name="mcq-option"
                      disabled={isFinalized}
                      value={opt}
                      checked={isSelected}
                      onChange={() => setStudentInput(opt)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                );
              })}
            </div>
          ) : currentQuestion.question_type === 'numeric' ? (
            /* Numeric Input */
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numeric Answer (Tolerance configured by instructor)
              </label>
              <input
                type="number"
                step="any"
                disabled={isFinalized}
                placeholder="Enter numeric calculation..."
                value={studentInput}
                onChange={e => setStudentInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>
          ) : (
            /* Short / Long Answer Textarea */
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Response
              </label>
              <textarea
                rows={4}
                disabled={isFinalized}
                placeholder="Type your explanation or derivation clearly..."
                value={studentInput}
                onChange={e => setStudentInput(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>
          )}

          {/* Feedback Message */}
          {feedbackMsg && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              feedbackMsg.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="font-bold mb-0.5">
                {feedbackMsg.isCorrect ? 'Correct!' : 'Incorrect response'}
              </div>
              <div>{feedbackMsg.text}</div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-30"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {!isFinalized && (
                <button
                  type="submit"
                  disabled={submitting || !studentInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting
                    ? 'Evaluating...'
                    : currentAttemptNumber === 1
                    ? 'Submit Initial Answer'
                    : `Submit Answer (${currentAttemptNumber}/3)`}
                </button>
              )}

              {currentIndex < assessment.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  Next Question <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href="/student/reports"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Complete & View Report
                </Link>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
