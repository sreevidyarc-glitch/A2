// ====================================================================
// AdaptiveLearn AI — Progressive 2-Hint State Machine
// ====================================================================

import { QuestionHints, ResponseRecord, HintEvent } from '@/types';

export interface StateMachineInput {
  existingResponses: ResponseRecord[];
  unlockedHints: HintEvent[];
  hintsConfig?: QuestionHints;
  submittedAnswer: string;
  isCorrect: boolean;
  awardedMarks: number;
}

export interface StateMachineTransition {
  canSubmit: boolean;
  rejectReason?: string;
  responseNumber: 1 | 2 | 3;
  isFinal: boolean;
  newUnlockedHintNumber?: 1 | 2;
  newUnlockedHintText?: string;
  firstAttemptMarks?: number;
  finalAwardedMarks: number;
  isAssisted: boolean;
}

/**
 * Validates and executes the state transition for a student attempt on a question.
 * Strict rules:
 * 1. Maximum of 3 attempts per question.
 * 2. If already finalized or answered correctly on previous attempt, reject submission.
 * 3. Wrong Response #1 unlocks Hint 1.
 * 4. Wrong Response #2 unlocks Hint 2.
 * 5. Response #3 finalizes the question regardless of outcome.
 */
export function transitionQuestionState(input: StateMachineInput): StateMachineTransition {
  const { existingResponses, hintsConfig, isCorrect, awardedMarks } = input;

  const attemptCount = existingResponses.length;

  // Rule: Check if question is already finalized
  const alreadyFinal = existingResponses.some(r => r.is_final || r.is_correct);
  if (alreadyFinal) {
    return {
      canSubmit: false,
      rejectReason: 'Question is already completed and finalized.',
      responseNumber: (Math.min(3, attemptCount) as 1 | 2 | 3),
      isFinal: true,
      finalAwardedMarks: existingResponses.find(r => r.is_final)?.awarded_marks || 0,
      isAssisted: existingResponses.length > 1,
    };
  }

  // Rule: Limit of 3 attempts strictly enforced on backend
  if (attemptCount >= 3) {
    return {
      canSubmit: false,
      rejectReason: 'Maximum attempts (3) exceeded for this question.',
      responseNumber: 3,
      isFinal: true,
      finalAwardedMarks: existingResponses[2]?.awarded_marks || 0,
      isAssisted: true,
    };
  }

  const currentResponseNumber = (attemptCount + 1) as 1 | 2 | 3;

  // Case 1: First Attempt (Response #1)
  if (currentResponseNumber === 1) {
    if (isCorrect) {
      return {
        canSubmit: true,
        responseNumber: 1,
        isFinal: true,
        finalAwardedMarks: awardedMarks,
        firstAttemptMarks: awardedMarks,
        isAssisted: false,
      };
    } else {
      // Incorrect -> Unlock Hint 1
      return {
        canSubmit: true,
        responseNumber: 1,
        isFinal: false,
        newUnlockedHintNumber: 1,
        newUnlockedHintText: hintsConfig?.hint_1 || 'Hint 1 is available.',
        finalAwardedMarks: 0,
        firstAttemptMarks: 0,
        isAssisted: false,
      };
    }
  }

  // Case 2: Second Attempt (Response #2)
  if (currentResponseNumber === 2) {
    if (isCorrect) {
      return {
        canSubmit: true,
        responseNumber: 2,
        isFinal: true,
        finalAwardedMarks: awardedMarks,
        firstAttemptMarks: 0,
        isAssisted: true,
      };
    } else {
      // Incorrect -> Unlock Hint 2
      return {
        canSubmit: true,
        responseNumber: 2,
        isFinal: false,
        newUnlockedHintNumber: 2,
        newUnlockedHintText: hintsConfig?.hint_2 || 'Hint 2 is available.',
        finalAwardedMarks: 0,
        firstAttemptMarks: 0,
        isAssisted: true,
      };
    }
  }

  // Case 3: Third Attempt (Response #3 - Final)
  return {
    canSubmit: true,
    responseNumber: 3,
    isFinal: true,
    finalAwardedMarks: isCorrect ? awardedMarks : 0,
    firstAttemptMarks: 0,
    isAssisted: true,
  };
}
