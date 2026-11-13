// ====================================================================
// AdaptiveLearn AI — Academic Trait Calculator & Analytics Engine
// ====================================================================

import {
  AcademicTrait,
  ACADEMIC_TRAITS,
  Question,
  ResponseRecord,
  TraitScore,
} from '@/types';
import { CONFIDENCE_THRESHOLDS, SECONDARY_TRAIT_SPLIT } from '@/lib/constants';

export interface QuestionWithResponse {
  question: Question;
  finalResponse?: ResponseRecord;
}

export interface CalculatedTraitResult {
  trait: AcademicTrait;
  earnedMarks: number;
  maxMarks: number;
  percentageScore: number;
  questionCount: number;
  confidenceLevel: 'low' | 'medium' | 'high';
}

/**
 * Calculates academic trait scores across all 6 Bloom's dimensions.
 * Ensures zero double-counting when secondary traits are present.
 */
export function calculateTraitScores(items: QuestionWithResponse[]): CalculatedTraitResult[] {
  const traitMap: Record<
    AcademicTrait,
    {
      earned: number;
      max: number;
      count: number;
    }
  > = {
    Remembering: { earned: 0, max: 0, count: 0 },
    Understanding: { earned: 0, max: 0, count: 0 },
    Application: { earned: 0, max: 0, count: 0 },
    Analysis: { earned: 0, max: 0, count: 0 },
    Creativity: { earned: 0, max: 0, count: 0 },
    Evaluation: { earned: 0, max: 0, count: 0 },
  };

  for (const item of items) {
    const q = item.question;
    const resp = item.finalResponse;
    const maxMarks = Number(q.maximum_marks) || 1.0;
    const awardedMarks = resp ? Number(resp.awarded_marks) || 0 : 0;

    const primaryTrait = q.primary_trait;
    const secondaryTrait = q.secondary_trait;

    if (secondaryTrait && secondaryTrait !== primaryTrait) {
      // Split without double-counting
      const pWeight = SECONDARY_TRAIT_SPLIT.PRIMARY_WEIGHT;
      const sWeight = SECONDARY_TRAIT_SPLIT.SECONDARY_WEIGHT;

      traitMap[primaryTrait].max += maxMarks * pWeight;
      traitMap[primaryTrait].earned += awardedMarks * pWeight;
      traitMap[primaryTrait].count += 1;

      traitMap[secondaryTrait].max += maxMarks * sWeight;
      traitMap[secondaryTrait].earned += awardedMarks * sWeight;
      traitMap[secondaryTrait].count += 1;
    } else {
      // 100% to primary trait
      traitMap[primaryTrait].max += maxMarks;
      traitMap[primaryTrait].earned += awardedMarks;
      traitMap[primaryTrait].count += 1;
    }
  }

  return ACADEMIC_TRAITS.map(trait => {
    const data = traitMap[trait];
    const earned = Number(data.earned.toFixed(2));
    const max = Number(data.max.toFixed(2));
    const percentageScore = max > 0 ? Number(((earned / max) * 100).toFixed(1)) : 0;

    let confidenceLevel: 'low' | 'medium' | 'high' = 'low';
    if (data.count > CONFIDENCE_THRESHOLDS.MEDIUM_MAX) {
      confidenceLevel = 'high';
    } else if (data.count > CONFIDENCE_THRESHOLDS.LOW_MAX) {
      confidenceLevel = 'medium';
    }

    return {
      trait,
      earnedMarks: earned,
      maxMarks: max,
      percentageScore,
      questionCount: data.count,
      confidenceLevel,
    };
  });
}

/**
 * Computes trait improvement deltas between baseline (diagnostic) and final assessments.
 * Expressed in percentage points (pp).
 */
export function calculateTraitImprovement(
  baselineScores: (CalculatedTraitResult | TraitScore)[],
  finalScores: (CalculatedTraitResult | TraitScore)[]
): Record<
  AcademicTrait,
  {
    baselineScore: number;
    finalScore: number;
    deltaPp: number;
    confidence: 'low' | 'medium' | 'high';
  }
> {
  const result: any = {};

  for (const trait of ACADEMIC_TRAITS) {
    const base = baselineScores.find(s => s.trait === trait);
    const fin = finalScores.find(s => s.trait === trait);

    const baseScore = base
      ? Number('percentage_score' in base ? base.percentage_score : base.percentageScore)
      : 0;
    const finScore = fin
      ? Number('percentage_score' in fin ? fin.percentage_score : fin.percentageScore)
      : 0;
    const deltaPp = Number((finScore - baseScore).toFixed(1));

    const confidence = fin
      ? ('confidence_level' in fin ? fin.confidence_level : fin.confidenceLevel)
      : 'low';

    result[trait] = {
      baselineScore: baseScore,
      finalScore: finScore,
      deltaPp,
      confidence,
    };
  }

  return result;
}
