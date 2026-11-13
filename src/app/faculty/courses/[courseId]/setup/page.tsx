'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Plus,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Course, CourseModule, CourseOutcome, LearningMaterial } from '@/types';

export default function CourseSetupPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'modules' | 'outcomes'>('materials');
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');

  // Upload Form states
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  // Extracted text preview state
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  async function fetchCourseData() {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      if (data.course) setCourse(data.course);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setMsg('');

    try {
      const formData = new FormData();
      formData.append('courseId', courseId);

      if (uploadMode === 'file' && file) {
        formData.append('file', file);
      } else if (uploadMode === 'text' && manualText) {
        formData.append('manualText', manualText);
        formData.append('filename', docTitle || 'Module_Lecture_Notes.txt');
      } else {
        setMsg('Please provide a file or text content');
        setUploading(false);
        return;
      }

      const res = await fetch('/api/materials', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setMsg(`Document ingested successfully (${data.wordCount} words extracted). Awaiting faculty approval.`);
        setFile(null);
        setManualText('');
        setDocTitle('');
        fetchCourseData();
      } else {
        setMsg(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function toggleApproval(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    try {
      const res = await fetch('/api/materials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approvalStatus: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCourseData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteMaterial(id: string) {
    if (!confirm('Are you sure you want to remove this learning material?')) return;
    try {
      const res = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCourseData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Loading course configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            href="/faculty/courses"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to courses
          </Link>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {course.code}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/faculty/courses/${courseId}/assessments/builder`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" /> Assessment Studio →
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'materials'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Learning Materials ({course.materials?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'modules'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Curriculum Modules ({course.modules?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('outcomes')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'outcomes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Course Outcomes ({course.course_outcomes?.length || 0})
        </button>
      </div>

      {/* TAB 1: MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Ingestion Box */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">Upload & Ground Course Content</h2>
            <p className="text-xs text-slate-500 mb-4">
              Upload PDF lecture notes, DOCX files, PPTX slide summaries, or paste raw text. The AI Question Generator and Remediation Engine will ground all generation strictly on these approved sources.
            </p>

            {msg && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
                {msg}
              </div>
            )}

            <div className="flex gap-4 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  uploadMode === 'file' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                Upload File (PDF / DOCX / PPTX)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('text')}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  uploadMode === 'text' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                Paste Direct Text / Notes
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {uploadMode === 'file' ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-1 font-medium">
                    {file ? file.name : 'Select a PDF, DOCX, or PPTX file to upload'}
                  </p>
                  <p className="text-[11px] text-slate-400 mb-3">Up to 25MB • Server text extraction</p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.pptx,.ppt,.txt"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Module 3: Gradient Descent Derivations"
                      value={docTitle}
                      onChange={e => setDocTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lecture Text Content</label>
                    <textarea
                      rows={6}
                      placeholder="Paste syllabus definitions, derivations, worked formulas, or lecture summaries..."
                      value={manualText}
                      onChange={e => setManualText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50"
              >
                {uploading ? 'Extracting & Saving Text...' : 'Ingest Document'}
              </button>
            </form>
          </div>

          {/* Uploaded Materials Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Ingested Learning Materials</h2>

            {course.materials?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No materials uploaded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {course.materials?.map((mat: LearningMaterial) => (
                  <div key={mat.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{mat.filename}</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {mat.file_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Extracted {mat.extracted_text ? `${mat.extracted_text.split(/\s+/).filter(Boolean).length} words` : '0 words'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Approval Status Toggle */}
                      <button
                        onClick={() => toggleApproval(mat.id, mat.approval_status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          mat.approval_status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {mat.approval_status === 'approved' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved for AI
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> Pending Review
                          </>
                        )}
                      </button>

                      {/* Preview Extracted Text */}
                      <button
                        onClick={() => setPreviewMaterial(mat)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                        title="Preview Extracted Text"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteMaterial(mat.id)}
                        className="p-2 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MODULES */}
      {activeTab === 'modules' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">Curriculum Modules</h2>
          <div className="space-y-3">
            {course.modules?.map((m: CourseModule) => (
              <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-xs font-bold text-blue-600 block mb-1">Module {m.order_index}</span>
                <h3 className="font-bold text-slate-900 text-sm">{m.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COURSE OUTCOMES */}
      {activeTab === 'outcomes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">Course Outcomes (CO)</h2>
          <div className="space-y-3">
            {course.course_outcomes?.map((co: CourseOutcome) => (
              <div key={co.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                  {co.code}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{co.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Text Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">{previewMaterial.filename}</h3>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 py-4 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
              {previewMaterial.extracted_text || 'No text extracted.'}
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>{previewMaterial.extracted_text?.split(/\s+/).filter(Boolean).length || 0} total words</span>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
