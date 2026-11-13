import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';
import { Assessment } from '@/types';
import { z } from 'zod';

const AssessmentCreateSchema = z.object({
  course_id: z.string(),
  module_id: z.string().optional(),
  title: z.string().min(3),
  type: z.enum(['diagnostic', 'module', 'practice', 'final']),
  instructions: z.string().optional(),
  duration_minutes: z.number().default(60),
  total_marks: z.number().default(30),
  passing_marks: z.number().default(15),
  allow_hints: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  const type = searchParams.get('type');

  let list = [...mockStore.assessments];

  if (courseId) {
    list = list.filter(a => a.course_id === courseId);
  }
  if (type) {
    list = list.filter(a => a.type === type);
  }

  // Filter for students: only show published
  if (mockStore.currentUserRole === 'student') {
    list = list.filter(a => a.status === 'published');
  }

  const enriched = list.map(a => {
    const course = mockStore.courses.find(c => c.id === a.course_id);
    const questionsCount = mockStore.questions.filter(q => q.assessment_id === a.id).length;
    return {
      ...a,
      course,
      questions_count: questionsCount,
    };
  });

  return NextResponse.json({ assessments: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = AssessmentCreateSchema.parse(body);

    const newAssessment: Assessment = {
      id: `asmt-${Date.now()}`,
      course_id: data.course_id,
      module_id: data.module_id,
      title: data.title,
      type: data.type,
      instructions: data.instructions || 'Answer all questions to the best of your ability.',
      duration_minutes: data.duration_minutes,
      total_marks: data.total_marks,
      passing_marks: data.passing_marks,
      status: 'draft',
      version: 1,
      allow_hints: data.allow_hints,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockStore.assessments.push(newAssessment);

    return NextResponse.json({ success: true, assessment: newAssessment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
