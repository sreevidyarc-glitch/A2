import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GeneratedQuestionSchema,
  GeneratedAssessmentPackageSchema,
} from '../../src/lib/ai/schemas/question-package';

describe('Question Package Schema Validation', () => {
  it('accepts a complete, valid question package', () => {
    const validQuestion = {
      question_text: 'Explain the difference between supervised and unsupervised learning.',
      question_type: 'short_answer',
      correct_answer: 'Supervised uses labeled data; unsupervised uses unlabeled data.',
      reference_answer: 'Supervised learning trains on labeled data mapping inputs to targets, whereas unsupervised learning discovers latent structures in unlabeled data.',
      accepted_variations: ['labeled vs unlabeled data', 'supervision uses labels'],
      explanation: 'Supervised algorithms require ground truth labels, unsupervised algorithms find intrinsic patterns.',
      rubric: {
        criteria: [
          { description: 'Explains supervised learning with labeled data', marks: 2 },
          { description: 'Explains unsupervised learning with unlabeled data', marks: 2 },
          { description: 'Provides clear comparative contrast', marks: 1 },
        ],
        total_marks: 5,
        ai_evaluation_prompt: 'Assess understanding of labeled vs unlabeled data.',
      },
      maximum_marks: 5,
      primary_trait: 'Understanding',
      secondary_trait: 'Analysis',
      course_outcome_code: 'CO1',
      difficulty: 'medium',
      hint_1: 'Think about whether target outputs are provided during training.',
      hint_2: 'Consider classification vs clustering as representative examples.',
      evaluation_method: 'ai_rubric',
      numeric_tolerance: 0,
    };

    const parsed = GeneratedQuestionSchema.safeParse(validQuestion);
    assert.equal(parsed.success, true);
  });

  it('rejects incomplete packages lacking hints or rubrics', () => {
    const invalidQuestion = {
      question_text: 'Short question text?',
      question_type: 'mcq',
      correct_answer: 'A',
      // Missing reference answer, rubric, hints
    };

    const parsed = GeneratedQuestionSchema.safeParse(invalidQuestion);
    assert.equal(parsed.success, false);
    if (!parsed.success) {
      assert.ok(parsed.error.issues.length > 0);
    }
  });

  it('validates a complete assessment package containing multiple questions', () => {
    const pkg = {
      assessment_title: 'CS301 Diagnostic Assessment: Machine Learning Foundations',
      instructions: 'Answer all questions. You have 60 minutes.',
      questions: [
        {
          question_text: 'What is the primary objective of gradient descent in optimization?',
          question_type: 'mcq',
          options: [
            'A) Minimize the loss function',
            'B) Maximize training accuracy only',
            'C) Invert the covariance matrix',
            'D) Randomize model weights',
          ],
          correct_answer: 'A',
          reference_answer: 'Minimize the loss function by updating parameters in the opposite direction of the gradient.',
          accepted_variations: ['A', 'Minimize loss'],
          explanation: 'Gradient descent minimizes the objective loss function iteratively.',
          rubric: {
            criteria: [{ description: 'Correct option selection', marks: 2 }],
            total_marks: 2,
          },
          maximum_marks: 2,
          primary_trait: 'Remembering',
          course_outcome_code: 'CO1',
          difficulty: 'easy',
          hint_1: 'Recall the role of loss/cost functions in optimization.',
          hint_2: 'Does gradient descent move towards peaks or valleys?',
          evaluation_method: 'deterministic_exact',
          numeric_tolerance: 0,
        },
      ],
    };

    const parsed = GeneratedAssessmentPackageSchema.safeParse(pkg);
    assert.equal(parsed.success, true);
  });
});

