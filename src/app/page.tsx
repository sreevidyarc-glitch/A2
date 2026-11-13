'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrainCircuit, GraduationCap, Users, ArrowRight, ShieldCheck, Sparkles, BarChart3 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.profile) {
          if (data.profile.role === 'faculty') {
            router.push('/faculty/dashboard');
          } else {
            router.push('/student/dashboard');
          }
        }
      } catch {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
    checkRole();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto py-12 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
        <Sparkles className="w-4 h-4 text-blue-600" />
        AI-Powered Academic Assessment & Remediation
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
        Welcome to <span className="text-blue-600">AdaptiveLearn AI</span>
      </h1>
      
      <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
        The pedagogical cycle of <span className="font-semibold text-slate-800">ASSESS → DIAGNOSE → PERSONALIZE → PRACTICE → ASSIST → IMPROVE</span>.
        Grounding questions in uploaded syllabus notes, progressive 2-hint examinations, and 6-trait academic analytics.
      </p>

      {/* Two Portal Cards */}
      <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-12">
        <Link
          href="/faculty/dashboard"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center justify-between">
            Faculty Portal
            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition" />
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Upload course materials, generate AI question packages, approve rubrics and hints, and release personalized interventions.
          </p>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
            Enter as Dr. Alan Turing →
          </span>
        </Link>

        <Link
          href="/student/dashboard"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center justify-between">
            Student Portal
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition" />
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Attempt diagnostic assessments, examine with progressive 2-hint assistance, access personalized learning packages and practice.
          </p>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Enter as Aarav Sharma →
          </span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Answer Keys Isolated with RLS</span>
        <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-blue-600" /> 6 Bloom Traits (Remembering to Evaluation)</span>
        <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-600" /> Grounded in Approved PDF/DOCX</span>
      </div>
    </div>
  );
}
