import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';
import { normalizeText } from '@/lib/evaluator/evaluation-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { practiceQuestionId, studentAnswer } = body;

    const pq = mockStore.practiceQuestions.find(q => q.id === practiceQuestionId);
    if (!pq) {
      return NextResponse.json({ error: 'Practice question not found' }, { status: 404 });
    }

    const normStudent = normalizeText(studentAnswer);
    const normCorrect = normalizeText(pq.correct_answer);

    const isMatch = normStudent === normCorrect || normCorrect.includes(normStudent);

    const attemptRecord = {
      id: `pqa-${Date.now()}`,
      practice_question_id: practiceQuestionId,
      student_id: mockStore.currentUserId,
      student_answer: studentAnswer,
      is_correct: isMatch,
      attempted_at: new Date().toISOString(),
    };
    mockStore.practiceAttempts.push(attemptRecord);

    return NextResponse.json({
      success: true,
      isCorrect: isMatch,
      correctAnswer: pq.correct_answer,
      explanation: pq.explanation,
      feedback: isMatch
        ? 'Great job! Your answer is correct.'
        : `Review required. The correct answer is: ${pq.correct_answer}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
