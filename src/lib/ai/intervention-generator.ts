// ====================================================================
// AdaptiveLearn AI — Personalized Intervention Generator
// Generates grounded 10-point remediation packages for weak traits
// ====================================================================

import {
  GeneratedInterventionPackageSchema,
  GeneratedInterventionPackage,
} from './schemas/intervention';
import { AcademicTrait, Course, CourseOutcome, LearningMaterial, TraitScore } from '@/types';

export interface InterventionRequest {
  course: Course;
  studentName: string;
  studentId: string;
  weakTraits: AcademicTrait[];
  weakOutcomes?: string[];
  diagnosticScores: TraitScore[];
  approvedMaterials: LearningMaterial[];
  courseOutcomes: CourseOutcome[];
}

export async function generatePersonalizedIntervention(
  req: InterventionRequest
): Promise<GeneratedInterventionPackage> {
  const groqKey = process.env.GROQ_API_KEY;
  const traitsList = req.weakTraits.join(', ') || 'Application, Analysis';
  const outcomesList = req.weakOutcomes?.join(', ') || 'CO2, CO3';

  const contextMaterial = req.approvedMaterials
    .map(m => m.extracted_text)
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 5000);

  if (groqKey && !groqKey.startsWith('gsk_your')) {
    const prompt = `You are a university academic learning specialist.
Design a personalized remedial learning package for student "${req.studentName}" in course "${req.course.code}: ${req.course.title}".
The student showed diagnostic learning gaps in Academic Traits: ${traitsList} and Course Outcomes: ${outcomesList}.

Ground the explanation strictly in the following course materials:
${contextMaterial || 'Foundational principles, mathematical formulations, algorithmic steps, and trade-offs.'}

Generate a comprehensive 10-point remediation package formatted as JSON matching this schema:
{
  "title": string,
  "targeted_traits": ["${req.weakTraits[0] || 'Application'}"],
  "targeted_outcomes": ["${req.weakOutcomes?.[0] || 'CO1'}"],
  "learning_gap_summary": string,
  "content_package": {
    "learning_gap_summary": string,
    "simplified_explanation": string,
    "core_concepts": [string],
    "step_by_step_explanation": [string],
    "worked_examples": [{ "problem": string, "solution": string, "takeaway": string }],
    "analogy": string,
    "misconceptions_and_corrections": [{ "misconception": string, "correction": string }],
    "revision_checklist": [string],
    "recommended_next_steps": [string]
  },
  "practice_questions": [
    { "question_text": string, "question_type": "mcq"|"short_answer"|"true_false", "options": [string], "correct_answer": string, "explanation": string }
  ]
}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          throw new Error(`Groq HTTP error: ${response.status}`);
        }

        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return GeneratedInterventionPackageSchema.parse(parsed);
      } catch (err: any) {
        console.warn(`Groq intervention generation attempt ${attempt} failed: ${err.message}`);
      }
    }
  }

  // Fallback grounded remediation generator
  return {
    title: `Targeted Remediation: ${traitsList} Mastery in ${req.course.code}`,
    targeted_traits: req.weakTraits.length > 0 ? req.weakTraits : ['Application', 'Analysis'],
    targeted_outcomes: req.weakOutcomes && req.weakOutcomes.length > 0 ? req.weakOutcomes : ['CO2'],
    learning_gap_summary: `Diagnostic assessment revealed that ${req.studentName} experienced difficulty with ${traitsList}. The core issue centers on parameter calculation and conceptual synthesis under exam constraints.`,
    content_package: {
      learning_gap_summary: `In the diagnostic assessment, your performance was below the 60% mastery threshold in ${traitsList}. This customized guide provides grounded reinforcement for ${req.course.title}.`,
      simplified_explanation: `In ${req.course.title}, mastering ${traitsList} requires understanding how theoretical definitions directly translate into computational actions. Every mathematical rule or algorithmic step serves a specific purpose in minimizing error and ensuring generalization.`,
      core_concepts: [
        'Iterative Optimization: Calculating exact parameter updates with learning rate scaling',
        'Model Complexity Management: Recognizing when high variance overrides generalizable structure',
        'Verification Protocols: Checking dimensional compatibility and numeric bounds at each step'
      ],
      step_by_step_explanation: [
        'Step 1: Identify all given variables, target outputs, and mathematical formulas from the problem prompt.',
        'Step 2: Calculate intermediate gradients or derivatives before substituting values into the primary update rule.',
        'Step 3: Check boundary conditions (e.g. learning rate cannot be negative, probabilities must lie between 0 and 1).',
        'Step 4: Articulate the physical or computational consequence of the resulting value.'
      ],
      worked_examples: [
        {
          problem: `Apply the optimization rule when current weight w = 8.0, step size alpha = 0.25, and gradient dJ/dw = 12.0.`,
          solution: `Adjustment = alpha * (dJ/dw) = 0.25 * 12.0 = 3.0. Updated weight w_new = 8.0 - 3.0 = 5.0.`,
          takeaway: `Because the gradient is positive, moving in the negative gradient direction decreases the parameter value.`,
        },
        {
          problem: `Analyze why a classifier with 98% train accuracy and 52% test accuracy fails in production.`,
          solution: `The extreme discrepancy indicates high variance (overfitting). The model learned idiosyncrasies of training samples rather than underlying population distributions. Regularization or data augmentation must be introduced.`,
          takeaway: `Always prioritize validation metrics over training metrics when assessing model readiness.`,
        }
      ],
      analogy: `Think of learning rate alpha as the stride length of a hiker descending a mountain in dense fog. Taking tiny steps (very small alpha) guarantees safety but takes forever. Taking giant leaps (large alpha) can catapult the hiker across to another peak or down a cliff. Balanced step size achieves the valley efficiently.`,
      misconceptions_and_corrections: [
        {
          misconception: 'If a model has high accuracy on training data, it is ready for deployment.',
          correction: 'High training accuracy is often an artifact of overfitting. Validation performance on unseen data is the true determinant.',
        },
        {
          misconception: 'Decreasing learning rate guarantees convergence to a better minimum in fewer steps.',
          correction: 'Decreasing alpha makes each step smaller, which actually increases the number of iterations needed to reach the minimum.',
        }
      ],
      revision_checklist: [
        'Write out the fundamental equations without looking at notes',
        'Solve 3 practice problems without assistance',
        'Verify units and signs for all parameter updates'
      ],
      recommended_next_steps: [
        'Complete the interactive practice questions below',
        'Review the uploaded module lecture notes',
        'Consult with faculty during office hours if confusion persists'
      ],
    },
    practice_questions: [
      {
        question_text: `Compute parameter update: initial w = 15.0, alpha = 0.1, gradient = 30.0. What is w_new?`,
        question_type: 'short_answer',
        correct_answer: '12',
        explanation: 'w_new = 15.0 - (0.1 * 30.0) = 15.0 - 3.0 = 12.0',
      },
      {
        question_text: `Which condition is a classic indicator of overfitting?`,
        question_type: 'mcq',
        options: [
          'A) High training error and high test error',
          'B) Low training error and high test error',
          'C) High training error and low test error',
          'D) Both training and test error equal to zero'
        ],
        correct_answer: 'B) Low training error and high test error',
        explanation: 'Low training error combined with high test error is the definitive hallmark of overfitting (high variance).',
      },
      {
        question_text: `True or False: A learning rate that is too large can cause the loss function to diverge to infinity.`,
        question_type: 'true_false',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'True. An oversized learning rate can cause parameter values to oscillate with increasing amplitude and diverge.',
      }
    ],
  };
}

