// ====================================================================
// AdaptiveLearn AI — Domain Types & Interfaces
// ====================================================================

export type UserRole = 'faculty' | 'student';

export type AcademicTrait =
  | 'Remembering'
  | 'Understanding'
  | 'Application'
  | 'Analysis'
  | 'Creativity'
  | 'Evaluation';

export const ACADEMIC_TRAITS: AcademicTrait[] = [
  'Remembering',
  'Understanding',
  'Application',
  'Analysis',
  'Creativity',
  'Evaluation',
];

export type QuestionType =
  | 'mcq'
  | 'multiple_select'
  | 'true_false'
  | 'numeric'
  | 'short_answer'
  | 'long_answer';

export type AssessmentType = 'diagnostic' | 'module' | 'practice' | 'final';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type EvaluationMethod =
  | 'deterministic_exact'
  | 'deterministic_numeric'
  | 'concept_match'
  | 'ai_rubric';

export type EvaluatorType = 'deterministic' | 'ai_groq' | 'ai_gemini' | 'faculty';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  institution: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  faculty_id: string;
  code: string;
  title: string;
  description?: string;
  enrollment_code: string;
  academic_term: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  faculty?: Profile;
  modules_count?: number;
  students_count?: number;
}

export interface CourseOutcome {
  id: string;
  course_id: string;
  code: string; // e.g. CO1, CO2
  description: string;
  created_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface LearningMaterial {
  id: string;
  course_id: string;
  module_id?: string;
  uploader_id: string;
  filename: string;
  storage_path: string;
  file_type: 'pdf' | 'docx' | 'pptx' | 'ppt' | 'txt';
  file_size: number;
  extracted_text?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  approval_status: 'pending' | 'approved' | 'rejected';
  processing_error?: string;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  type: AssessmentType;
  instructions?: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  status: 'draft' | 'published' | 'archived';
  version: number;
  allow_hints: boolean;
  created_at: string;
  updated_at: string;
  questions_count?: number;
  course?: Course;
}

export interface Question {
  id: string;
  assessment_id: string;
  module_id?: string;
  course_outcome_id?: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[]; // for MCQ / select
  maximum_marks: number;
  primary_trait: AcademicTrait;
  secondary_trait?: AcademicTrait;
  difficulty: DifficultyLevel;
  order_index: number;
  status: 'draft' | 'generated' | 'approved' | 'rejected';
  version: number;
  created_at: string;
  updated_at: string;
  // Included only when viewed by faculty
  answer_key?: QuestionAnswerKey;
  rubric?: QuestionRubric;
  hints?: QuestionHints;
}

export interface QuestionAnswerKey {
  id: string;
  question_id: string;
  correct_answer: string;
  reference_answer?: string;
  accepted_variations: string[];
  numeric_tolerance: number;
  evaluation_method: EvaluationMethod;
  created_at: string;
}

export interface RubricCriterion {
  description: string;
  marks: number;
}

export interface QuestionRubric {
  id: string;
  question_id: string;
  criteria: RubricCriterion[];
  total_rubric_marks: number;
  ai_evaluation_prompt?: string;
  created_at: string;
}

export interface QuestionHints {
  id: string;
  question_id: string;
  hint_1: string;
  hint_2: string;
  created_at: string;
}

export interface Attempt {
  id: string;
  assessment_id: string;
  student_id: string;
  attempt_number: number;
  status: 'in_progress' | 'submitted' | 'evaluated';
  started_at: string;
  submitted_at?: string;
  total_score: number;
  percentage: number;
  created_at: string;
  assessment?: Assessment;
  student?: Profile;
}

export interface ResponseRecord {
  id: string;
  attempt_id: string;
  question_id: string;
  response_number: 1 | 2 | 3;
  submitted_answer: string;
  submitted_at: string;
  is_correct?: boolean;
  awarded_marks: number;
  is_final: boolean;
  feedback?: string;
  evaluator: EvaluatorType;
  confidence_score: number;
  package_version: number;
}

export interface HintEvent {
  id: string;
  attempt_id: string;
  question_id: string;
  hint_number: 1 | 2;
  unlocked_at: string;
  response_number_triggered: 1 | 2;
}

export interface TraitScore {
  id: string;
  attempt_id: string;
  student_id: string;
  course_id: string;
  assessment_id: string;
  trait: AcademicTrait;
  earned_marks: number;
  max_marks: number;
  percentage_score: number;
  question_count: number;
  confidence_level: 'low' | 'medium' | 'high';
  calculated_at: string;
}

export interface InterventionContent {
  learning_gap_summary: string;
  simplified_explanation: string;
  core_concepts: string[];
  step_by_step_explanation: string[];
  worked_examples: {
    problem: string;
    solution: string;
    takeaway: string;
  }[];
  analogy: string;
  misconceptions_and_corrections: {
    misconception: string;
    correction: string;
  }[];
  revision_checklist: string[];
  recommended_next_steps: string[];
}

export interface Intervention {
  id: string;
  course_id: string;
  student_id: string;
  diagnostic_attempt_id?: string;
  targeted_traits: AcademicTrait[];
  targeted_outcomes: string[];
  title: string;
  learning_gap_summary: string;
  content_package: InterventionContent;
  status: 'generated' | 'pending_approval' | 'approved' | 'rejected' | 'released';
  faculty_feedback?: string;
  released_at?: string;
  created_at: string;
  updated_at: string;
  student?: Profile;
  course?: Course;
  practice_questions?: PracticeQuestion[];
}

export interface PracticeQuestion {
  id: string;
  intervention_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer: string;
  explanation: string;
  order_index: number;
  created_at: string;
}

export interface PracticeAttempt {
  id: string;
  practice_question_id: string;
  student_id: string;
  student_answer: string;
  is_correct: boolean;
  attempted_at: string;
}

export interface ProgressReport {
  id: string;
  course_id: string;
  student_id: string;
  baseline_assessment_id: string;
  final_assessment_id: string;
  baseline_overall_score: number;
  final_overall_score: number;
  overall_improvement_pp: number; // percentage points
  trait_deltas: Record<AcademicTrait, {
    baseline_score: number;
    final_score: number;
    delta_pp: number;
    confidence: 'low' | 'medium' | 'high';
  }>;
  outcome_deltas: Record<string, {
    baseline_score: number;
    final_score: number;
    delta_pp: number;
  }>;
  generated_at: string;
  student?: Profile;
  course?: Course;
}

