// ====================================================================
// AdaptiveLearn AI — Response Submission & 2-Hint State Machine API
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';
import { evaluateResponse } from '@/lib/evaluator/evaluation-engine';
import { transitionQuestionState } from '@/lib/evaluator/hint-state-machine';
import { calculateTraitScores } from '@/lib/analytics/trait-calculator';
import { ResponseRecord, HintEvent, TraitScore } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await req.json();
    const { questionId, submittedAnswer } = body;

    if (!questionId || submittedAnswer === undefined) {
      return NextResponse.json(
        { error: 'questionId and submittedAnswer are required' },
        { status: 400 }
      );
    }

    const attempt = mockStore.attempts.find(a => a.id === attemptId);
    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Attempt is already submitted and evaluated.' },
        { status: 400 }
      );
    }

    const question = mockStore.questions.find(q => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Access secure answer key & hints (Server-side privileged access)
    const answerKey = mockStore.answerKeys[questionId];
    const rubric = mockStore.rubrics[questionId];
    const hints = mockStore.hints[questionId];

    if (!answerKey) {
      return NextResponse.json(
        { error: 'Answer key configuration missing for this question' },
        { status: 500 }
      );
    }

    // Existing responses on this question
    const existingResponses = mockStore.responses.filter(
      r => r.attempt_id === attemptId && r.question_id === questionId
    );
    const existingUnlockedHints = mockStore.hintEvents.filter(
      h => h.attempt_id === attemptId && h.question_id === questionId
    );

    // 1. Evaluate response using deterministic/rubric engine
    const evalResult = await evaluateResponse({
      question,
      answerKey,
      rubric,
      submittedAnswer: String(submittedAnswer).trim(),
    });

    // 2. Execute 2-Hint State Machine Transition
    const transition = transitionQuestionState({
      existingResponses,
      unlockedHints: existingUnlockedHints,
      hintsConfig: hints,
      submittedAnswer: String(submittedAnswer).trim(),
      isCorrect: evalResult.isCorrect,
      awardedMarks: evalResult.awardedMarks,
    });

    if (!transition.canSubmit) {
      return NextResponse.json(
        { error: transition.rejectReason || 'Cannot submit answer for this question' },
        { status: 400 }
      );
    }

    // 3. Persist new response record
    const responseRecord: ResponseRecord = {
      id: `resp-${Date.now()}-${transition.responseNumber}`,
      attempt_id: attemptId,
      question_id: questionId,
      response_number: transition.responseNumber,
      submitted_answer: String(submittedAnswer).trim(),
      submitted_at: new Date().toISOString(),
      is_correct: evalResult.isCorrect,
      awarded_marks: transition.finalAwardedMarks,
      is_final: transition.isFinal,
      feedback: evalResult.feedback,
      evaluator: evalResult.evaluator,
      confidence_score: evalResult.confidenceScore,
      package_version: question.version,
    };

    mockStore.responses.push(responseRecord);

    // 4. If state machine unlocked a new hint, record hint event
    let unlockedHintText: string | undefined = undefined;
    if (transition.newUnlockedHintNumber) {
      const hintNumber = transition.newUnlockedHintNumber;
      unlockedHintText = hintNumber === 1 ? hints?.hint_1 : hints?.hint_2;

      const hintEvent: HintEvent = {
        id: `he-${Date.now()}-${hintNumber}`,
        attempt_id: attemptId,
        question_id: questionId,
        hint_number: hintNumber,
        unlocked_at: new Date().toISOString(),
        response_number_triggered: transition.responseNumber as 1 | 2,
      };
      mockStore.hintEvents.push(hintEvent);
    }

    // 5. Check if all questions in the assessment are now finalized
    const assessmentQuestions = mockStore.questions.filter(
      q => q.assessment_id === attempt.assessment_id
    );

    const questionFinalStatuses = assessmentQuestions.map(q => {
      const respForQ = mockStore.responses.filter(
        r => r.attempt_id === attemptId && r.question_id === q.id
      );
      return respForQ.some(r => r.is_final);
    });

    const isAssessmentComplete = questionFinalStatuses.every(Boolean);

    if (isAssessmentComplete) {
      // Finalize attempt
      let totalEarned = 0;
      let totalAvailable = 0;

      const qWithResponses = assessmentQuestions.map(q => {
        const responsesForQ = mockStore.responses.filter(
          r => r.attempt_id === attemptId && r.question_id === q.id
        );
        const finalResp = responsesForQ.find(r => r.is_final) || responsesForQ[responsesForQ.length - 1];

        totalEarned += finalResp ? finalResp.awarded_marks : 0;
        totalAvailable += q.maximum_marks;

        return {
          question: q,
          finalResponse: finalResp,
        };
      });

      attempt.status = 'evaluated';
      attempt.submitted_at = new Date().toISOString();
      attempt.total_score = Number(totalEarned.toFixed(2));
      attempt.percentage = totalAvailable > 0
        ? Number(((totalEarned / totalAvailable) * 100).toFixed(1))
        : 0;

      // Calculate & persist trait scores across the 6 dimensions
      const traitResults = calculateTraitScores(qWithResponses);
      traitResults.forEach(tr => {
        const tsRecord: TraitScore = {
          id: `ts-${attempt.id}-${tr.trait}`,
          attempt_id: attempt.id,
          student_id: attempt.student_id,
          course_id: question.module_id || 'course-1',
          assessment_id: attempt.assessment_id,
          trait: tr.trait,
          earned_marks: tr.earnedMarks,
          max_marks: tr.maxMarks,
          percentage_score: tr.percentageScore,
          question_count: tr.questionCount,
          confidence_level: tr.confidenceLevel,
          calculated_at: new Date().toISOString(),
        };
        mockStore.traitScores.push(tsRecord);
      });
    }

    return NextResponse.json({
      success: true,
      response: responseRecord,
      transition: {
        responseNumber: transition.responseNumber,
        isFinal: transition.isFinal,
        isCorrect: evalResult.isCorrect,
        awardedMarks: transition.finalAwardedMarks,
        feedback: evalResult.feedback,
        unlockedHintNumber: transition.newUnlockedHintNumber,
        unlockedHintText,
      },
      attemptStatus: attempt.status,
      isAssessmentComplete,
    });
  } catch (err: any) {
    console.error('Submit response API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
