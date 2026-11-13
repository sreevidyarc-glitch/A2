import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assessment = mockStore.assessments.find(a => a.id === id);

  if (!assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  const role = mockStore.currentUserRole;
  const rawQuestions = mockStore.questions.filter(q => q.assessment_id === id);
  const course = mockStore.courses.find(c => c.id === assessment.course_id);

  let sanitizedQuestions;
  if (role === 'faculty') {
    // Faculty sees full question package: text, answer keys, rubrics, hints
    sanitizedQuestions = rawQuestions.map(q => ({
      ...q,
      answer_key: mockStore.answerKeys[q.id],
      rubric: mockStore.rubrics[q.id],
      hints: mockStore.hints[q.id],
    }));
  } else {
    // Student sees ONLY question metadata, options, marks, difficulty, traits
    // Answer keys, rubrics, and hints are STRICTLY STRIPPED!
    sanitizedQuestions = rawQuestions.map(q => ({
      id: q.id,
      assessment_id: q.assessment_id,
      module_id: q.module_id,
      course_outcome_id: q.course_outcome_id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      maximum_marks: q.maximum_marks,
      primary_trait: q.primary_trait,
      secondary_trait: q.secondary_trait,
      difficulty: q.difficulty,
      order_index: q.order_index,
      status: q.status,
      version: q.version,
    }));
  }

  return NextResponse.json({
    assessment: {
      ...assessment,
      course,
      questions: sanitizedQuestions,
    },
  });
}

