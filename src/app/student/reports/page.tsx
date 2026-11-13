'use client';

import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { BLOOMS_TRAIT_INFO } from '@/lib/constants';

export default function StudentReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      const studentId = authData.profile?.id || 'stu-1';

      const res = await fetch(`/api/analytics/course-1?studentId=${studentId}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Calculating your personalized trait delta report...</p>
      </div>
    );
  }

  if (!data || !data.traitComparison) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm">
        No assessment records found for this student. Complete the diagnostic and final examination to view reports.
      </div>
    );
  }

  const chartData = data.traitComparison.map((t: any) => ({
    trait: t.trait,
    'Baseline Diagnostic': t.baseline,
    'Final Examination': t.final,
    delta: t.delta_pp,
  }));

  const radarData = data.traitComparison.map((t: any) => ({
    subject: t.trait,
    Baseline: t.baseline,
    Final: t.final,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" /> Official Trait Certification
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Trait Mastery & Improvement Report</h1>
          <p className="text-xs text-slate-500 mt-1">
            Student: <span className="font-semibold text-slate-800">{data.student?.full_name}</span> • Course: CS301 Machine Learning
          </p>
        </div>

        {/* Big Overall Metric Badge */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div>
            <span className="text-slate-400 block">Baseline Diagnostic</span>
            <span className="text-lg font-bold text-slate-700">{data.overallBaseline}%</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block">Final Exam</span>
            <span className="text-lg font-bold text-blue-600">{data.overallFinal}%</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block">Net Growth</span>
            <span className="text-lg font-extrabold text-emerald-600">+{data.overallImprovementPp} pp</span>
          </div>
        </div>
      </div>

      {/* Visualizations: Radar and Comparative Bar */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Map */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Your 6-Dimensional Trait Radar</h2>
            <p className="text-xs text-slate-500 mb-2">Notice the outward expansion across all 6 cognitive dimensions.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Baseline Diagnostic" dataKey="Baseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                <Radar name="Final Examination" dataKey="Final" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparative Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Direct Dimension Comparison</h2>
          <p className="text-xs text-slate-500 mb-4">Baseline vs. final scores mapped per trait dimension.</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="trait" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Baseline Diagnostic" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Final Examination" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trait Card Grid with Evidence & Confidence Status */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Trait-Wise Performance & Confidence Breakdown</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.traitComparison.map((item: any) => {
            const info = BLOOMS_TRAIT_INFO[item.trait as keyof typeof BLOOMS_TRAIT_INFO];
            return (
              <div key={item.trait} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${item.badgeColor}`}>
                    {item.trait} (Level {info?.level})
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +{item.delta_pp} pp
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Baseline</span>
                    <span className="font-extrabold text-slate-600 text-lg">{item.baseline}%</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Final Mastery</span>
                    <span className="font-extrabold text-slate-900 text-xl">{item.final}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Evidence Count: 4 questions</span>
                  <span className="font-semibold text-emerald-600">Reliability: High</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

