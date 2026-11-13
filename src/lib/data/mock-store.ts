// ====================================================================
// AdaptiveLearn AI — In-Memory State & Demonstration Dataset
// Conforms strictly to PostgreSQL / Supabase Schema
// ====================================================================

import {
  Profile,
  Course,
  CourseModule,
  CourseOutcome,
  LearningMaterial,
  Assessment,
  Question,
  QuestionAnswerKey,
  QuestionRubric,
  QuestionHints,
  Attempt,
  ResponseRecord,
  HintEvent,
  TraitScore,
  Intervention,
  PracticeQuestion,
  PracticeAttempt,
  ProgressReport,
} from '@/types';

// Demonstration Faculty Profiles
export const DEMO_FACULTY: Profile[] = [
  {
    id: 'fac-1',
    email: 'alan.turing@apex.edu',
    full_name: 'Dr. Alan Turing',
    role: 'faculty',
    institution: 'Apex Institute of Technology',
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'fac-2',
    email: 'ada.lovelace@apex.edu',
    full_name: 'Prof. Ada Lovelace',
    role: 'faculty',
    institution: 'Apex Institute of Technology',
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'fac-3',
    email: 'geoffrey.hinton@apex.edu',
    full_name: 'Dr. Geoffrey Hinton',
    role: 'faculty',
    institution: 'Apex Institute of Technology',
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
];

// Demonstration Student Profiles (25 students)
export const DEMO_STUDENTS: Profile[] = Array.from({ length: 25 }, (_, i) => ({
  id: `stu-${i + 1}`,
  email: `student${i + 1}@apex.edu`,
  full_name: [
    'Aarav Sharma', 'Maya Patel', 'Liam Chen', 'Sophia Rodriguez', 'Ethan Vance',
    'Zara Al-Mansoor', 'Noah Kim', 'Olivia Taylor', 'Lucas Rossi', 'Ananya Gupta',
    'Benjamin Wright', 'Chloe Dubois', 'Daniel Santos', 'Emma Watson', 'Gabriel Silva',
    'Hannah Abbott', 'Ian McGregor', 'Julia Kowalski', 'Kevin Zhao', 'Leila Haddad',
    'Marcus Thorne', 'Nadia Petrov', 'Oscar Wilde', 'Priya Nair', 'Quinn Sterling'
  ][i],
  role: 'student',
  institution: 'Apex Institute of Technology',
  created_at: '2026-08-15T09:00:00Z',
  updated_at: '2026-08-15T09:00:00Z',
}));

// Demonstration Courses
export const DEMO_COURSES: Course[] = [
  {
    id: 'course-1',
    faculty_id: 'fac-1',
    code: 'CS301',
    title: 'Machine Learning & Intelligent Systems',
    description: 'Foundations of statistical learning, supervised & unsupervised models, gradient optimization, and evaluation metrics.',
    enrollment_code: 'ML-2026',
    academic_term: 'Fall 2026',
    is_archived: false,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z',
  },
  {
    id: 'course-2',
    faculty_id: 'fac-2',
    code: 'CS204',
    title: 'Data Structures & Algorithms',
    description: 'Linear & hierarchical data structures, algorithm design paradigms, complexity analysis, and graph theory.',
    enrollment_code: 'DSA-2026',
    academic_term: 'Fall 2026',
    is_archived: false,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z',
  },
  {
    id: 'course-3',
    faculty_id: 'fac-3',
    code: 'CS410',
    title: 'Cloud Computing & Distributed Systems',
    description: 'Distributed consensus algorithms, microservice architecture, virtualization, and cloud reliability engineering.',
    enrollment_code: 'CLOUD-2026',
    academic_term: 'Fall 2026',
    is_archived: false,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z',
  },
];

// Course Modules for CS301
export const DEMO_MODULES: CourseModule[] = [
  {
    id: 'mod-1',
    course_id: 'course-1',
    title: 'Module 1: Foundations of Machine Learning',
    description: 'Supervised vs. unsupervised paradigms, train/test splits, overfitting, and bias-variance tradeoff.',
    order_index: 1,
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'mod-2',
    course_id: 'course-1',
    title: 'Module 2: Regression & Gradient Optimization',
    description: 'Linear regression, cost functions, gradient descent variants, learning rates, and regularization.',
    order_index: 2,
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'mod-3',
    course_id: 'course-1',
    title: 'Module 3: Classification & Decision Boundaries',
    description: 'Logistic regression, decision trees, support vector machines, precision, recall, and ROC-AUC curves.',
    order_index: 3,
    created_at: '2026-08-12T10:00:00Z',
  },
];

// Course Outcomes for CS301
export const DEMO_COURSE_OUTCOMES: CourseOutcome[] = [
  {
    id: 'co-1',
    course_id: 'course-1',
    code: 'CO1',
    description: 'Differentiate between supervised, unsupervised, and reinforcement learning paradigms and articulate their core theoretical assumptions.',
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'co-2',
    course_id: 'course-1',
    code: 'CO2',
    description: 'Formulate loss functions and apply gradient descent algorithms to optimize continuous and discrete predictive models.',
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'co-3',
    course_id: 'course-1',
    code: 'CO3',
    description: 'Implement and analyze regularized linear models (Lasso/Ridge) to mitigate overfitting and manage bias-variance tradeoffs.',
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'co-4',
    course_id: 'course-1',
    code: 'CO4',
    description: 'Evaluate classification models quantitatively using confusion matrices, precision, recall, F1-scores, and ROC-AUC metrics.',
    created_at: '2026-08-12T10:00:00Z',
  },
];

// Learning Materials with Extracted Text
export const DEMO_MATERIALS: LearningMaterial[] = [
  {
    id: 'mat-1',
    course_id: 'course-1',
    module_id: 'mod-1',
    uploader_id: 'fac-1',
    filename: 'CS301_Module1_Foundations_LectureNotes.pdf',
    storage_path: 'course-materials/CS301/Module1_LectureNotes.pdf',
    file_type: 'pdf',
    file_size: 2450000,
    extracted_text: `CS301: Machine Learning & Intelligent Systems
Module 1: Foundations of Machine Learning

1.1 Supervised Learning vs. Unsupervised Learning
Supervised learning algorithms build a mathematical model of a set of data that contains both the inputs and the desired outputs (ground truth labels). Examples include linear regression, logistic regression, and neural networks for classification. The goal is to learn a mapping function f(x) -> y.
In contrast, unsupervised learning algorithms take a set of data that contains only inputs, and find structure in the data, like grouping or clustering of data points. Examples include K-means clustering, Principal Component Analysis (PCA), and autoencoders.

1.2 Bias-Variance Tradeoff
High bias can cause an algorithm to miss relevant relations between features and target outputs (underfitting). High variance can cause an algorithm to model the random noise in the training data rather than the intended outputs (overfitting). The total generalization error is composed of Bias^2 + Variance + Irreducible Error.`,
    processing_status: 'completed',
    approval_status: 'approved',
    created_at: '2026-08-15T11:00:00Z',
    updated_at: '2026-08-15T11:05:00Z',
  },
  {
    id: 'mat-2',
    course_id: 'course-1',
    module_id: 'mod-2',
    uploader_id: 'fac-1',
    filename: 'CS301_Module2_Gradient_Descent_Derivations.docx',
    storage_path: 'course-materials/CS301/Module2_Gradient_Descent.docx',
    file_type: 'docx',
    file_size: 1120000,
    extracted_text: `Module 2: Gradient Optimization and Cost Functions

Gradient Descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function.
The update rule for weight parameter theta is:
theta := theta - alpha * grad(J(theta))
where alpha represents the learning rate (step size), and grad(J(theta)) represents the partial derivative of cost function J with respect to theta.
If alpha is too small, convergence is excessively slow. If alpha is too large, the algorithm can overshoot the global minimum and diverge.`,
    processing_status: 'completed',
    approval_status: 'approved',
    created_at: '2026-08-16T14:00:00Z',
    updated_at: '2026-08-16T14:02:00Z',
  },
];

// Assessments: Diagnostic and Final for CS301
export const DEMO_ASSESSMENTS: Assessment[] = [
  {
    id: 'asmt-diag',
    course_id: 'course-1',
    module_id: 'mod-1',
    title: 'CS301 Diagnostic Assessment: Baseline Competency',
    type: 'diagnostic',
    instructions: 'Complete this initial assessment to evaluate your baseline across Remembering, Understanding, Application, Analysis, Creativity, and Evaluation dimensions. Hints are enabled for diagnostic learning.',
    duration_minutes: 45,
    total_marks: 30,
    passing_marks: 15,
    status: 'published',
    version: 1,
    allow_hints: true,
    created_at: '2026-08-20T09:00:00Z',
    updated_at: '2026-08-20T09:00:00Z',
  },
  {
    id: 'asmt-final',
    course_id: 'course-1',
    module_id: 'mod-2',
    title: 'CS301 Comprehensive Final Examination',
    type: 'final',
    instructions: 'Final summative examination. Each question allows up to 2 progressive hints if your prior response is incorrect. Strive for high first-attempt accuracy.',
    duration_minutes: 60,
    total_marks: 30,
    passing_marks: 15,
    status: 'published',
    version: 1,
    allow_hints: true,
    created_at: '2026-09-01T09:00:00Z',
    updated_at: '2026-09-01T09:00:00Z',
  },
];

// Diagnostic Questions & Packages (6 questions spanning the 6 Bloom traits)
export const DEMO_DIAG_QUESTIONS: Question[] = [
  {
    id: 'q-diag-1',
    assessment_id: 'asmt-diag',
    module_id: 'mod-1',
    course_outcome_id: 'co-1',
    question_text: 'Which of the following algorithms is categorized under unsupervised learning?',
    question_type: 'mcq',
    options: [
      'A) Linear Regression',
      'B) K-Means Clustering',
      'C) Support Vector Machine with linear kernel',
      'D) Logistic Regression'
    ],
    maximum_marks: 5,
    primary_trait: 'Remembering',
    difficulty: 'easy',
    order_index: 1,
    status: 'approved',
    version: 1,
    created_at: '2026-08-20T09:00:00Z',
    updated_at: '2026-08-20T09:00:00Z',
  },
  {
    id: 'q-diag-2',
    assessment_id: 'asmt-diag',
    module_id: 'mod-1',
    course_outcome_id: 'co-1',
    question_text: 'Explain the fundamental difference between supervised and unsupervised learning in terms of training data and objectives.',
    question_type: 'short_answer',
    maximum_marks: 5,
    primary_trait: 'Understanding',
    secondary_trait: 'Analysis',
    difficulty: 'medium',
    order_index: 2,
    status: 'approved',
    version: 1,
    created_at: '2026-08-20T09:00:00Z',
    updated_at: '2026-08-20T09:00:00Z',
  },
  {
    id: 'q-diag-3',
    assessment_id: 'asmt-diag',
    module_id: 'mod-2',
    course_outcome_id: 'co-2',
    question_text: 'Given initial weight w = 4.0, learning rate alpha = 0.1, and derivative dJ/dw = 10.0, calculate the updated weight w after one gradient descent step.',
    question_type: 'numeric',
    maximum_marks: 5,
    primary_trait: 'Application',
    difficulty: 'medium',
    order_index: 3,
    status: 'approved',
    version: 1,
    created_at: '2026-08-20T09:00:00Z',
    updated_at: '2026-08-20T09:00:00Z',
  },
  {
    id: 'q-diag-4',
    assessment_id: 'asmt-diag',
    module_id: 'mod-1',
    course_outcome_id: 'co-3',
    question_text: 'A model exhibits 99.8% training accuracy but only 62.1% validation accuracy. Analyze this behavior and identify the primary structural problem.',
    question_type: 'short_answer',
    maximum_marks: 5,
    primary_trait: 'Analysis',
    secondary_trait: 'Evaluation',
    difficulty: 'medium',
    order_index: 4,
    status: 'approved',
    version: 1,
    created_at: '2026-08-20T09:00:00Z',
    updated_at: '2026-08-20T09:00:00Z',
  },
  {
    id: 'q-diag-5',
    assessment_id: 'asmt-diag',
    module_id: 'mod-2',
    course_outcome_id: 'co-3',
    question_text: 'Propose an architectural or data augmentation strategy to resolve severe overfitting in a deep image classifier without gathering new real-world images.',
    question_type: 'short_answer',
    maximum_marks: 5,
    primary_trait: 'Creativity',
    secondary_trait: 'Application',
    difficulty: 'hard',
    order_index: 5,
    status: 'approved',
    version: 1,
    created_at: '2026-08-20T09:00:00Z',
    updated_at: '2026-08-20T09:00:00Z',
  },
  {
    id: 'q-diag-6',
    assessment_id: 'asmt-diag',
    module_id: 'mod-1',
    course_outcome_id: 'co-4',
    question_text: 'In a medical cancer diagnosis task where malignant tumor detection is vital, critique why accuracy alone is a misleading metric and justify why Recall is preferable.',
    question_type: 'short_answer',
    maximum_marks: 5,
    primary_trait: 'Evaluation',
    secondary_trait: 'Analysis',
    difficulty: 'hard',
    order_index: 6,
    status: 'approved',
    version: 1,
    created_at: '2026-08-20T09:00:00Z',
    updated_at: '2026-08-20T09:00:00Z',
  },
];

// Secure Answer Keys for Diagnostic Questions
export const DEMO_DIAG_ANSWER_KEYS: Record<string, QuestionAnswerKey> = {
  'q-diag-1': {
    id: 'ak-1',
    question_id: 'q-diag-1',
    correct_answer: 'B) K-Means Clustering',
    reference_answer: 'K-Means clustering does not require output target labels.',
    accepted_variations: ['B', 'K-Means Clustering', 'kmeans'],
    numeric_tolerance: 0,
    evaluation_method: 'deterministic_exact',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-2': {
    id: 'ak-2',
    question_id: 'q-diag-2',
    correct_answer: 'Supervised learning uses labeled training data to learn mapping to known targets; unsupervised uses unlabeled data to discover hidden patterns.',
    reference_answer: 'Supervised learning uses labeled data with known targets to learn a mapping function, whereas unsupervised learning analyzes unlabeled data to uncover underlying structure or clusters.',
    accepted_variations: ['labeled data vs unlabeled data', 'supervision uses labels, unsupervised finds patterns', 'labeled targets vs unlabelled clusters'],
    numeric_tolerance: 0,
    evaluation_method: 'concept_match',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-3': {
    id: 'ak-3',
    question_id: 'q-diag-3',
    correct_answer: '3.0',
    reference_answer: 'w_new = w - alpha * (dJ/dw) = 4.0 - 0.1 * 10.0 = 4.0 - 1.0 = 3.0',
    accepted_variations: ['3', '3.0', 'w = 3', 'w=3.0'],
    numeric_tolerance: 0.05,
    evaluation_method: 'deterministic_numeric',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-4': {
    id: 'ak-4',
    question_id: 'q-diag-4',
    correct_answer: 'Overfitting due to high variance; the model memorizes training noise rather than generalizable patterns.',
    reference_answer: 'The disparity between high training accuracy (99.8%) and low validation accuracy (62.1%) indicates severe overfitting (high variance).',
    accepted_variations: ['overfitting', 'high variance', 'overfitting high variance', 'model is overfitted'],
    numeric_tolerance: 0,
    evaluation_method: 'concept_match',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-5': {
    id: 'ak-5',
    question_id: 'q-diag-5',
    correct_answer: 'Data augmentation (flips, rotations, crops), Dropout regularization, and L2 weight decay.',
    reference_answer: 'Techniques include synthetic data augmentation (random rotations, zooms, horizontal flips), adding Dropout layers, using early stopping, or adding L2 weight regularization.',
    accepted_variations: ['data augmentation and dropout', 'dropout and weight decay', 'synthetic augmentation and dropout regularization'],
    numeric_tolerance: 0,
    evaluation_method: 'concept_match',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-6': {
    id: 'ak-6',
    question_id: 'q-diag-6',
    correct_answer: 'Accuracy is misleading under class imbalance where most patients are healthy. Recall minimizes False Negatives (missed cancer cases).',
    reference_answer: 'Class imbalance makes accuracy deceptive since predicting all negative yields high accuracy. Recall measures True Positives / (True Positives + False Negatives), preventing fatal missed diagnoses.',
    accepted_variations: ['class imbalance false negatives', 'minimizes false negatives in imbalanced data', 'recall prioritizes avoiding false negatives'],
    numeric_tolerance: 0,
    evaluation_method: 'concept_match',
    created_at: '2026-08-20T09:00:00Z',
  },
};

// Hints for Diagnostic Questions
export const DEMO_DIAG_HINTS: Record<string, QuestionHints> = {
  'q-diag-1': {
    id: 'h-1',
    question_id: 'q-diag-1',
    hint_1: 'Recall which of these algorithms partitions data points without requiring ground-truth class labels.',
    hint_2: 'Consider an iterative algorithm that calculates centroids to cluster data.',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-2': {
    id: 'h-2',
    question_id: 'q-diag-2',
    hint_1: 'Focus on the training input: does one approach provide target labels while the other does not?',
    hint_2: 'Mention labeled data for supervised and pattern/cluster discovery for unsupervised.',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-3': {
    id: 'h-3',
    question_id: 'q-diag-3',
    hint_1: 'Recall the gradient descent update formula: w := w - alpha * (dJ/dw).',
    hint_2: 'Substitute the numbers: 4.0 - (0.1 * 10.0). What is 4.0 - 1.0?',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-4': {
    id: 'h-4',
    question_id: 'q-diag-4',
    hint_1: 'When performance on training data is almost perfect but validation data fails, does the model have high bias or high variance?',
    hint_2: 'The term describes a model that memorizes training noise instead of generalizing.',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-5': {
    id: 'h-5',
    question_id: 'q-diag-5',
    hint_1: 'Think about modifying existing training images using geometric transformations.',
    hint_2: 'Consider architectural regularization techniques like Dropout or L2 weight penalties.',
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-6': {
    id: 'h-6',
    question_id: 'q-diag-6',
    hint_1: 'Think about severe class imbalance: if only 1% of patients have cancer, what happens if an algorithm predicts everyone is negative?',
    hint_2: 'Which error is more catastrophic in healthcare: a false alarm or a missed malignant tumor?',
    created_at: '2026-08-20T09:00:00Z',
  },
};

// Rubrics for Diagnostic Questions
export const DEMO_DIAG_RUBRICS: Record<string, QuestionRubric> = {
  'q-diag-1': {
    id: 'rub-1',
    question_id: 'q-diag-1',
    criteria: [{ description: 'Correct choice of K-Means Clustering', marks: 5 }],
    total_rubric_marks: 5,
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-2': {
    id: 'rub-2',
    question_id: 'q-diag-2',
    criteria: [
      { description: 'Explains supervised learning with labeled data/targets', marks: 2 },
      { description: 'Explains unsupervised learning with unlabeled data/clustering', marks: 2 },
      { description: 'Clear conceptual contrast', marks: 1 },
    ],
    total_rubric_marks: 5,
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-3': {
    id: 'rub-3',
    question_id: 'q-diag-3',
    criteria: [
      { description: 'Correct application of gradient update rule', marks: 2 },
      { description: 'Accurate arithmetic result w = 3.0', marks: 3 },
    ],
    total_rubric_marks: 5,
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-4': {
    id: 'rub-4',
    question_id: 'q-diag-4',
    criteria: [
      { description: 'Identifies overfitting as the core pathology', marks: 3 },
      { description: 'Explains high variance and failure to generalize', marks: 2 },
    ],
    total_rubric_marks: 5,
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-5': {
    id: 'rub-5',
    question_id: 'q-diag-5',
    criteria: [
      { description: 'Proposes data augmentation transformations', marks: 2.5 },
      { description: 'Proposes architectural regularizer such as Dropout or L2 decay', marks: 2.5 },
    ],
    total_rubric_marks: 5,
    created_at: '2026-08-20T09:00:00Z',
  },
  'q-diag-6': {
    id: 'rub-6',
    question_id: 'q-diag-6',
    criteria: [
      { description: 'Explains class imbalance flaw in raw accuracy', marks: 2.5 },
      { description: 'Justifies Recall based on the cost of False Negatives', marks: 2.5 },
    ],
    total_rubric_marks: 5,
    created_at: '2026-08-20T09:00:00Z',
  },
};

// Initial Seed Interventions
export const DEMO_INTERVENTIONS: Intervention[] = [
  {
    id: 'int-1',
    course_id: 'course-1',
    student_id: 'stu-1', // Aarav Sharma
    diagnostic_attempt_id: 'att-stu-1-diag',
    targeted_traits: ['Application', 'Analysis'],
    targeted_outcomes: ['CO2', 'CO3'],
    title: 'Remediation: Gradient Optimization & Overfitting Diagnostics',
    learning_gap_summary: 'Difficulty formulating single-step gradient descent updates and diagnosing high-variance training regimes.',
    content_package: {
      learning_gap_summary: 'Your diagnostic results showed lower scores in Application (40%) and Analysis (50%). You struggled with calculating weight step updates and distinguishing overfitting from underfitting.',
      simplified_explanation: 'Gradient descent is like rolling a ball down a hilly landscape. The slope (gradient) tells you which direction is uphill. To reach the bottom (minimal error), you take a step in the exact opposite direction. The size of that step is controlled by your learning rate alpha.',
      core_concepts: [
        'Gradient Descent Update Rule: w := w - alpha * (dJ/dw)',
        'Learning Rate Dynamics: Small alpha causes slow convergence; large alpha causes oscillation or divergence',
        'Overfitting (High Variance): Near-perfect training score accompanied by poor validation score',
        'Regularization: Penalizing large model weights using L2 weight decay or randomly zeroing nodes using Dropout'
      ],
      step_by_step_explanation: [
        'Step 1: Compute the derivative of the cost function with respect to the parameter: dJ/dw.',
        'Step 2: Multiply this slope by your step size (alpha). This yields the adjustment value.',
        'Step 3: Subtract the adjustment from your current weight: w_new = w_old - adjustment.',
        'Step 4: Check validation loss: if training loss continues downward while validation loss starts climbing, stop training (Early Stopping).'
      ],
      worked_examples: [
        {
          problem: 'Given w = 10, alpha = 0.05, and dJ/dw = 20, calculate the new weight.',
          solution: 'Adjustment = 0.05 * 20 = 1.0. New weight w = 10 - 1.0 = 9.0.',
          takeaway: 'Because the gradient was positive (+20), the algorithm decreased the weight to reduce the loss.',
        },
        {
          problem: 'A decision tree has 100% training accuracy and 58% test accuracy. What regularization should you apply?',
          solution: 'Prune the tree (restrict max_depth or increase min_samples_split) to reduce model complexity and eliminate leaf overfitting.',
          takeaway: 'Constraining tree depth prevents the model from splitting until every sample has its own leaf.',
        }
      ],
      analogy: 'Imagine memorizing the exact answers to last year’s exam without understanding the concepts. You will score 100% on the old exam (training set), but fail when new questions are presented (validation set). That is overfitting.',
      misconceptions_and_corrections: [
        {
          misconception: 'A higher learning rate always trains the model faster.',
          correction: 'If alpha is too large, it will overshoot the minimum and diverge to infinity.',
        },
        {
          misconception: 'A model with zero training error is the best possible model.',
          correction: 'Zero training error usually signals that the model has memorized noise (extreme overfitting).',
        }
      ],
      revision_checklist: [
        'Memorize w := w - alpha * grad(J)',
        'Be able to state the symptoms of high variance vs high bias',
        'List 3 techniques to mitigate overfitting: Data Augmentation, Dropout, L2 Regularization'
      ],
      recommended_next_steps: [
        'Complete the 3 practice questions below in the Practice Center',
        'Review Module 2 Lecture Slides on Gradient Optimization',
        'Attempt the CS301 Final Examination'
      ],
    },
    status: 'released',
    faculty_feedback: 'Approved by Dr. Alan Turing for immediate student remediation.',
    released_at: '2026-08-25T10:00:00Z',
    created_at: '2026-08-24T14:00:00Z',
    updated_at: '2026-08-25T10:00:00Z',
  },
];

// Practice Questions for Intervention 1
export const DEMO_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'pq-1',
    intervention_id: 'int-1',
    question_text: 'If w = 5.0, alpha = 0.2, and dJ/dw = 4.0, what is the updated weight after one gradient step?',
    question_type: 'short_answer',
    correct_answer: '4.2',
    explanation: 'w_new = 5.0 - (0.2 * 4.0) = 5.0 - 0.8 = 4.2',
    order_index: 1,
    created_at: '2026-08-24T14:00:00Z',
  },
  {
    id: 'pq-2',
    intervention_id: 'int-1',
    question_text: 'Which technique is specifically used to prevent neural networks from overfitting by randomly deactivating neurons during training?',
    question_type: 'mcq',
    options: ['A) Batch Normalization', 'B) Dropout', 'C) Gradient Clipping', 'D) Max Pooling'],
    correct_answer: 'B) Dropout',
    explanation: 'Dropout randomly deactivates a fraction of neurons during each training pass to prevent co-adaptation.',
    order_index: 2,
    created_at: '2026-08-24T14:00:00Z',
  },
  {
    id: 'pq-3',
    intervention_id: 'int-1',
    question_text: 'True or False: L2 regularization penalizes the sum of the absolute values of the weights.',
    question_type: 'true_false',
    options: ['True', 'False'],
    correct_answer: 'False',
    explanation: 'False. L2 regularization penalizes the sum of the SQUARED weights (Ridge), while L1 penalizes absolute values (Lasso).',
    order_index: 3,
    created_at: '2026-08-24T14:00:00Z',
  },
];

