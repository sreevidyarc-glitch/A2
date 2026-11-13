import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateExactMatch,
  evaluateMultipleSelect,
  evaluateNumeric,
  evaluateAcceptedVariations,
} from '../../src/lib/evaluator/evaluation-engine';

describe('Evaluation Engine — Deterministic Evaluators', () => {
  it('correctly evaluates exact match for MCQ & True/False', () => {
    const resCorrect = evaluateExactMatch('A', 'A', 2.0);
    assert.equal(resCorrect.isCorrect, true);
    assert.equal(resCorrect.awardedMarks, 2.0);
    assert.equal(resCorrect.percentageScore, 100);

    const resIncorrect = evaluateExactMatch('B', 'A', 2.0);
    assert.equal(resIncorrect.isCorrect, false);
    assert.equal(resIncorrect.awardedMarks, 0);
  });

  it('correctly handles case-insensitive and punctuation in exact matches', () => {
    const res = evaluateExactMatch('  Supervised Learning! ', 'supervised learning', 1.0);
    assert.equal(res.isCorrect, true);
    assert.equal(res.awardedMarks, 1.0);
  });

  it('evaluates multiple-select with full and partial credit', () => {
    const resExact = evaluateMultipleSelect('A, B', 'A, B', 4.0);
    assert.equal(resExact.isCorrect, true);
    assert.equal(resExact.awardedMarks, 4.0);

    const resPartial = evaluateMultipleSelect('A', 'A, B', 4.0);
    assert.equal(resPartial.isCorrect, false);
    assert.equal(resPartial.awardedMarks, 2.0);

    const resWrongWithExtra = evaluateMultipleSelect('A, C', 'A, B', 4.0);
    assert.equal(resWrongWithExtra.isCorrect, false);
    assert.equal(resWrongWithExtra.awardedMarks, 0);
  });

  it('evaluates numeric answers with specified tolerance', () => {
    const resExact = evaluateNumeric('3.1415', '3.1415', 0.001, 2.0);
    assert.equal(resExact.isCorrect, true);
    assert.equal(resExact.awardedMarks, 2.0);

    const resWithinTolerance = evaluateNumeric('3.1419', '3.1415', 0.001, 2.0);
    assert.equal(resWithinTolerance.isCorrect, true);

    const resOutOfTolerance = evaluateNumeric('3.15', '3.1415', 0.001, 2.0);
    assert.equal(resOutOfTolerance.isCorrect, false);
    assert.equal(resOutOfTolerance.awardedMarks, 0);
  });

  it('evaluates accepted variations for short answer', () => {
    const variations = ['CNN', 'Convolutional Network', 'ConvNet'];
    const res1 = evaluateAcceptedVariations('convnet', variations, 'Convolutional Neural Network', 3.0);
    assert.equal(res1.isCorrect, true);
    assert.equal(res1.awardedMarks, 3.0);

    const resUnmatched = evaluateAcceptedVariations('random forest', variations, 'Convolutional Neural Network', 3.0);
    assert.equal(resUnmatched.isCorrect, false);
    assert.equal(resUnmatched.awardedMarks, 0);
  });
});
