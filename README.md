# AdaptiveLearn AI — Personalized Learning & Trait-Based Assessment Platform

AdaptiveLearn AI is an academic-grade, browser-based, AI-powered learning and assessment platform that implements the closed-loop pedagogical workflow:

$$\textbf{ASSESS} \longrightarrow \textbf{DIAGNOSE} \longrightarrow \textbf{PERSONALIZE} \longrightarrow \textbf{PRACTICE} \longrightarrow \textbf{ASSIST} \longrightarrow \textbf{IMPROVE}$$

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase PostgreSQL with Row Level Security (RLS), Groq Llama-3.3 AI, and Recharts.

---

## Key Features

1. **Academic 6-Trait Cognitive Framework**:
   Measures academic cognitive performance across Bloom's revised dimensions:
   - *Remembering, Understanding, Application, Analysis, Creativity, Evaluation*
   - Weighted scoring model strictly preventing double-counting when secondary traits are present.
   - Evidence counts and confidence level indicators (`low`, `medium`, `high`).
   - Trait improvement expressed in percentage points: $\Delta \text{Trait} = \text{Final} - \text{Baseline}$.

2. **Course Material Ingestion & Grounding**:
   - Ingestion of PDF, DOCX, and PPTX lecture notes.
   - Text extraction preview, word count calculation, and faculty approval status.
   - Strict grounding: AI content generation uses exclusively approved course documents.

3. **Pre-Generated Complete Question Packages**:
   - Zero AI calls during student page renders.
   - Questions, options, correct answer keys, reference answers, accepted variations, rubrics, and progressive hints are pre-generated during assessment authoring.
   - Strict Zod schema validation with bounded retries.
   - Segregated database storage for answer keys, rubrics, and hints with strict RLS blocking student read access.

4. **Progressive 2-Hint State Machine**:
   - Response #1 (Initial Answer) $\rightarrow$ If wrong $\rightarrow$ Unlocks Hint 1.
   - Response #2 $\rightarrow$ If wrong $\rightarrow$ Unlocks Hint 2.
   - Response #3 $\rightarrow$ Final response evaluated and question finalized.
   - Strictly enforced on the backend (maximum 3 attempts). Future hints remain completely hidden until eligible.

5. **Personalized Learning & Practice Center**:
   - Targeted remediation generated for students scoring $< 60\%$ in diagnostic traits.
   - Comprehensive 10-point remediation package (gap summary, concept breakdown, worked examples, analogies, revision checklists).
   - Faculty Gatekeeper: preview, edit, approve, and release before reaching students.
   - Interactive Practice Center with instant answer grading and pedagogical explanations.

6. **Demonstration Dataset & Multi-Persona Switcher**:
   - 1 Institution: *Apex Institute of Technology*
   - 3 Faculty Accounts: *Dr. Alan Turing, Prof. Ada Lovelace, Dr. Geoffrey Hinton*
   - 3 Courses: *CS301 (Machine Learning), CS204 (Data Structures), CS410 (Cloud Computing)*
   - 25 Enrolled Students with diagnostic and final examination attempts.
   - Persona Switcher in the top navigation bar to toggle between faculty and student views seamlessly without signing out.

---

## Quick Start & Local Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your keys:
- `GROQ_API_KEY`: Groq API key for AI question generation and evaluations.
- `NEXT_PUBLIC_SUPABASE_URL` & keys (optional for local mock demo, required for cloud Supabase).

### 4. Run Seed Script
```bash
npx tsx scripts/seed-demo-data.ts
```

### 5. Run Automated Unit Tests
```bash
npm test
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Documentation Suite

- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — Comprehensive technical blueprint and architecture.
- [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) — Relational PostgreSQL schema, constraints, and ER diagram.
- [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) — Authenticated Next.js route handlers.
- [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md) — AI question package schemas, grounding, and intervention engine.
- [`SECURITY_AND_RLS.md`](./SECURITY_AND_RLS.md) — Row Level Security policies and answer key isolation.
- [`TESTING_REPORT.md`](./TESTING_REPORT.md) — Automated test results and validation proof.
- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) — Step-by-step Render Web Service deployment guide.
- [`supabase/migrations/20261113_initial_schema.sql`](./supabase/migrations/20261113_initial_schema.sql) — Executable Supabase migration.

