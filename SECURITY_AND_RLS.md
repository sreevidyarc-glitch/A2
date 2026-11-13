# AdaptiveLearn AI — Security Architecture & Row Level Security (RLS)

## 1. Zero Trust & Security Principles
AdaptiveLearn AI protects student privacy, academic integrity, and AI secrets through strict server-side boundaries and database-level Row Level Security:

1. **Answer Key Isolation**: Answer keys, hidden rubrics, and locked hints are stored in segregated tables (`question_answer_keys`, `question_rubrics`, `question_hints`) with RLS policies granting access **only to the course's owning faculty member**.
2. **Student API Sanitization**: Client queries executed by students never retrieve answer keys. Question endpoints filter out all answer keys and unearned hints before transmitting JSON to the browser.
3. **Server-Side Evaluation**: All answer evaluations are performed server-side using Supabase Service-Role credentials. The client is never trusted to report awarded marks, correctness flags, or attempt counts.
4. **Secret Key Protection**: `SUPABASE_SERVICE_ROLE_KEY` and `GROQ_API_KEY` are kept exclusively on the server and are never bundled into client Next.js bundles (`NEXT_PUBLIC_*`).

---

## 2. Row Level Security (RLS) Policy Matrix

| Table | Faculty Access | Student Access |
|---|---|---|
| `profiles` | Read all / Update self | Read all / Update self |
| `courses` | Manage own courses (`auth.uid() = faculty_id`) | Read enrolled courses only |
| `enrollments` | View & manage enrollments in own courses | View own enrollments; insert self via code |
| `learning_materials` | Manage materials for own courses | View `approved` materials for enrolled courses only |
| `assessments` | Manage all assessments in own courses | View `published` assessments for enrolled courses |
| `questions` | Full CRUD on questions in own courses | Read questions for published assessments |
| `question_answer_keys` | **Full access for owning faculty** | **BLOCKED (RLS denies all student SELECTs)** |
| `question_rubrics` | **Full access for owning faculty** | **BLOCKED (RLS denies all student SELECTs)** |
| `question_hints` | **Full access for owning faculty** | **BLOCKED (RLS denies direct student SELECTs)** |
| `attempts` | View student attempts for own courses | Insert and view own attempts (`auth.uid() = student_id`) |
| `responses` | View responses in own courses | Submit and view own responses |
| `hint_events` | View hint events in own courses | View own unlocked hint events only |
| `trait_scores` | View all scores for own courses | View own trait scores only |
| `interventions` | Full CRUD on interventions in own courses | View `released` interventions assigned to own ID |
| `practice_questions` | Manage practice questions in own courses | View questions for `released` interventions only |
| `practice_attempts` | View practice attempts in own courses | Submit and view own practice attempts |
| `progress_reports` | View course cohort reports | View own progress reports only |

---

## 3. Threat Mitigation

- **Bypassing the 2-Hint Limit**:
  Attempting to send repeated submissions to extract hints or override marks is rejected by `transitionQuestionState` on the server:
  - If question is already correct or finalized -> returns HTTP 400 (`Question is already completed`).
  - If attempt count >= 3 -> returns HTTP 400 (`Maximum attempts exceeded`).
- **Hint Peeking**:
  Hint text is not stored in the student's browser bundle or local state. Hints are delivered in response payloads **only after an incorrect attempt is verified and recorded on the server**.
- **Tampering with Marks**:
  All marks are derived by comparing the student input against the database answer key on the server. The client cannot send awarded marks.
