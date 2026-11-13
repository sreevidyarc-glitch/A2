import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTraitScores,
  calculateTraitImprovement,
  QuestionWithResponse,
} from '../../src/lib/analytics/trait-calculator';
import { Question } from '../../src/types';

describe('Academic Trait Calculator', () => {
  it('calculates weighted trait scores without double counting secondary traits', () => {
    const q1: Question = {
      id: 'q1',
      assessment_id: 'a1',
      question_text: 'Define Gradient Descent',
      question_type: 'short_answer',
      maximum_marks: 10,
      primary_trait: 'Remembering',
      difficulty: 'easy',
      order_index: 1,
      status: 'approved',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const q2: Question = {
      id: 'q2',
      assessment_id: 'a1',
      question_text: 'Implement Backpropagation and evaluate loss',
      question_type: 'long_answer',
      maximum_marks: 10,
      primary_trait: 'Application',
      secondary_trait: 'Evaluation', // 70% Application (7 marks), 30% Evaluation (3 marks)
      difficulty: 'hard',
      order_index: 2,
      status: 'approved',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const items: QuestionWithResponse[] = [
      {
        question: q1,
        finalResponse: {
          id: 'r1',
          attempt_id: 'att1',
          question_id: 'q1',
          response_number: 1,
          submitted_answer: 'Definition...',
          submitted_at: new Date().toISOString(),
          is_correct: true,
          awarded_marks: 8, // 8 / 10 = 80%
          is_final: true,
          evaluator: 'deterministic',
          confidence_score: 1.0,
          package_version: 1,
        },
      },
      {
        question: q2,
        finalResponse: {
          id: 'r2',
          attempt_id: 'att1',
          question_id: 'q2',
          response_number: 1,
          submitted_answer: 'Implementation...',
          submitted_at: new Date().toISOString(),
          is_correct: true,
          awarded_marks: 10, // Full marks
          is_final: true,
          evaluator: 'deterministic',
          confidence_score: 1.0,
          package_version: 1,
        },
      },
    ];

    const results = calculateTraitScores(items);

    const remembering = results.find(r => r.trait === 'Remembering');
    assert.equal(remembering?.maxMarks, 10);
    assert.equal(remembering?.earnedMarks, 8);
    assert.equal(remembering?.percentageScore, 80);

    const application = results.find(r => r.trait === 'Application');
    assert.equal(application?.maxMarks, 7); // 70% of 10
    assert.equal(application?.earnedMarks, 7);
    assert.equal(application?.percentageScore, 100);

    const evaluation = results.find(r => r.trait === 'Evaluation');
    assert.equal(evaluation?.maxMarks, 3); // 30% of 10
    assert.equal(evaluation?.earnedMarks, 3);
    assert.equal(evaluation?.percentageScore, 100);
  });

  it('accurately calculates trait improvement percentage points', () => {
    const baseline = [
      { trait: 'Understanding' as const, earnedMarks: 5, maxMarks: 10, percentageScore: 50, questionCount: 4, confidenceLevel: 'medium' as const },
      { trait: 'Analysis' as const, earnedMarks: 4, maxMarks: 10, percentageScore: 40, questionCount: 4, confidenceLevel: 'medium' as const },
    ];

    const finalScores = [
      { trait: 'Understanding' as const, earnedMarks: 8, maxMarks: 10, percentageScore: 80, questionCount: 4, confidenceLevel: 'medium' as const },
      { trait: 'Analysis' as const, earnedMarks: 7.5, maxMarks: 10, percentageScore: 75, questionCount: 4, confidenceLevel: 'medium' as const },
    ];

    const improvement = calculateTraitImprovement(baseline, finalScores);

    assert.equal(improvement.Understanding.deltaPp, 30.0);
    assert.equal(improvement.Analysis.deltaPp, 35.0);
  });
});