// Student Mock Attempts Store (Initial populated with 25 realistic student baselines and finals)
export function generateInitialMockAttempts() {
  const attempts: Attempt[] = [];
  const responses: ResponseRecord[] = [];
  const hintEvents: HintEvent[] = [];
  const traitScores: TraitScore[] = [];
  const progressReports: ProgressReport[] = [];

  DEMO_STUDENTS.forEach((student, index) => {
    // Baseline Diagnostic Attempt
    const diagAttemptId = `att-${student.id}-diag`;
    const diagBasePercentage = 45 + ((index * 7) % 35); // 45% - 80%
    const diagScore = Number(((diagBasePercentage / 100) * 30).toFixed(1));

    attempts.push({
      id: diagAttemptId,
      assessment_id: 'asmt-diag',
      student_id: student.id,
      attempt_number: 1,
      status: 'evaluated',
      started_at: '2026-08-21T10:00:00Z',
      submitted_at: '2026-08-21T10:35:00Z',
      total_score: diagScore,
      percentage: diagBasePercentage,
      created_at: '2026-08-21T10:00:00Z',
    });

    // Populate baseline trait scores
    const traits = ['Remembering', 'Understanding', 'Application', 'Analysis', 'Creativity', 'Evaluation'] as const;
    const baseTraitDeltas: any = {};

    traits.forEach((trait, tIdx) => {
      // Individual trait variation
      const traitPct = Math.min(95, Math.max(30, diagBasePercentage + (((index + tIdx) % 5) * 6 - 12)));
      const earned = Number(((traitPct / 100) * 5).toFixed(1));

      traitScores.push({
        id: `ts-${student.id}-diag-${trait}`,
        attempt_id: diagAttemptId,
        student_id: student.id,
        course_id: 'course-1',
        assessment_id: 'asmt-diag',
        trait,
        earned_marks: earned,
        max_marks: 5,
        percentage_score: traitPct,
        question_count: 4,
        confidenceLevel: 'medium',
        calculated_at: '2026-08-21T10:35:00Z',
      } as any);

      // Final score shows significant improvement (+15 to +35 pp)
      const improvementPp = 15 + ((index + tIdx) % 18);
      const finalPct = Math.min(100, traitPct + improvementPp);
      baseTraitDeltas[trait] = {
        baseline_score: traitPct,
        final_score: finalPct,
        delta_pp: improvementPp,
        confidence: 'medium',
      };
    });

    // Final Examination Attempt (Showing measured improvement)
    const finalAttemptId = `att-${student.id}-final`;
    const finalPct = Math.min(98, diagBasePercentage + 22);
    const finalScore = Number(((finalPct / 100) * 30).toFixed(1));

    attempts.push({
      id: finalAttemptId,
      assessment_id: 'asmt-final',
      student_id: student.id,
      attempt_number: 1,
      status: 'evaluated',
      started_at: '2026-09-05T14:00:00Z',
      submitted_at: '2026-09-05T14:52:00Z',
      total_score: finalScore,
      percentage: finalPct,
      created_at: '2026-09-05T14:00:00Z',
    });

    // Progress Report
    progressReports.push({
      id: `rep-${student.id}`,
      course_id: 'course-1',
      student_id: student.id,
      baseline_assessment_id: 'asmt-diag',
      final_assessment_id: 'asmt-final',
      baseline_overall_score: diagBasePercentage,
      final_overall_score: finalPct,
      overall_improvement_pp: Number((finalPct - diagBasePercentage).toFixed(1)),
      trait_deltas: baseTraitDeltas,
      outcome_deltas: {
        CO1: { baseline_score: diagBasePercentage - 5, final_score: finalPct + 2, delta_pp: Number((finalPct - diagBasePercentage + 7).toFixed(1)) },
        CO2: { baseline_score: diagBasePercentage - 10, final_score: finalPct - 2, delta_pp: Number((finalPct - diagBasePercentage + 8).toFixed(1)) },
        CO3: { baseline_score: diagBasePercentage + 5, final_score: finalPct + 4, delta_pp: Number((finalPct - diagBasePercentage - 1).toFixed(1)) },
      },
      generated_at: '2026-09-05T15:00:00Z',
    });
  });

  return { attempts, responses, hintEvents, traitScores, progressReports };
}

