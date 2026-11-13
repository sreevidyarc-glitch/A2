// ====================================================================
// AdaptiveLearn AI — Hybrid Evaluation Engine
// ====================================================================

import { Question, QuestionAnswerKey, QuestionRubric, EvaluatorType } from '@/types';

export interface EvaluationInput {
  question: Question;
  answerKey: QuestionAnswerKey;
  rubric?: QuestionRubric;
  submittedAnswer: string;
}

export interface EvaluationResult {
  isCorrect: boolean;
  awardedMarks: number;
  maxMarks: number;
  percentageScore: number;
  evaluator: EvaluatorType;
  confidenceScore: number;
  feedback: string;
}

/**
 * Normalizes text for robust deterministic comparison:
 * lowercase, removes extraneous whitespaces, trims punctuation.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministic evaluator for exact match, multiple choices, and true/false.
 */
export function evaluateExactMatch(
  submitted: string,
  correct: string,
  maxMarks: number
): EvaluationResult {
  const normSubmitted = normalizeText(submitted);
  const normCorrect = normalizeText(correct);
  const isMatch = normSubmitted === normCorrect;

  return {
    isCorrect: isMatch,
    awardedMarks: isMatch ? maxMarks : 0,
    maxMarks,
    percentageScore: isMatch ? 100 : 0,
    evaluator: 'deterministic',
    confidenceScore: 1.0,
    feedback: isMatch
      ? 'Correct response.'
      : 'Response does not match the expected answer.',
  };
}

/**
 * Evaluates multiple-select questions where answer is a comma- or JSON-separated list of keys.
 */
export function evaluateMultipleSelect(
  submitted: string,
  correct: string,
  maxMarks: number
): EvaluationResult {
  const parseList = (str: string): string[] => {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.map(s => normalizeText(String(s)));
    } catch {
      // split by comma or semicolon
    }
    return str.split(/[,;]/).map(s => normalizeText(s)).filter(Boolean);
  };

  const subSet = new Set(parseList(submitted));
  const corSet = new Set(parseList(correct));

  if (corSet.size === 0) {
    return {
      isCorrect: false,
      awardedMarks: 0,
      maxMarks,
      percentageScore: 0,
      evaluator: 'deterministic',
      confidenceScore: 1.0,
      feedback: 'Invalid answer key.',
    };
  }

  // Exact set match
  let matches = 0;
  for (const item of subSet) {
    if (corSet.has(item)) matches++;
  }

  const isExact = subSet.size === corSet.size && matches === corSet.size;
  // Partial credit option
  const fractional = matches / corSet.size;
  const penalty = Math.max(0, subSet.size - matches) * (1 / corSet.size);
  const credit = Math.max(0, fractional - penalty);
  const awarded = Number((credit * maxMarks).toFixed(2));

  return {
    isCorrect: isExact,
    awardedMarks: isExact ? maxMarks : awarded,
    maxMarks,
    percentageScore: Math.round((awarded / maxMarks) * 100),
    evaluator: 'deterministic',
    confidenceScore: 1.0,
    feedback: isExact
      ? 'All correct options selected.'
      : `Selected ${matches} of ${corSet.size} correct options.`,
  };
}

/**
 * Deterministic numeric evaluator with configurable absolute/relative tolerance.
 */
export function evaluateNumeric(
  submitted: string,
  correct: string,
  tolerance: number = 0.0,
  maxMarks: number
): EvaluationResult {
  const subNum = parseFloat(submitted.replace(/[^0-9.-]/g, ''));
  const corNum = parseFloat(correct.replace(/[^0-9.-]/g, ''));

  if (isNaN(subNum) || isNaN(corNum)) {
    return {
      isCorrect: false,
      awardedMarks: 0,
      maxMarks,
      percentageScore: 0,
      evaluator: 'deterministic',
      confidenceScore: 1.0,
      feedback: 'Invalid numeric input.',
    };
  }

  const diff = Math.abs(subNum - corNum);
  const isMatch = diff <= (tolerance || 0.0001);

  return {
    isCorrect: isMatch,
    awardedMarks: isMatch ? maxMarks : 0,
    maxMarks,
    percentageScore: isMatch ? 100 : 0,
    evaluator: 'deterministic',
    confidenceScore: 1.0,
    feedback: isMatch
      ? 'Numeric value within acceptable tolerance.'
      : `Submitted value ${subNum} differs from expected ${corNum} by ${diff.toFixed(4)}.`,
  };
}

/**
 * Evaluates short answers against accepted variations and keywords.
 */
export function evaluateAcceptedVariations(
  submitted: string,
  acceptedVariations: string[],
  correctAnswer: string,
  maxMarks: number
): EvaluationResult {
  const normSubmitted = normalizeText(submitted);
  const allAccepted = [correctAnswer, ...(acceptedVariations || [])].map(v => normalizeText(v));

  const isMatch = allAccepted.some(v => v === normSubmitted);

  if (isMatch) {
    return {
      isCorrect: true,
      awardedMarks: maxMarks,
      maxMarks,
      percentageScore: 100,
      evaluator: 'deterministic',
      confidenceScore: 0.95,
      feedback: 'Answer matches approved accepted variation.',
    };
  }

  // Check substring containment for multi-word canonical phrases
  const partialMatch = allAccepted.some(v => v.length > 5 && (normSubmitted.includes(v) || v.includes(normSubmitted)));
  if (partialMatch) {
    const halfMarks = Number((maxMarks * 0.5).toFixed(2));
    return {
      isCorrect: false,
      awardedMarks: halfMarks,
      maxMarks,
      percentageScore: 50,
      evaluator: 'deterministic',
      confidenceScore: 0.70,
      feedback: 'Partially matched key concepts.',
    };
  }

  return {
    isCorrect: false,
    awardedMarks: 0,
    maxMarks,
    percentageScore: 0,
    evaluator: 'deterministic',
    confidenceScore: 0.90,
    feedback: 'Answer does not match approved variations.',
  };
}

