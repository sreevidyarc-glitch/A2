import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assessment = mockStore.assessments.find(a => a.id === id);

  if (!assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  const questions = mockStore.questions.filter(q => q.assessment_id === id);
  if (questions.length === 0) {
    return NextResponse.json({ error: 'Cannot publish assessment with no questions' }, { status: 400 });
  }

  // Ensure all questions are approved upon publishing
  questions.forEach(q => {
    q.status = 'approved';
  });

  assessment.status = 'published';
  assessment.version += 1;
  assessment.updated_at = new Date().toISOString();

  return NextResponse.json({
    success: true,
    message: `Assessment "${assessment.title}" published successfully (Version ${assessment.version}).`,
    assessment,
  });
}

