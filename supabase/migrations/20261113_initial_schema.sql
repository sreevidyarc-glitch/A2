-- ====================================================================
-- AdaptiveLearn AI — Complete Database Migration
-- Version: 20261113_initial_schema.sql
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. PROFILES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('faculty', 'student')),
    institution TEXT DEFAULT 'Apex Institute of Technology',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 2. COURSES & ENROLLMENTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    enrollment_code TEXT NOT NULL UNIQUE,
    academic_term TEXT NOT NULL DEFAULT 'Fall 2026',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_course_student_enrollment UNIQUE (course_id, student_id)
);

-- ====================================================================
-- 3. MODULES & COURSE OUTCOMES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.course_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g., 'CO1', 'CO2'
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_course_outcome_code UNIQUE (course_id, code)
);

-- ====================================================================
-- 4. LEARNING MATERIALS & DOCUMENT INGESTION
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'pptx', 'ppt', 'txt')),
    file_size INTEGER NOT NULL DEFAULT 0,
    extracted_text TEXT,
    processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    processing_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 5. ASSESSMENTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('diagnostic', 'module', 'practice', 'final')),
    instructions TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_marks NUMERIC(6, 2) NOT NULL DEFAULT 0,
    passing_marks NUMERIC(6, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    version INTEGER NOT NULL DEFAULT 1,
    allow_hints BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 6. QUESTIONS (STUDENT-FACING METADATA ONLY)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    course_outcome_id UUID REFERENCES public.course_outcomes(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'multiple_select', 'true_false', 'numeric', 'short_answer', 'long_answer')),
    options JSONB, -- array of strings for MCQ / multiple select
    maximum_marks NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    primary_trait TEXT NOT NULL CHECK (primary_trait IN ('Remembering', 'Understanding', 'Application', 'Analysis', 'Creativity', 'Evaluation')),
    secondary_trait TEXT CHECK (secondary_trait IN ('Remembering', 'Understanding', 'Application', 'Analysis', 'Creativity', 'Evaluation')),
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    order_index INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'approved', 'rejected')),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 7. SECURE ANSWER KEYS, RUBRICS, AND HINTS (SERVER/FACULTY ACCESS ONLY)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.question_answer_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL UNIQUE REFERENCES public.questions(id) ON DELETE CASCADE,
    correct_answer TEXT NOT NULL,
    reference_answer TEXT,
    accepted_variations JSONB DEFAULT '[]'::jsonb, -- array of strings
    numeric_tolerance NUMERIC(8, 4) DEFAULT 0.0,
    evaluation_method TEXT NOT NULL DEFAULT 'deterministic_exact' 
        CHECK (evaluation_method IN ('deterministic_exact', 'deterministic_numeric', 'concept_match', 'ai_rubric')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.question_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL UNIQUE REFERENCES public.questions(id) ON DELETE CASCADE,
    criteria JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ description, marks }]
    total_rubric_marks NUMERIC(5, 2) NOT NULL DEFAULT 0,
    ai_evaluation_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.question_hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL UNIQUE REFERENCES public.questions(id) ON DELETE CASCADE,
    hint_1 TEXT NOT NULL,
    hint_2 TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 8. STUDENT ATTEMPTS & RESPONSES (2-HINT STATE MACHINE)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'evaluated')),
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    submitted_at TIMESTAMPTZ,
    total_score NUMERIC(6, 2) DEFAULT 0,
    percentage NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    response_number INTEGER NOT NULL CHECK (response_number BETWEEN 1 AND 3),
    submitted_answer TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_correct BOOLEAN,
    awarded_marks NUMERIC(5, 2) DEFAULT 0,
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    feedback TEXT,
    evaluator TEXT NOT NULL DEFAULT 'deterministic' CHECK (evaluator IN ('deterministic', 'ai_groq', 'ai_gemini', 'faculty')),
    confidence_score NUMERIC(3, 2) DEFAULT 1.0,
    package_version INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT unique_attempt_question_response_number UNIQUE (attempt_id, question_id, response_number)
);

CREATE TABLE IF NOT EXISTS public.hint_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    hint_number INTEGER NOT NULL CHECK (hint_number IN (1, 2)),
    unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    response_number_triggered INTEGER NOT NULL CHECK (response_number_triggered BETWEEN 1 AND 2),
    CONSTRAINT unique_attempt_question_hint UNIQUE (attempt_id, question_id, hint_number)
);