/**
 * Primary routing function for evaluation.
 */
export async function evaluateResponse(input: EvaluationInput): Promise<EvaluationResult> {
  const { question, answerKey, rubric, submittedAnswer } = input;
  const maxMarks = Number(question.maximum_marks) || 1.0;

  switch (answerKey.evaluation_method) {
    case 'deterministic_numeric':
      return evaluateNumeric(
        submittedAnswer,
        answerKey.correct_answer,
        answerKey.numeric_tolerance,
        maxMarks
      );

    case 'deterministic_exact':
      if (question.question_type === 'multiple_select') {
        return evaluateMultipleSelect(submittedAnswer, answerKey.correct_answer, maxMarks);
      }
      return evaluateExactMatch(submittedAnswer, answerKey.correct_answer, maxMarks);

    case 'concept_match':
      return evaluateAcceptedVariations(
        submittedAnswer,
        answerKey.accepted_variations,
        answerKey.correct_answer,
        maxMarks
      );

    case 'ai_rubric':
      // Fallback to deterministic check if exact match first
      if (normalizeText(submittedAnswer) === normalizeText(answerKey.correct_answer)) {
        return {
          isCorrect: true,
          awardedMarks: maxMarks,
          maxMarks,
          percentageScore: 100,
          evaluator: 'deterministic',
          confidenceScore: 1.0,
          feedback: 'Exact match with reference answer.',
        };
      }

      // Check accepted variations before making costly AI inference
      if (
        answerKey.accepted_variations?.length &&
        answerKey.accepted_variations.some(v => normalizeText(v) === normalizeText(submittedAnswer))
      ) {
        return {
          isCorrect: true,
          awardedMarks: maxMarks,
          maxMarks,
          percentageScore: 100,
          evaluator: 'deterministic',
          confidenceScore: 0.95,
          feedback: 'Answer matches approved accepted variation.',
        };
      }

      // For AI rubric evaluation, we invoke our Groq/Gemini evaluator
      return evaluateWithAIRubric(question, answerKey, rubric, submittedAnswer, maxMarks);

    default:
      return evaluateExactMatch(submittedAnswer, answerKey.correct_answer, maxMarks);
  }
}

/**
 * AI rubric evaluation with fallback.
 */
export async function evaluateWithAIRubric(
  question: Question,
  answerKey: QuestionAnswerKey,
  rubric: QuestionRubric | undefined,
  submittedAnswer: string,
  maxMarks: number
): Promise<EvaluationResult> {
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey || groqKey.startsWith('gsk_your')) {
    // Graceful offline heuristic when API key is not yet set
    const normSub = normalizeText(submittedAnswer);
    const normRef = normalizeText(answerKey.reference_answer || answerKey.correct_answer);
    
    // Check keyword overlap
    const refWords = new Set(normRef.split(' ').filter(w => w.length > 3));
    let matchCount = 0;
    for (const w of refWords) {
      if (normSub.includes(w)) matchCount++;
    }
    const overlapRatio = refWords.size > 0 ? matchCount / refWords.size : 0;
    const awarded = Number((overlapRatio * maxMarks).toFixed(2));
    const isCorrect = overlapRatio >= 0.7;

    return {
      isCorrect,
      awardedMarks: awarded,
      maxMarks,
      percentageScore: Math.round((awarded / maxMarks) * 100),
      evaluator: 'deterministic',
      confidenceScore: 0.75,
      feedback: isCorrect
        ? 'Well-aligned with key concepts in rubric.'
        : `Partially addressed rubric criteria (${Math.round(overlapRatio * 100)}% concept overlap).`,
    };
  }

  try {
    const prompt = `You are an academic assessor evaluating a student response based on an academic rubric.
Question: ${question.question_text}
Reference Answer: ${answerKey.reference_answer || answerKey.correct_answer}
Rubric Criteria: ${JSON.stringify(rubric?.criteria || [{ description: 'Correctness', marks: maxMarks }])}
Maximum Marks: ${maxMarks}

Student Submission: "${submittedAnswer}"

Evaluate strictly and return JSON in this exact structure:
{
  "is_correct": boolean,
  "awarded_marks": number,
  "feedback": string,
  "confidence_score": number
}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.statusText}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    const awarded = Math.min(maxMarks, Math.max(0, Number(parsed.awarded_marks) || 0));
    return {
      isCorrect: Boolean(parsed.is_correct),
      awardedMarks: awarded,
      maxMarks,
      percentageScore: Math.round((awarded / maxMarks) * 100),
      evaluator: 'ai_groq',
      confidenceScore: Number(parsed.confidence_score) || 0.85,
      feedback: parsed.feedback || 'Evaluated via AI rubric.',
    };
  } catch (error) {
    console.error('AI evaluation failed, falling back to heuristic:', error);
    return {
      isCorrect: false,
      awardedMarks: 0,
      maxMarks,
      percentageScore: 0,
      evaluator: 'deterministic',
      confidenceScore: 0.5,
      feedback: 'Automated evaluation unavailable; flagged for faculty review.',
    };
  }
}
