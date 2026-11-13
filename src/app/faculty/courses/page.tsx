'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Users, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Course } from '@/types';

export default function FacultyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    academic_term: 'Fall 2026',
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch('/api/courses?role=faculty');
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Course created successfully!');
        setFormData({ code: '', title: '', description: '', academic_term: 'Fall 2026' });
        setShowCreateModal(false);
        fetchCourses();
      } else {
        setMsg(data.error || 'Failed to create course');
      }
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Portfolio</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure learning objectives, upload lecture materials, and structure assessment modules.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Course
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {msg}
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map(course => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {course.code}
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Enroll Code: {course.enrollment_code}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2 leading-snug">{course.title}</h2>
              <p className="text-xs text-slate-500 line-clamp-3 mb-4">{course.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 mb-4">
                <div>
                  <span className="text-slate-400 block">Enrolled Students</span>
                  <span className="font-semibold text-slate-700">{course.students_count || 0} students</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Term</span>
                  <span className="font-semibold text-slate-700">{course.academic_term}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href={`/faculty/courses/${course.id}/setup`}
                className="w-full text-center py-2 px-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold hover:bg-blue-100 transition block"
              >
                Manage Setup & Uploads →
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/faculty/courses/${course.id}/assessments/builder`}
                  className="w-full text-center py-1.5 px-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition block"
                >
                  Assessments
                </Link>
                <Link
                  href={`/faculty/courses/${course.id}/analytics`}
                  className="w-full text-center py-1.5 px-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition block"
                >
                  Class Analytics
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating Course */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create New Academic Course</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter course information. An enrollment code will be automatically generated for student self-registration.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS501"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Neural Architectures"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of course scope, prerequisites, and learning objectives..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                >
                  {submitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

