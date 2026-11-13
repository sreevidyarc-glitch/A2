import { z } from 'zod';

export const RubricCriterionSchema = z.object({
  description: z.string().min(3, 'Criterion description is required'),
  marks: z.number().positive('Marks must be positive'),
});

export const GeneratedQuestionSchema = z.object({
  question_text: z.string().min(10, 'Question text must be at least 10 characters'),
  question_type: z.enum([
    'mcq',
    'multiple_select',
    'true_false',
    'numeric',
    'short_answer',
    'long_answer',
  ]),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  reference_answer: z.string().min(1, 'Reference answer is required'),
  accepted_variations: z.array(z.string()).default([]),
  explanation: z.string().min(5, 'Explanation is required'),
  rubric: z.object({
    criteria: z.array(RubricCriterionSchema).min(1, 'At least one rubric criterion is required'),
    total_marks: z.number().positive('Total rubric marks must be positive'),
    ai_evaluation_prompt: z.string().optional(),
  }),
  maximum_marks: z.number().positive('Maximum marks must be positive'),
  primary_trait: z.enum([
    'Remembering',
    'Understanding',
    'Application',
    'Analysis',
    'Creativity',
    'Evaluation',
  ]),
  secondary_trait: z.enum([
    'Remembering',
    'Understanding',
    'Application',
    'Analysis',
    'Creativity',
    'Evaluation',
  ]).optional(),
  course_outcome_code: z.string().min(1, 'Course outcome mapping is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  hint_1: z.string().min(5, 'Hint 1 must be substantive'),
  hint_2: z.string().min(5, 'Hint 2 must be substantive'),
  evaluation_method: z.enum([
    'deterministic_exact',
    'deterministic_numeric',
    'concept_match',
    'ai_rubric',
  ]),
  numeric_tolerance: z.number().default(0.0),
});

export const GeneratedAssessmentPackageSchema = z.object({
  assessment_title: z.string().min(3),
  instructions: z.string().default('Answer all questions to the best of your ability.'),
  questions: z.array(GeneratedQuestionSchema).min(1, 'Must contain at least 1 question'),
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type GeneratedAssessmentPackage = z.infer<typeof GeneratedAssessmentPackageSchema>;
