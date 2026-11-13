import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const attempt = mockStore.attempts.find(a => a.id === attemptId);

  if (!attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  const assessment = mockStore.assessments.find(a => a.id === attempt.assessment_id);
  const responses = mockStore.responses.filter(r => r.attempt_id === attemptId);
  const hintEvents = mockStore.hintEvents.filter(h => h.attempt_id === attemptId);

  // Return unlocked hints with their actual text
  const unlockedHintsWithText = hintEvents.map(he => {
    const hints = mockStore.hints[he.question_id];
    return {
      ...he,
      hint_text: he.hint_number === 1 ? hints?.hint_1 : hints?.hint_2,
    };
  });

  const traitScores = mockStore.traitScores.filter(ts => ts.attempt_id === attemptId);

  return NextResponse.json({
    attempt: {
      ...attempt,
      assessment,
    },
    responses,
    unlockedHints: unlockedHintsWithText,
    traitScores,
  });
}
