'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit3,
  Save,
  Check,
  Send,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Assessment, Question, AcademicTrait, ACADEMIC_TRAITS } from '@/types';
import { BLOOMS_TRAIT_INFO } from '@/lib/constants';

export default function AssessmentBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Question editing state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    fetchAssessments();
  }, [courseId]);

  async function fetchAssessments() {
    try {
      const res = await fetch(`/api/assessments?courseId=${courseId}`);
      const data = await res.json();
      if (data.assessments && data.assessments.length > 0) {
        setAssessments(data.assessments);
        const defaultId = data.assessments[0].id;
        setSelectedAssessmentId(defaultId);
        loadAssessmentDetails(defaultId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadAssessmentDetails(id: string) {
    try {
      const res = await fetch(`/api/assessments/${id}`);
      const data = await res.json();
      if (data.assessment) {
        setCurrentAssessment(data.assessment);
        if (data.assessment.questions?.length > 0) {
          setExpandedQuestionId(data.assessment.questions[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleGenerateAIQuestions() {
    if (!selectedAssessmentId) return;
    setGenerating(true);
    setMsg('');

    try {
      const res = await fetch('/api/assessments/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          questionCount: 4,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        loadAssessmentDetails(selectedAssessmentId);
      } else {
        setMsg(data.error || 'Question generation failed');
      }
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handlePublishAssessment() {
    if (!selectedAssessmentId) return;
    setPublishing(true);
    setMsg('');

    try {
      const res = await fetch(`/api/assessments/${selectedAssessmentId}/publish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        loadAssessmentDetails(selectedAssessmentId);
      } else {
        setMsg(data.error || 'Failed to publish assessment');
      }
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setPublishing(false);
    }
  }

  function startEditing(q: any) {
    setEditingQuestionId(q.id);
    setEditForm({
      questionText: q.question_text,
      maximumMarks: q.maximum_marks,
      primaryTrait: q.primary_trait,
      secondaryTrait: q.secondary_trait || '',
      difficulty: q.difficulty,
      correctAnswer: q.answer_key?.correct_answer || '',
      referenceAnswer: q.answer_key?.reference_answer || '',
      hint1: q.hints?.hint_1 || '',
      hint2: q.hints?.hint_2 || '',
    });
  }

  async function saveEditing(questionId: string) {
    try {
      const res = await fetch(`/api/assessments/${selectedAssessmentId}/questions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          ...editForm,
          status: 'approved',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingQuestionId(null);
        loadAssessmentDetails(selectedAssessmentId);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function approveQuestion(questionId: string) {
    try {
      const res = await fetch(`/api/assessments/${selectedAssessmentId}/questions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          status: 'approved',
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadAssessmentDetails(selectedAssessmentId);
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Loading Assessment Builder Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            href={`/faculty/courses/${courseId}/setup`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course Setup
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">AI Assessment Authoring Studio</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-generate complete question packages: question text, answer keys, rubrics, and progressive hints.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAIQuestions}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-sm transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating Grounded Packages...' : 'Generate Questions with AI'}
          </button>

          <button
            onClick={handlePublishAssessment}
            disabled={publishing || currentAssessment?.status === 'published'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {currentAssessment?.status === 'published' ? 'Published' : 'Publish Assessment'}
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium">
          {msg}
        </div>
      )}

      {/* Assessment Selector */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Assessment:</span>
        <div className="flex gap-2">
          {assessments.map(a => (
            <button
              key={a.id}
              onClick={() => {
                setSelectedAssessmentId(a.id);
                loadAssessmentDetails(a.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedAssessmentId === a.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {a.title} ({a.type})
            </button>
          ))}
        </div>
      </div>

      {/* Assessment Overview Card */}
      {currentAssessment && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{currentAssessment.title}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  currentAssessment.status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentAssessment.status} (v{currentAssessment.version})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{currentAssessment.instructions}</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-slate-400 block">Total Marks</span>
                <span className="font-extrabold text-slate-800 text-base">{currentAssessment.total_marks} pts</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Duration</span>
                <span className="font-extrabold text-slate-800 text-base">{currentAssessment.duration_minutes} min</span>
              </div>
            </div>
          </div>

          {/* Question List Accordion */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Assessment Questions ({currentAssessment.questions?.length || 0})
            </h3>

            {currentAssessment.questions?.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-3">No questions yet in this assessment.</p>
                <button
                  onClick={handleGenerateAIQuestions}
                  disabled={generating}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  Generate First Question Package with AI
                </button>
              </div>
            ) : (
              currentAssessment.questions?.map((q: Question, idx: number) => {
                const isExpanded = expandedQuestionId === q.id;
                const isEditing = editingQuestionId === q.id;
                const traitInfo = BLOOMS_TRAIT_INFO[q.primary_trait];

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border transition ${
                      q.status === 'approved' ? 'border-slate-200 bg-white' : 'border-amber-300 bg-amber-50/20'
                    }`}
                  >
                    {/* Question Header Row */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>

                        <div className="truncate">
                          <span className="font-bold text-xs text-slate-900 truncate block">
                            {q.question_text}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${traitInfo?.badgeColor}`}>
                              {q.primary_trait}
                            </span>
                            {q.secondary_trait && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                + {q.secondary_trait} (30%)
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400">
                              {q.maximum_marks} marks • {q.question_type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {q.status === 'approved' ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => approveQuestion(q.id)}
                            className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[11px] font-semibold hover:bg-amber-200 transition"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Question Package Details (Expanded) */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-slate-100 text-xs space-y-4 mt-2">
                        {isEditing ? (
                          /* Edit Mode */
                          <div className="space-y-3 pt-3">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Question Text</label>
                              <textarea
                                rows={2}
                                value={editForm.questionText}
                                onChange={e => setEditForm({ ...editForm, questionText: e.target.value })}
                                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Primary Trait</label>
                                <select
                                  value={editForm.primaryTrait}
                                  onChange={e => setEditForm({ ...editForm, primaryTrait: e.target.value })}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                >
                                  {ACADEMIC_TRAITS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Secondary Trait</label>
                                <select
                                  value={editForm.secondaryTrait}
                                  onChange={e => setEditForm({ ...editForm, secondaryTrait: e.target.value })}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                >
                                  <option value="">None</option>
                                  {ACADEMIC_TRAITS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Maximum Marks</label>
                                <input
                                  type="number"
                                  value={editForm.maximumMarks}
                                  onChange={e => setEditForm({ ...editForm, maximumMarks: Number(e.target.value) })}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Correct Answer / Key</label>
                              <input
                                type="text"
                                value={editForm.correctAnswer}
                                onChange={e => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Reference Answer</label>
                              <textarea
                                rows={2}
                                value={editForm.referenceAnswer}
                                onChange={e => setEditForm({ ...editForm, referenceAnswer: e.target.value })}
                                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Hint 1</label>
                                <textarea
                                  rows={2}
                                  value={editForm.hint1}
                                  onChange={e => setEditForm({ ...editForm, hint1: e.target.value })}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Hint 2</label>
                                <textarea
                                  rows={2}
                                  value={editForm.hint2}
                                  onChange={e => setEditForm({ ...editForm, hint2: e.target.value })}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => setEditingQuestionId(null)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEditing(q.id)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                              >
                                Save Changes & Approve
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="space-y-3 pt-3">
                            {q.options && q.options.length > 0 && (
                              <div>
                                <span className="font-semibold text-slate-700 block mb-1">Options:</span>
                                <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                                  {q.options.map((opt, oIdx) => (
                                    <li key={oIdx}>{opt}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                <span className="font-bold text-slate-800 block mb-1">Secure Answer Key:</span>
                                <p className="font-mono text-emerald-800 font-semibold mb-2">
                                  {q.answer_key?.correct_answer || 'N/A'}
                                </p>
                                <span className="text-[11px] text-slate-500 block mb-1">Reference Answer:</span>
                                <p className="text-slate-600 italic">{q.answer_key?.reference_answer}</p>
                              </div>

                              <div>
                                <span className="font-bold text-slate-800 block mb-1">Marking Rubric:</span>
                                <div className="space-y-1">
                                  {q.rubric?.criteria.map((c, cIdx) => (
                                    <div key={cIdx} className="flex justify-between text-slate-600 text-[11px]">
                                      <span>• {c.description}</span>
                                      <span className="font-bold">{c.marks} pts</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Progressive Hints Inspection */}
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100">
                                <span className="font-bold text-blue-900 block mb-0.5">Hint 1 (Unlocked on first error):</span>
                                <p className="text-slate-700">{q.hints?.hint_1 || 'No Hint 1 configured'}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100">
                                <span className="font-bold text-indigo-900 block mb-0.5">Hint 2 (Unlocked on second error):</span>
                                <p className="text-slate-700">{q.hints?.hint_2 || 'No Hint 2 configured'}</p>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => startEditing(q)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit Question Package
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
