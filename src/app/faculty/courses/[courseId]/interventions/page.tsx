'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Edit3,
  BookOpen,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import { Intervention } from '@/types';

export default function FacultyInterventionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [actionMsg, setActionMsg] = useState('');
  const [processing, setProcessing] = useState(false);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editExplanation, setEditExplanation] = useState('');
  const [editAnalogy, setEditAnalogy] = useState('');

  useEffect(() => {
    fetchInterventions();
  }, [courseId]);

  async function fetchInterventions() {
    try {
      const res = await fetch(`/api/interventions?courseId=${courseId}&role=faculty`);
      const data = await res.json();
      if (data.interventions) {
        setInterventions(data.interventions);
        if (data.interventions.length > 0) {
          selectIntervention(data.interventions[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function selectIntervention(item: Intervention) {
    setSelectedIntervention(item);
    setIsEditing(false);
    setEditExplanation(item.content_package?.simplified_explanation || '');
    setEditAnalogy(item.content_package?.analogy || '');
  }

  async function handleAction(action: 'release' | 'reject') {
    if (!selectedIntervention) return;
    setProcessing(true);
    setActionMsg('');

    try {
      const updatedContent = isEditing
        ? {
            ...selectedIntervention.content_package,
            simplified_explanation: editExplanation,
            analogy: editAnalogy,
          }
        : undefined;

      const res = await fetch(`/api/interventions/${selectedIntervention.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          editedContent: updatedContent,
          facultyFeedback: 'Reviewed and certified by course faculty.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg(`Intervention ${action === 'release' ? 'released to student' : 'rejected'}.`);
        fetchInterventions();
      } else {
        setActionMsg(data.error || 'Action failed');
      }
    } catch (err: any) {
      setActionMsg(err.message);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Loading personalized learning packages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            href={`/faculty/courses/${courseId}/analytics`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Analytics
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Personalized Remediation Gatekeeper</h1>
          <p className="text-xs text-slate-500 mt-1">
            Faculty approval is strictly required before any AI-generated learning package is released to students.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold">
          {actionMsg}
        </div>
      )}

      {interventions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800 mb-1">No Interventions Currently Queued</h2>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            Interventions are generated automatically from student diagnostic assessment gaps or can be initiated from the Class Analytics page.
          </p>
          <Link
            href={`/faculty/courses/${courseId}/analytics`}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            Go to Class Analytics →
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar List */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Queued Student Packages ({interventions.length})
            </h2>

            {interventions.map(item => (
              <button
                key={item.id}
                onClick={() => selectIntervention(item)}
                className={`w-full text-left p-4 rounded-xl border transition shadow-sm ${
                  selectedIntervention?.id === item.id
                    ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">{item.student?.full_name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    item.status === 'released'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'pending_approval'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mb-2">{item.title}</div>
                <div className="flex flex-wrap gap-1">
                  {item.targeted_traits.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Package Inspection & Approval Panel */}
          {selectedIntervention && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      Student: {selectedIntervention.student?.full_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedIntervention.status === 'released'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedIntervention.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedIntervention.title}</h2>
                </div>

                {/* Faculty Decision Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={processing}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction('release')}
                    disabled={processing || selectedIntervention.status === 'released'}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {selectedIntervention.status === 'released' ? 'Already Released' : 'Approve & Release to Student'}
                  </button>
                </div>
              </div>

              {/* 10-Point Grounded Remediation Details */}
              <div className="space-y-4 text-xs">
                {/* 1. Learning Gap */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">1. Identified Learning Gap</span>
                  <p className="text-slate-700">{selectedIntervention.learning_gap_summary}</p>
                </div>

                {/* 2. Simplified Explanation (Editable) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">2. Simplified Academic Explanation</span>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-purple-600 hover:text-purple-800 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Text'}
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={editExplanation}
                      onChange={e => setEditExplanation(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  ) : (
                    <p className="text-slate-700 leading-relaxed">
                      {selectedIntervention.content_package?.simplified_explanation}
                    </p>
                  )}
                </div>

                {/* 3. Core Concepts */}
                <div>
                  <span className="font-bold text-slate-900 block mb-2">3. Grounded Core Concepts</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {selectedIntervention.content_package?.core_concepts?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* 4. Worked Examples */}
                <div>
                  <span className="font-bold text-slate-900 block mb-2">4. Step-by-Step Worked Examples</span>
                  <div className="space-y-2">
                    {selectedIntervention.content_package?.worked_examples?.map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white">
                        <span className="font-semibold text-blue-700 block mb-1">Example {idx + 1}: {ex.problem}</span>
                        <p className="text-slate-600 mb-1"><strong>Solution:</strong> {ex.solution}</p>
                        <p className="text-slate-500 italic"><strong>Key Takeaway:</strong> {ex.takeaway}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Analogy */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                  <span className="font-bold text-blue-900 block mb-1">5. Conceptual Analogy</span>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={editAnalogy}
                      onChange={e => setEditAnalogy(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  ) : (
                    <p className="text-slate-700 italic">{selectedIntervention.content_package?.analogy}</p>
                  )}
                </div>

                {/* 6. Practice Questions */}
                <div>
                  <span className="font-bold text-slate-900 block mb-2">
                    6. Embedded Practice Questions ({selectedIntervention.practice_questions?.length || 0})
                  </span>
                  <div className="space-y-2">
                    {selectedIntervention.practice_questions?.map((pq, idx) => (
                      <div key={pq.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <div className="font-semibold text-slate-800 mb-1">Q{idx + 1}: {pq.question_text}</div>
                        <div className="text-emerald-700 font-mono text-[11px] mb-0.5">Answer: {pq.correct_answer}</div>
                        <div className="text-slate-500 text-[11px]">{pq.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