-- ====================================================================
-- 9. TRAIT SCORES & ANALYTICS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.trait_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    trait TEXT NOT NULL CHECK (trait IN ('Remembering', 'Understanding', 'Application', 'Analysis', 'Creativity', 'Evaluation')),
    earned_marks NUMERIC(6, 2) NOT NULL DEFAULT 0,
    max_marks NUMERIC(6, 2) NOT NULL DEFAULT 0,
    percentage_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    question_count INTEGER NOT NULL DEFAULT 0,
    confidence_level TEXT NOT NULL DEFAULT 'low' CHECK (confidence_level IN ('low', 'medium', 'high')),
    calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_attempt_trait UNIQUE (attempt_id, trait)
);

-- ====================================================================
-- 10. PERSONALIZED INTERVENTIONS & PRACTICE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    diagnostic_attempt_id UUID REFERENCES public.attempts(id) ON DELETE SET NULL,
    targeted_traits JSONB NOT NULL DEFAULT '[]'::jsonb,
    targeted_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
    title TEXT NOT NULL,
    learning_gap_summary TEXT NOT NULL,
    content_package JSONB NOT NULL, -- 10-point package structure
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'pending_approval', 'approved', 'rejected', 'released')),
    faculty_feedback TEXT,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.practice_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'mcq',
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.practice_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_question_id UUID NOT NULL REFERENCES public.practice_questions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 11. PROGRESS REPORTS (BASELINE VS FINAL COMPARISONS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    baseline_assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    final_assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    baseline_overall_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    final_overall_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    overall_improvement_pp NUMERIC(5, 2) NOT NULL DEFAULT 0, -- percentage points
    trait_deltas JSONB NOT NULL DEFAULT '{}'::jsonb,
    outcome_deltas JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_course_student_report UNIQUE (course_id, student_id, baseline_assessment_id, final_assessment_id)
);

-- ====================================================================
-- 12. PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_course ON public.learning_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_course ON public.assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_assessment ON public.questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON public.attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt ON public.responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_trait_scores_attempt ON public.trait_scores(attempt_id);
CREATE INDEX IF NOT EXISTS idx_trait_scores_student ON public.trait_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_student ON public.interventions(student_id);

-- ====================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hint_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trait_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles readable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Courses Policies
CREATE POLICY "Faculty can manage their own courses" ON public.courses
    FOR ALL TO authenticated USING (auth.uid() = faculty_id);

CREATE POLICY "Students can view courses they are enrolled in" ON public.courses
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE enrollments.course_id = courses.id 
            AND enrollments.student_id = auth.uid()
        )
    );

-- Enrollments Policies
CREATE POLICY "Faculty can view and manage enrollments for their courses" ON public.enrollments
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = enrollments.course_id 
            AND courses.faculty_id = auth.uid()
        )
    );

CREATE POLICY "Students can view their own enrollments" ON public.enrollments
    FOR SELECT TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Students can enroll themselves via code" ON public.enrollments
    FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

-- Modules & Course Outcomes
CREATE POLICY "Faculty can manage modules" ON public.modules
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.courses WHERE courses.id = modules.course_id AND courses.faculty_id = auth.uid())
    );

CREATE POLICY "Students can view modules of enrolled courses" ON public.modules
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.course_id = modules.course_id AND enrollments.student_id = auth.uid())
    );

CREATE POLICY "Faculty can manage course outcomes" ON public.course_outcomes
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_outcomes.course_id AND courses.faculty_id = auth.uid())
    );

CREATE POLICY "Students can view course outcomes of enrolled courses" ON public.course_outcomes
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.course_id = course_outcomes.course_id AND enrollments.student_id = auth.uid())
    );

-- Learning Materials
CREATE POLICY "Faculty can manage course materials" ON public.learning_materials
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.courses WHERE courses.id = learning_materials.course_id AND courses.faculty_id = auth.uid())
    );

CREATE POLICY "Students can view approved materials" ON public.learning_materials
    FOR SELECT TO authenticated USING (
        approval_status = 'approved' AND
        EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.course_id = learning_materials.course_id AND enrollments.student_id = auth.uid())
    );

-- Assessments
CREATE POLICY "Faculty can manage assessments" ON public.assessments
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.courses WHERE courses.id = assessments.course_id AND courses.faculty_id = auth.uid())
    );

CREATE POLICY "Students can view published assessments" ON public.assessments
    FOR SELECT TO authenticated USING (
        status = 'published' AND
        EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.course_id = assessments.course_id AND enrollments.student_id = auth.uid())
    );