// Global In-Memory Singleton Store with deep clones to preserve session mutations
class MemoryStore {
  profiles: Profile[] = [...DEMO_FACULTY, ...DEMO_STUDENTS];
  courses: Course[] = [...DEMO_COURSES];
  modules: CourseModule[] = [...DEMO_MODULES];
  courseOutcomes: CourseOutcome[] = [...DEMO_COURSE_OUTCOMES];
  materials: LearningMaterial[] = [...DEMO_MATERIALS];
  assessments: Assessment[] = [...DEMO_ASSESSMENTS];
  questions: Question[] = [...DEMO_DIAG_QUESTIONS];
  answerKeys: Record<string, QuestionAnswerKey> = { ...DEMO_DIAG_ANSWER_KEYS };
  rubrics: Record<string, QuestionRubric> = { ...DEMO_DIAG_RUBRICS };
  hints: Record<string, QuestionHints> = { ...DEMO_DIAG_HINTS };
  interventions: Intervention[] = [...DEMO_INTERVENTIONS];
  practiceQuestions: PracticeQuestion[] = [...DEMO_PRACTICE_QUESTIONS];
  practiceAttempts: PracticeAttempt[] = [];
  attempts: Attempt[] = [];
  responses: ResponseRecord[] = [];
  hintEvents: HintEvent[] = [];
  traitScores: TraitScore[] = [];
  progressReports: ProgressReport[] = [];
  enrollments: { id: string; course_id: string; student_id: string; enrolled_at: string }[] = [];

