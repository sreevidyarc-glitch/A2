import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transitionQuestionState } from '../../src/lib/evaluator/hint-state-machine';
import { QuestionHints, ResponseRecord } from '../../src/types';

describe('Progressive 2-Hint State Machine', () => {
  const mockHints: QuestionHints = {
    id: 'h1',
    question_id: 'q1',
    hint_1: 'Think about input labels in supervised learning.',
    hint_2: 'Consider clustering algorithms like K-means.',
    created_at: new Date().toISOString(),
  };

  it('finalizes question on first attempt if correct without unlocking hints', () => {
    const transition = transitionQuestionState({
      existingResponses: [],
      unlockedHints: [],
      hintsConfig: mockHints,
      submittedAnswer: 'Correct Answer',
      isCorrect: true,
      awardedMarks: 5.0,
    });

    assert.equal(transition.canSubmit, true);
    assert.equal(transition.responseNumber, 1);
    assert.equal(transition.isFinal, true);
    assert.equal(transition.finalAwardedMarks, 5.0);
    assert.equal(transition.firstAttemptMarks, 5.0);
    assert.equal(transition.newUnlockedHintNumber, undefined);
  });

  it('unlocks Hint 1 on first incorrect attempt without finalizing', () => {
    const transition = transitionQuestionState({
      existingResponses: [],
      unlockedHints: [],
      hintsConfig: mockHints,
      submittedAnswer: 'Wrong Answer 1',
      isCorrect: false,
      awardedMarks: 0,
    });

    assert.equal(transition.canSubmit, true);
    assert.equal(transition.responseNumber, 1);
    assert.equal(transition.isFinal, false);
    assert.equal(transition.newUnlockedHintNumber, 1);
    assert.equal(transition.newUnlockedHintText, mockHints.hint_1);
  });

  it('unlocks Hint 2 on second incorrect attempt without finalizing', () => {
    const resp1: ResponseRecord = {
      id: 'r1',
      attempt_id: 'a1',
      question_id: 'q1',
      response_number: 1,
      submitted_answer: 'Wrong Answer 1',
      submitted_at: new Date().toISOString(),
      is_correct: false,
      awarded_marks: 0,
      is_final: false,
      evaluator: 'deterministic',
      confidence_score: 1.0,
      package_version: 1,
    };

    const transition = transitionQuestionState({
      existingResponses: [resp1],
      unlockedHints: [
        {
          id: 'he1',
          attempt_id: 'a1',
          question_id: 'q1',
          hint_number: 1,
          unlocked_at: new Date().toISOString(),
          response_number_triggered: 1,
        },
      ],
      hintsConfig: mockHints,
      submittedAnswer: 'Wrong Answer 2',
      isCorrect: false,
      awardedMarks: 0,
    });

    assert.equal(transition.canSubmit, true);
    assert.equal(transition.responseNumber, 2);
    assert.equal(transition.isFinal, false);
    assert.equal(transition.newUnlockedHintNumber, 2);
    assert.equal(transition.newUnlockedHintText, mockHints.hint_2);
  });

  it('finalizes question on third attempt and prevents any fourth attempt', () => {
    const resp1: ResponseRecord = {
      id: 'r1',
      attempt_id: 'a1',
      question_id: 'q1',
      response_number: 1,
      submitted_answer: 'Wrong 1',
      submitted_at: new Date().toISOString(),
      is_correct: false,
      awarded_marks: 0,
      is_final: false,
      evaluator: 'deterministic',
      confidence_score: 1.0,
      package_version: 1,
    };
    const resp2: ResponseRecord = {
      id: 'r2',
      attempt_id: 'a1',
      question_id: 'q1',
      response_number: 2,
      submitted_answer: 'Wrong 2',
      submitted_at: new Date().toISOString(),
      is_correct: false,
      awarded_marks: 0,
      is_final: false,
      evaluator: 'deterministic',
      confidence_score: 1.0,
      package_version: 1,
    };

    // Third attempt
    const transition3 = transitionQuestionState({
      existingResponses: [resp1, resp2],
      unlockedHints: [],
      hintsConfig: mockHints,
      submittedAnswer: 'Third Answer (Correct)',
      isCorrect: true,
      awardedMarks: 5.0,
    });

    assert.equal(transition3.canSubmit, true);
    assert.equal(transition3.responseNumber, 3);
    assert.equal(transition3.isFinal, true);
    assert.equal(transition3.finalAwardedMarks, 5.0);

    const resp3: ResponseRecord = {
      id: 'r3',
      attempt_id: 'a1',
      question_id: 'q1',
      response_number: 3,
      submitted_answer: 'Third Answer',
      submitted_at: new Date().toISOString(),
      is_correct: true,
      awarded_marks: 5.0,
      is_final: true,
      evaluator: 'deterministic',
      confidence_score: 1.0,
      package_version: 1,
    };

    // Attempting 4th submission should be rejected
    const transition4 = transitionQuestionState({
      existingResponses: [resp1, resp2, resp3],
      unlockedHints: [],
      hintsConfig: mockHints,
      submittedAnswer: 'Fourth Attempt',
      isCorrect: true,
      awardedMarks: 5.0,
    });

    assert.equal(transition4.canSubmit, false);
    assert.match(transition4.rejectReason || '', /already completed|exceeded/);
  });
});