-- Questions (Student readable only when published, no answers here)
CREATE POLICY "Faculty can manage questions" ON public.questions
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessments 
            JOIN public.courses ON courses.id = assessments.course_id
            WHERE assessments.id = questions.assessment_id AND courses.faculty_id = auth.uid()
        )
    );

CREATE POLICY "Students can view questions for published assessments" ON public.questions
    FOR SELECT TO authenticated USING (
        status = 'approved' AND
        EXISTS (
            SELECT 1 FROM public.assessments 
            JOIN public.enrollments ON enrollments.course_id = assessments.course_id
            WHERE assessments.id = questions.assessment_id 
            AND assessments.status = 'published'
            AND enrollments.student_id = auth.uid()
        )
    );

-- CRITICAL SECURITY: Answer keys, Rubrics, Hints (STRICT FACULTY ACCESS ONLY)
CREATE POLICY "Faculty can view answer keys for their courses" ON public.question_answer_keys
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.questions
            JOIN public.assessments ON assessments.id = questions.assessment_id
            JOIN public.courses ON courses.id = assessments.course_id
            WHERE questions.id = question_answer_keys.question_id AND courses.faculty_id = auth.uid()
        )
    );

CREATE POLICY "Faculty can view rubrics for their courses" ON public.question_rubrics
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.questions
            JOIN public.assessments ON assessments.id = questions.assessment_id
            JOIN public.courses ON courses.id = assessments.course_id
            WHERE questions.id = question_rubrics.question_id AND courses.faculty_id = auth.uid()
        )
    );

CREATE POLICY "Faculty can view hints for their courses" ON public.question_hints
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.questions
            JOIN public.assessments ON assessments.id = questions.assessment_id
            JOIN public.courses ON courses.id = assessments.course_id
            WHERE questions.id = question_hints.question_id AND courses.faculty_id = auth.uid()
        )
    );

-- Attempts & Responses
CREATE POLICY "Students can manage own attempts" ON public.attempts
    FOR ALL TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Faculty can view student attempts" ON public.attempts
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessments
            JOIN public.courses ON courses.id = assessments.course_id
            WHERE assessments.id = attempts.assessment_id AND courses.faculty_id = auth.uid()
        )
    );

CREATE POLICY "Students can submit and view own responses" ON public.responses
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.attempts WHERE attempts.id = responses.attempt_id AND attempts.student_id = auth.uid())
    );

CREATE POLICY "Faculty can view responses" ON public.responses
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.attempts
            JOIN public.assessments ON assessments.id = attempts.assessment_id
            JOIN public.courses ON courses.id = assessments.course_id
            WHERE attempts.id = responses.attempt_id AND courses.faculty_id = auth.uid()
        )
    );

-- Hint Events
CREATE POLICY "Students can view own unlocked hint events" ON public.hint_events
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.attempts WHERE attempts.id = hint_events.attempt_id AND attempts.student_id = auth.uid())
    );

CREATE POLICY "Faculty can view hint events" ON public.hint_events
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.attempts
            JOIN public.assessments ON assessments.id = attempts.assessment_id
            JOIN public.courses ON courses.id = assessments.course_id
            WHERE attempts.id = hint_events.attempt_id AND courses.faculty_id = auth.uid()
        )
    );

-- Trait Scores
CREATE POLICY "Students view own trait scores" ON public.trait_scores
    FOR SELECT TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Faculty view trait scores" ON public.trait_scores
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.courses WHERE courses.id = trait_scores.course_id AND courses.faculty_id = auth.uid())
    );

-- Interventions & Practice
CREATE POLICY "Faculty manage interventions" ON public.interventions
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.courses WHERE courses.id = interventions.course_id AND courses.faculty_id = auth.uid())
    );

CREATE POLICY "Students view released interventions" ON public.interventions
    FOR SELECT TO authenticated USING (student_id = auth.uid() AND status = 'released');

CREATE POLICY "Students view practice questions for released interventions" ON public.practice_questions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.interventions 
            WHERE interventions.id = practice_questions.intervention_id 
            AND interventions.student_id = auth.uid() 
            AND interventions.status = 'released'
        )
    );

CREATE POLICY "Students manage practice attempts" ON public.practice_attempts
    FOR ALL TO authenticated USING (student_id = auth.uid());

-- Progress Reports
CREATE POLICY "Students view own progress reports" ON public.progress_reports
    FOR SELECT TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Faculty view course progress reports" ON public.progress_reports
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.courses WHERE courses.id = progress_reports.course_id AND courses.faculty_id = auth.uid())
    );

