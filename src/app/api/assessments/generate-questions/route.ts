import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';
import { generateQuestionPackage } from '@/lib/ai/question-generator';
import { Question, QuestionAnswerKey, QuestionRubric, QuestionHints } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assessmentId, questionCount } = body;

    if (!assessmentId) {
      return NextResponse.json({ error: 'assessmentId is required' }, { status: 400 });
    }

    const assessment = mockStore.assessments.find(a => a.id === assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const course = mockStore.courses.find(c => c.id === assessment.course_id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Retrieve approved course materials for grounding
    const approvedMaterials = mockStore.materials.filter(
      m => m.course_id === course.id && m.approval_status === 'approved'
    );

    const courseOutcomes = mockStore.courseOutcomes.filter(co => co.course_id === course.id);

    // Call AI Question Generator
    const generatedPackage = await generateQuestionPackage({
      courseTitle: course.title,
      courseCode: course.code,
      assessmentType: (assessment.type === 'practice' ? 'module' : assessment.type) as 'diagnostic' | 'module' | 'final',
      questionCount: questionCount || 4,
      approvedMaterials,
      courseOutcomes,
    });

    const newQuestions: Question[] = [];
    let totalAddedMarks = 0;

    for (let i = 0; i < generatedPackage.questions.length; i++) {
      const gq = generatedPackage.questions[i];
      const qId = `q-${Date.now()}-${i + 1}`;
      const outcome = courseOutcomes.find(co => co.code === gq.course_outcome_code) || courseOutcomes[0];

      const questionRecord: Question = {
        id: qId,
        assessment_id: assessment.id,
        module_id: assessment.module_id,
        course_outcome_id: outcome?.id,
        question_text: gq.question_text,
        question_type: gq.question_type,
        options: gq.options,
        maximum_marks: gq.maximum_marks,
        primary_trait: gq.primary_trait,
        secondary_trait: gq.secondary_trait,
        difficulty: gq.difficulty,
        order_index: mockStore.questions.filter(q => q.assessment_id === assessment.id).length + i + 1,
        status: 'generated', // Pending faculty review
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const answerKeyRecord: QuestionAnswerKey = {
        id: `ak-${qId}`,
        question_id: qId,
        correct_answer: gq.correct_answer,
        reference_answer: gq.reference_answer,
        accepted_variations: gq.accepted_variations || [],
        numeric_tolerance: gq.numeric_tolerance || 0,
        evaluation_method: gq.evaluation_method,
        created_at: new Date().toISOString(),
      };

      const rubricRecord: QuestionRubric = {
        id: `rub-${qId}`,
        question_id: qId,
        criteria: gq.rubric.criteria,
        total_rubric_marks: gq.rubric.total_marks,
        ai_evaluation_prompt: gq.rubric.ai_evaluation_prompt,
        created_at: new Date().toISOString(),
      };

      const hintRecord: QuestionHints = {
        id: `h-${qId}`,
        question_id: qId,
        hint_1: gq.hint_1,
        hint_2: gq.hint_2,
        created_at: new Date().toISOString(),
      };

      // Persist in segregated tables
      mockStore.questions.push(questionRecord);
      mockStore.answerKeys[qId] = answerKeyRecord;
      mockStore.rubrics[qId] = rubricRecord;
      mockStore.hints[qId] = hintRecord;

      newQuestions.push({
        ...questionRecord,
        answer_key: answerKeyRecord,
        rubric: rubricRecord,
        hints: hintRecord,
      });

      totalAddedMarks += gq.maximum_marks;
    }

    // Update assessment total marks
    assessment.total_marks += totalAddedMarks;
    assessment.updated_at = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${newQuestions.length} complete question packages grounded in course material.`,
      questions: newQuestions,
    });
  } catch (err: any) {
    console.error('Question generation endpoint failure:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
