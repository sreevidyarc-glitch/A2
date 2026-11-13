'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Eye,
} from 'lucide-react';
import { LearningMaterial } from '@/types';

export default function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [readingMaterial, setReadingMaterial] = useState<LearningMaterial | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json();
        if (data.course) setCourse(data.course);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Loading course syllabus and materials...</p>
      </div>
    );
  }

  if (!course) {
    return <div className="py-12 text-center text-slate-500">Course not found.</div>;
  }

  const approvedMaterials = course.materials?.filter((m: any) => m.approval_status === 'approved') || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="pb-4 border-b border-slate-200">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {course.code}
          </span>
          <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">{course.description}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assessments & Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assessments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" /> Course Assessments
            </h2>
            <div className="space-y-3">
              {course.assessments?.map((a: any) => (
                <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">{a.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {a.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{a.instructions}</p>
                    <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                      Progressive 2-Hint Assistance Available
                    </span>
                  </div>

                  <Link
                    href={`/student/assessments/${a.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shrink-0 flex items-center gap-1.5"
                  >
                    Start Exam <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Modules */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Curriculum Modules
            </h2>
            <div className="space-y-3">
              {course.modules?.map((m: any) => (
                <div key={m.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">
                    Module {m.order_index}
                  </span>
                  <div className="font-semibold text-xs text-slate-900">{m.title}</div>
                  <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Approved Lecture Notes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Approved Course Notes
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Materials certified by course faculty for study and grounded exam preparation.
            </p>

            {approvedMaterials.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No notes released yet.</p>
            ) : (
              <div className="space-y-2.5">
                {approvedMaterials.map((mat: LearningMaterial) => (
                  <div key={mat.id} className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 transition flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block truncate max-w-[180px]">
                        {mat.filename}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {mat.file_type.toUpperCase()} • {mat.extracted_text?.split(/\s+/).filter(Boolean).length || 0} words
                      </span>
                    </div>

                    <button
                      onClick={() => setReadingMaterial(mat)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Read
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      {readingMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">{readingMaterial.filename}</h3>
              <button
                onClick={() => setReadingMaterial(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 py-4 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
              {readingMaterial.extracted_text}
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setReadingMaterial(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
