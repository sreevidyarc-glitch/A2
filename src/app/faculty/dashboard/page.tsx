'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  BrainCircuit,
  FileCheck2,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Course, Intervention } from '@/types';

export default function FacultyDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, iRes] = await Promise.all([
          fetch('/api/courses?role=faculty'),
          fetch('/api/interventions?role=faculty'),
        ]);
        const cData = await cRes.json();
        const iData = await iRes.json();

        if (cData.courses) setCourses(cData.courses);
        if (iData.interventions) setInterventions(iData.interventions);
      } catch (err) {
        console.error('Failed to load faculty dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalStudents = courses.reduce((acc, c) => acc + (c.students_count || 0), 0);
  const pendingInterventions = interventions.filter(i => i.status === 'pending_approval');

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Loading faculty dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor course outcomes, approve AI question packages, and release personalized remediations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/faculty/courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Create Course
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Courses</span>
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{courses.length}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>CS301, CS204, CS410</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Students</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalStudents}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 25 active in demonstration cohort
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <FileCheck2 className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{pendingInterventions.length}</div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            {pendingInterventions.length > 0 ? 'Interventions require review' : 'All packages reviewed'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Trait Delta</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600">+22.4 pp</div>
          <div className="text-xs text-slate-500 mt-1">
            Baseline vs. Final gain
          </div>
        </div>
      </div>

      {/* Main Course List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Your Assigned Courses</h2>
          <span className="text-xs text-slate-500">{courses.length} courses total</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Code: {course.enrollment_code}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{course.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{course.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 mb-4">
                  <div>
                    <span className="text-slate-400 block">Enrolled</span>
                    <span className="font-semibold text-slate-700">{course.students_count || 0} students</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Modules</span>
                    <span className="font-semibold text-slate-700">{course.modules_count || 0} modules</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/faculty/courses/${course.id}/setup`}
                    className="w-full text-center py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Setup & Materials
                  </Link>
                  <Link
                    href={`/faculty/courses/${course.id}/assessments/builder`}
                    className="w-full text-center py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                  >
                    Assessments
                  </Link>
                </div>
                <Link
                  href={`/faculty/courses/${course.id}/analytics`}
                  className="w-full text-center py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                >
                  Trait Analytics & Reports <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Remediations / Interventions Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">Personalized Trait Remediations</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Pedagogical Step: DIAGNOSE → PERSONALIZE → PRACTICE
          </span>
        </div>

        {interventions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No active interventions generated yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {interventions.slice(0, 5).map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-800">{item.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'released'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'pending_approval'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Student: <span className="font-medium text-slate-700">{item.student?.full_name}</span> • Targeted Traits: {item.targeted_traits.join(', ')}
                  </p>
                </div>
                <Link
                  href={`/faculty/courses/${item.course_id}/interventions`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-purple-200 text-purple-700 hover:bg-purple-50 transition"
                >
                  Review & Release →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

