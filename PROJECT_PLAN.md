# AdaptiveLearn AI — Complete Project Plan

## 1. Executive Summary
**AdaptiveLearn AI** is an academic-grade, browser-based, AI-powered personalized learning and trait-based assessment platform designed for higher education institutions. The core pedagogical architecture follows the closed-loop cycle:

$$\text{ASSESS} \longrightarrow \text{DIAGNOSE} \longrightarrow \text{PERSONALIZE} \longrightarrow \text{PRACTICE} \longrightarrow \text{ASSIST} \longrightarrow \text{IMPROVE}$$

The platform supports multiple faculty members, multiple courses, curriculum modules, learning material ingestion (PDF, DOCX, PPTX), pre-generated question packages, deterministic and AI-rubric evaluation, a progressive 2-hint examination state machine, faculty-gated personalized interventions, and multi-dimensional academic trait delta reports.

---

## 2. Technology Stack Architecture

| Component | Technology | Rationale |
|---|---|---|
| Development Environment | Google Antigravity | AI-native agentic development workspace |
| Application Framework | Next.js 15+ (App Router) | Single unified TypeScript full-stack architecture |
| Client Styling | Tailwind CSS | Utility-first, responsive, and accessible design |
| Database & ORM | Supabase PostgreSQL | Relational integrity, foreign key cascades, and Row Level Security |
| Authentication | Supabase Auth (SSR Cookie) | Role-based token management for Faculty and Students |
| Document Parsing | pdf-parse, mammoth | Robust server-side extraction without OCR external dependencies |
| AI Inference Provider | Groq API (Llama-3.3-70B) | High-speed, deterministic JSON schema adherence |
| Secondary AI Fallback | Google Gemini API / Heuristic | Seamless failover with retry bounds |
| Validation Engine | Zod | Runtime schema validation for AI generation and API inputs |
| Visualizations | Recharts | Academic radar profiles, comparative bars, and distribution charts |
| Hosting & Cloud | Render Web Service | Node.js web service with `/api/health` monitoring |

---

## 3. The 6-Trait Academic Cognitive Framework
Unlike personality frameworks, AdaptiveLearn AI measures **academic cognitive performance** based on Bloom's revised taxonomy:

1. **Remembering (Level 1)**: Recalling definitions, terminology, and foundational facts.
2. **Understanding (Level 2)**: Explaining relationships, summarizing, and classifying principles.
3. **Application (Level 3)**: Executing calculations, implementing formulas, and solving concrete problems.
4. **Analysis (Level 4)**: Deconstructing behaviors, diagnosing bugs, and identifying high variance / overfitting.
5. **Creativity (Level 5)**: Synthesizing architectures, designing data augmentations, and formulating novel solutions.
6. **Evaluation (Level 6)**: Critiquing methodologies, assessing metric validity under class imbalance, and justifying trade-offs.

### Weighted Scoring Formula
$$\text{Trait Score} = \frac{\sum \text{Marks earned on questions mapped to trait}}{\sum \text{Maximum marks available for trait}} \times 100$$

When secondary traits are specified, weights are partitioned (70% primary, 30% secondary) to strictly prevent double-counting marks.

$$\Delta \text{Trait} = \text{Final Trait Score} - \text{Baseline Trait Score} \quad (\text{expressed in percentage points, pp})$$

---

## 4. Phase-by-Phase Implementation Roadmap

- [x] **Phase 1: Foundation & Relational Schema**
  - Scaffold Next.js TypeScript application.
  - Formulate executable PostgreSQL schema with 19 tables, constraints, indexes, and full RLS policies (`supabase/migrations/20261113_initial_schema.sql`).
  - Configure Supabase SSR client, server, and service-role admin clients.
  - Implement active session persona switcher for demonstration.

- [x] **Phase 2: Course Setup & Document Ingestion**
  - Implement server document text extractor (`src/lib/parsers/document-parser.ts`) supporting PDF, DOCX, and TXT.
  - Build course creation with auto-generated enrollment code.
  - Implement document upload, text extraction preview, word count calculation, and faculty approval status toggling.

- [x] **Phase 3: AI Question Package Authoring Studio**
  - Implement strict Zod schema for complete question packages.
  - Build AI Question Generator (`src/lib/ai/question-generator.ts`) strictly grounded in approved course materials.
  - Build Interactive Assessment Studio for editing question text, answer keys, accepted variations, rubrics, progressive hints, and publishing.

- [x] **Phase 4: Student Examination & Progressive 2-Hint State Machine**
  - Build Hybrid Evaluator (`src/lib/evaluator/evaluation-engine.ts`) with deterministic exact match, multiple-select set comparison, numeric tolerance, and AI rubric matching.
  - Implement backend 2-hint state machine (`src/lib/evaluator/hint-state-machine.ts`): Attempt 1 (wrong) -> Unlock Hint 1; Attempt 2 (wrong) -> Unlock Hint 2; Attempt 3 -> Finalize question. Max 3 attempts enforced on server.
  - Build examination interface (`src/app/student/assessments/[assessmentId]/page.tsx`).

- [x] **Phase 5: Trait Analytics & Progress Reports**
  - Implement trait scoring algorithms (`src/lib/analytics/trait-calculator.ts`) with evidence counts and confidence status.
  - Build Faculty Cohort Analytics (`src/app/faculty/courses/[courseId]/analytics/page.tsx`) with comparative bar charts, 6-trait radar contour, and weakest traits identification.
  - Build Student Trait Mastery & Improvement Report (`src/app/student/reports/page.tsx`).

- [x] **Phase 6: Personalized Learning & Practice Engine**
  - Build Personalized Intervention Generator (`src/lib/ai/intervention-generator.ts`) generating 10-point remediation packages.
  - Build Faculty Remediation Gatekeeper (`src/app/faculty/courses/[courseId]/interventions/page.tsx`) with inline editing, approve, and release controls.
  - Build Student Learning & Practice Center (`src/app/student/learning/page.tsx`) with instant interactive question grading.

- [x] **Phase 7: Quality Assurance, Seed Script & Deployment**
  - Seed 1 institution, 3 faculty, 3 courses, 25 students, curriculum, notes, attempts, and reports (`scripts/seed-demo-data.ts`).
  - Execute automated unit and integration tests.
  - Configure Render deployment blueprint (`render.yaml`).
