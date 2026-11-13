'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Users,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { BLOOMS_TRAIT_INFO } from '@/lib/constants';

export default function FacultyAnalyticsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingForStudent, setGeneratingForStudent] = useState<string | null>(null);
  const [genMsg, setGenMsg] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  async function fetchAnalytics() {
    try {
      const res = await fetch(`/api/analytics/${courseId}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function triggerIntervention(studentId: string, weakTraits: string[]) {
    setGeneratingForStudent(studentId);
    setGenMsg('');

    try {
      const res = await fetch('/api/interventions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          studentId,
          weakTraits,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setGenMsg(`Personalized remediation generated for student. Awaiting your approval.`);
        fetchAnalytics();
      } else {
        setGenMsg(resData.error || 'Failed to generate intervention');
      }
    } catch (err: any) {
      setGenMsg(err.message);
    } finally {
      setGeneratingForStudent(null);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Calculating trait analytics & cohort distributions...</p>
      </div>
    );
  }

  if (!data || !data.classTraitSummary) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm">
        No assessment analytics available for this course yet.
      </div>
    );
  }

  const chartData = data.classTraitSummary.map((t: any) => ({
    trait: t.trait,
    'Baseline Diagnostic': t.classBaselineAvg,
    'Final Exam': t.classFinalAvg,
    delta: t.improvementDeltaPp,
  }));

  const radarData = data.classTraitSummary.map((t: any) => ({
    subject: t.trait,
    Baseline: t.classBaselineAvg,
    Final: t.classFinalAvg,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            href={`/faculty/courses/${courseId}/setup`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {data.course.code}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Cohort Trait Analytics & Improvement</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Measured across 6 Bloom dimensions: Remembering, Understanding, Application, Analysis, Creativity, Evaluation.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-slate-400 block">Baseline Avg</span>
            <span className="font-extrabold text-slate-800 text-base">{data.classBaselineOverall}%</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block">Final Avg</span>
            <span className="font-extrabold text-emerald-600 text-base">{data.classFinalOverall}%</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block">Class Delta</span>
            <span className="font-extrabold text-purple-600 text-base">
              +{(data.classFinalOverall - data.classBaselineOverall).toFixed(1)} pp
            </span>
          </div>
        </div>
      </div>

      {genMsg && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold">
          {genMsg}
        </div>
      )}

      {/* Trait Visualizations: Radar and Comparative Bar */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trait Comparative Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Trait Scores: Baseline vs. Final Exam</h2>
          <p className="text-xs text-slate-500 mb-4">Class averages showing percentage point improvements.</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="trait" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Baseline Diagnostic" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Final Exam" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6-Trait Radar Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Bloom Trait Attainment Radar</h2>
            <p className="text-xs text-slate-500 mb-2">Multidimensional mastery contour of the enrolled cohort.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Baseline Diagnostic" dataKey="Baseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                <Radar name="Final Exam" dataKey="Final" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trait Delta Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.classTraitSummary.map((t: any) => (
          <div key={t.trait} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] font-bold text-slate-600 block mb-1 truncate">{t.trait}</span>
            <div className="text-xl font-extrabold text-slate-900 mb-0.5">{t.classFinalAvg}%</div>
            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              +{t.improvementDeltaPp} pp
            </span>
          </div>
        ))}
      </div>

      {/* Remediation Candidate Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Students Requiring Personalized Remediation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified by diagnostic baseline scores below the 60% mastery threshold.
            </p>
          </div>
          <Link
            href={`/faculty/courses/${courseId}/interventions`}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            Manage All Interventions <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.studentsRequiringIntervention.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No students currently below remediation threshold.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.studentsRequiringIntervention.map((item: any) => (
              <div key={item.student.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{item.student.full_name}</span>
                    <span className="text-xs font-mono text-slate-400">({item.student.email})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Baseline: <strong className="text-slate-800">{item.baselineScore}%</strong></span>
                    <span>•</span>
                    <span>Weakest Dimensions: <strong className="text-amber-700">{item.weakestTraits.join(', ')}</strong></span>
                  </div>
                </div>

                <div>
                  {item.hasIntervention ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Remediation Assigned
                    </span>
                  ) : (
                    <button
                      onClick={() => triggerIntervention(item.student.id, item.weakestTraits)}
                      disabled={generatingForStudent === item.student.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {generatingForStudent === item.student.id ? 'Generating...' : 'Generate Remediation Package'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