  constructor() {
    const initial = generateInitialMockAttempts();
    this.attempts = initial.attempts;
    this.responses = initial.responses;
    this.hintEvents = initial.hintEvents;
    this.traitScores = initial.traitScores;
    this.progressReports = initial.progressReports;

    // Enroll all 25 students in Course 1, and subsets in Course 2 & 3
    DEMO_STUDENTS.forEach((student, i) => {
      this.enrollments.push({
        id: `enr-c1-${student.id}`,
        course_id: 'course-1',
        student_id: student.id,
        enrolled_at: '2026-08-16T10:00:00Z',
      });
      if (i % 2 === 0) {
        this.enrollments.push({
          id: `enr-c2-${student.id}`,
          course_id: 'course-2',
          student_id: student.id,
          enrolled_at: '2026-08-16T10:00:00Z',
        });
      }
      if (i % 3 === 0) {
        this.enrollments.push({
          id: `enr-c3-${student.id}`,
          course_id: 'course-3',
          student_id: student.id,
          enrolled_at: '2026-08-16T10:00:00Z',
        });
      }
    });
  }

  // Active User session simulation
  currentUserId: string = 'fac-1'; // Default to Dr. Alan Turing
  currentUserRole: 'faculty' | 'student' = 'faculty';

  setUser(userId: string) {
    const profile = this.profiles.find(p => p.id === userId);
    if (profile) {
      this.currentUserId = profile.id;
      this.currentUserRole = profile.role;
    }
  }
}

// Export singleton instance attached to globalThis to preserve state across Next.js API reloads
declare global {
  var __adaptiveLearnStore: MemoryStore | undefined;
}

export const mockStore = globalThis.__adaptiveLearnStore ?? new MemoryStore();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__adaptiveLearnStore = mockStore;
}
