'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  BrainCircuit,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Course, Assessment, Intervention } from '@/types';

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollCode, setEnrollCode] = useState('');
  const [enrollMsg, setEnrollMsg] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cRes, aRes, iRes] = await Promise.all([
        fetch('/api/courses?role=student'),
        fetch('/api/assessments'),
        fetch('/api/interventions?role=student'),
      ]);
      const cData = await cRes.json();
      const aData = await aRes.json();
      const iData = await iRes.json();

      if (cData.courses) setCourses(cData.courses);
      if (aData.assessments) setAssessments(aData.assessments);
      if (iData.interventions) setInterventions(iData.interventions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollCode) return;
    setEnrolling(true);
    setEnrollMsg('');

    try {
      const res = await fetch(`/api/courses/dummy/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentCode: enrollCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEnrollMsg(data.message);
        setEnrollCode('');
        loadData();
      } else {
        setEnrollMsg(data.error || 'Enrollment failed');
      }
    } catch (err: any) {
      setEnrollMsg(err.message);
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Loading student learning center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Learning Portal</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track diagnostic trait scores, complete progressive 2-hint examinations, and access personalized packages.
          </p>
        </div>

        {/* Course Enrollment Quick Input */}
        <form onSubmit={handleEnroll} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Course Code (e.g. ML-2026)"
            value={enrollCode}
            onChange={e => setEnrollCode(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl w-60 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            disabled={enrolling}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition disabled:opacity-50 shrink-0"
          >
            {enrolling ? 'Joining...' : 'Join Course'}
          </button>
        </form>
      </div>

      {enrollMsg && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
          {enrollMsg}
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Courses</span>
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{courses.length}</div>
          <div className="text-xs text-slate-500 mt-1">CS301, CS204 active</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Assessments</span>
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{assessments.length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Progressive hints enabled</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Personalized Packages</span>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600">{interventions.length}</div>
          <div className="text-xs text-slate-500 mt-1">Approved by course faculty</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Personal Delta Gain</span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">+23.0 pp</div>
          <div className="text-xs text-slate-500 mt-1">Diagnostic to Final improvement</div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Courses</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {course.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Instructor: {course.faculty?.full_name || 'Dr. Alan Turing'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{course.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{course.description}</p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <Link
                  href={`/student/courses/${course.id}`}
                  className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                >
                  Enter Course & Assessments →
                </Link>
                <Link
                  href={`/student/reports`}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  View Reports
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Assessments Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Assigned Assessments</h2>
        <div className="divide-y divide-slate-100">
          {assessments.map(a => (
            <div key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-900">{a.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                    {a.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{a.instructions}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span>Duration: {a.duration_minutes} mins</span>
                  <span>•</span>
                  <span>Total Marks: {a.total_marks} pts</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">Progressive 2-Hint Assistance Enabled</span>
                </div>
              </div>

              <Link
                href={`/student/assessments/${a.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shrink-0"
              >
                Launch Assessment <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
