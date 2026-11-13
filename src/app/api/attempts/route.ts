import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';
import { Attempt } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const assessmentId = searchParams.get('assessmentId');
  const studentId = searchParams.get('studentId') || mockStore.currentUserId;

  let list = mockStore.attempts.filter(a => a.student_id === studentId);
  if (assessmentId) {
    list = list.filter(a => a.assessment_id === assessmentId);
  }

  const enriched = list.map(a => {
    const assessment = mockStore.assessments.find(asmt => asmt.id === a.assessment_id);
    return {
      ...a,
      assessment,
    };
  });

  return NextResponse.json({ attempts: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assessmentId } = body;
    const studentId = mockStore.currentUserId;

    if (!assessmentId) {
      return NextResponse.json({ error: 'assessmentId is required' }, { status: 400 });
    }

    const assessment = mockStore.assessments.find(a => a.id === assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Check for existing active attempt
    const existingActive = mockStore.attempts.find(
      a => a.assessment_id === assessmentId && a.student_id === studentId && a.status === 'in_progress'
    );

    if (existingActive) {
      // Return existing in-progress attempt
      const responses = mockStore.responses.filter(r => r.attempt_id === existingActive.id);
      const unlockedHints = mockStore.hintEvents.filter(h => h.attempt_id === existingActive.id);

      return NextResponse.json({
        success: true,
        attempt: existingActive,
        responses,
        unlockedHints,
      });
    }

    const attemptNumber = mockStore.attempts.filter(
      a => a.assessment_id === assessmentId && a.student_id === studentId
    ).length + 1;

    const newAttempt: Attempt = {
      id: `att-${Date.now()}`,
      assessment_id: assessmentId,
      student_id: studentId,
      attempt_number: attemptNumber,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      total_score: 0,
      percentage: 0,
      created_at: new Date().toISOString(),
    };

    mockStore.attempts.push(newAttempt);

    return NextResponse.json({
      success: true,
      attempt: newAttempt,
      responses: [],
      unlockedHints: [],
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

