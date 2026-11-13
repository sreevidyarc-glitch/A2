import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const {
      questionId,
      status,
      questionText,
      maximumMarks,
      primaryTrait,
      secondaryTrait,
      difficulty,
      correctAnswer,
      referenceAnswer,
      acceptedVariations,
      numericTolerance,
      hint1,
      hint2,
    } = body;

    const question = mockStore.questions.find(q => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Update question metadata
    if (status) question.status = status;
    if (questionText) question.question_text = questionText;
    if (maximumMarks !== undefined) question.maximum_marks = Number(maximumMarks);
    if (primaryTrait) question.primary_trait = primaryTrait;
    if (secondaryTrait !== undefined) question.secondary_trait = secondaryTrait;
    if (difficulty) question.difficulty = difficulty;
    question.updated_at = new Date().toISOString();

    // Update answer key
    const ak = mockStore.answerKeys[question.id];
    if (ak) {
      if (correctAnswer !== undefined) ak.correct_answer = correctAnswer;
      if (referenceAnswer !== undefined) ak.reference_answer = referenceAnswer;
      if (acceptedVariations !== undefined) ak.accepted_variations = acceptedVariations;
      if (numericTolerance !== undefined) ak.numeric_tolerance = Number(numericTolerance);
    }

    // Update hints
    const hints = mockStore.hints[question.id];
    if (hints) {
      if (hint1 !== undefined) hints.hint_1 = hint1;
      if (hint2 !== undefined) hints.hint_2 = hint2;
    }

    return NextResponse.json({
      success: true,
      question: {
        ...question,
        answer_key: ak,
        hints,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

