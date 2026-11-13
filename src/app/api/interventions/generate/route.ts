import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';
import { generatePersonalizedIntervention } from '@/lib/ai/intervention-generator';
import { Intervention, PracticeQuestion, AcademicTrait } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, studentId, weakTraits, weakOutcomes } = body;

    if (!courseId || !studentId) {
      return NextResponse.json({ error: 'courseId and studentId are required' }, { status: 400 });
    }

    const course = mockStore.courses.find(c => c.id === courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const student = mockStore.profiles.find(p => p.id === studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const approvedMaterials = mockStore.materials.filter(
      m => m.course_id === courseId && m.approval_status === 'approved'
    );
    const courseOutcomes = mockStore.courseOutcomes.filter(co => co.course_id === courseId);
    const diagnosticScores = mockStore.traitScores.filter(ts => ts.student_id === studentId);

    const generated = await generatePersonalizedIntervention({
      course,
      studentName: student.full_name,
      studentId,
      weakTraits: (weakTraits as AcademicTrait[]) || ['Application', 'Analysis'],
      weakOutcomes,
      diagnosticScores,
      approvedMaterials,
      courseOutcomes,
    });

    const interventionId = `int-${Date.now()}`;
    const newIntervention: Intervention = {
      id: interventionId,
      course_id: courseId,
      student_id: studentId,
      targeted_traits: generated.targeted_traits,
      targeted_outcomes: generated.targeted_outcomes,
      title: generated.title,
      learning_gap_summary: generated.learning_gap_summary,
      content_package: generated.content_package,
      status: 'pending_approval', // Requires faculty review before release!
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student,
      course,
    };

    mockStore.interventions.unshift(newIntervention);

    // Save practice questions
    const createdPracticeQuestions: PracticeQuestion[] = [];
    generated.practice_questions.forEach((pq, idx) => {
      const pqRecord: PracticeQuestion = {
        id: `pq-${interventionId}-${idx + 1}`,
        intervention_id: interventionId,
        question_text: pq.question_text,
        question_type: pq.question_type,
        options: pq.options,
        correct_answer: pq.correct_answer,
        explanation: pq.explanation,
        order_index: idx + 1,
        created_at: new Date().toISOString(),
      };
      mockStore.practiceQuestions.push(pqRecord);
      createdPracticeQuestions.push(pqRecord);
    });

    newIntervention.practice_questions = createdPracticeQuestions;

    return NextResponse.json({
      success: true,
      message: 'Personalized learning package generated successfully. Awaiting faculty approval.',
      intervention: newIntervention,
    });
  } catch (err: any) {
    console.error('Intervention generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
