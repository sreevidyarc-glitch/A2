import { z } from 'zod';

export const InterventionContentSchema = z.object({
  learning_gap_summary: z.string().min(10, 'Summary of learning gap is required'),
  simplified_explanation: z.string().min(20, 'Simplified concept explanation is required'),
  core_concepts: z.array(z.string()).min(1, 'At least one core concept is required'),
  step_by_step_explanation: z.array(z.string()).min(2, 'Step-by-step breakdown is required'),
  worked_examples: z.array(
    z.object({
      problem: z.string().min(5),
      solution: z.string().min(5),
      takeaway: z.string().min(5),
    })
  ).min(1, 'At least one worked example is required'),
  analogy: z.string().min(10, 'Analogy or conceptual model is required'),
  misconceptions_and_corrections: z.array(
    z.object({
      misconception: z.string().min(5),
      correction: z.string().min(5),
    })
  ).min(1, 'At least one misconception is required'),
  revision_checklist: z.array(z.string()).min(2, 'Revision checklist is required'),
  recommended_next_steps: z.array(z.string()).min(1, 'Recommended next steps are required'),
});

export const PracticeQuestionSchema = z.object({
  question_text: z.string().min(10),
  question_type: z.enum(['mcq', 'short_answer', 'true_false']),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1),
  explanation: z.string().min(5),
});

export const GeneratedInterventionPackageSchema = z.object({
  title: z.string().min(5),
  targeted_traits: z.array(
    z.enum([
      'Remembering',
      'Understanding',
      'Application',
      'Analysis',
      'Creativity',
      'Evaluation',
    ])
  ).min(1),
  targeted_outcomes: z.array(z.string()).default([]),
  learning_gap_summary: z.string().min(10),
  content_package: InterventionContentSchema,
  practice_questions: z.array(PracticeQuestionSchema).min(2, 'At least 2 practice questions'),
});

export type GeneratedInterventionPackage = z.infer<typeof GeneratedInterventionPackageSchema>;
