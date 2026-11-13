import { AcademicTrait } from '@/types';

export const BLOOMS_TRAIT_INFO: Record<
  AcademicTrait,
  {
    level: number;
    description: string;
    actionVerbs: string[];
    badgeColor: string;
    chartColor: string;
  }
> = {
  Remembering: {
    level: 1,
    description: 'Retrieving, recalling, or recognizing relevant knowledge from long-term memory.',
    actionVerbs: ['Define', 'Recall', 'List', 'State', 'Identify', 'Name'],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    chartColor: '#3b82f6',
  },
  Understanding: {
    level: 2,
    description: 'Demonstrating comprehension through explaining ideas, summarizing, or classifying.',
    actionVerbs: ['Explain', 'Summarize', 'Paraphrase', 'Classify', 'Compare'],
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    chartColor: '#10b981',
  },
  Application: {
    level: 3,
    description: 'Using information, rules, and concepts in concrete situations or new problems.',
    actionVerbs: ['Apply', 'Execute', 'Calculate', 'Solve', 'Implement'],
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    chartColor: '#f59e0b',
  },
  Analysis: {
    level: 4,
    description: 'Breaking material into parts and determining how they relate to one another.',
    actionVerbs: ['Analyze', 'Differentiate', 'Deconstruct', 'Examine', 'Correlate'],
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    chartColor: '#8b5cf6',
  },
  Creativity: {
    level: 5,
    description: 'Generating novel ideas, combining elements into a new pattern, or designing solutions.',
    actionVerbs: ['Design', 'Synthesize', 'Construct', 'Formulate', 'Propose'],
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    chartColor: '#f43f5e',
  },
  Evaluation: {
    level: 6,
    description: 'Making judgements based on criteria, standards, critique, and empirical evidence.',
    actionVerbs: ['Evaluate', 'Judge', 'Critique', 'Justify', 'Assess'],
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    chartColor: '#6366f1',
  },
};

export const CONFIDENCE_THRESHOLDS = {
  LOW_MAX: 2,     // 0-2 questions: Low confidence
  MEDIUM_MAX: 5,  // 3-5 questions: Medium confidence
  // 6+ questions: High confidence
};

export const SECONDARY_TRAIT_SPLIT = {
  PRIMARY_WEIGHT: 0.70,
  SECONDARY_WEIGHT: 0.30,
};
