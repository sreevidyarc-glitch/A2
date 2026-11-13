# AdaptiveLearn AI — Complete API Specification

All endpoints are built as Next.js Route Handlers (`app/api/*`). Privileged actions validate sessions and enforce server-side access control.

---

## 1. System & Authentication Endpoints

### `GET /api/health`
Health check endpoint utilized by Render monitoring.
- **Response**: `{ "status": "healthy", "service": "AdaptiveLearn AI Platform", "uptime": number }`

### `GET /api/auth/me`
Retrieves current session persona and available demonstration profiles.
- **Response**: `{ "profile": Profile, "availableProfiles": { "faculty": [...], "students": [...] } }`

### `POST /api/auth/me`
Switches active demo persona for multi-role testing.
- **Payload**: `{ "userId": string }`
- **Response**: `{ "success": true, "profile": Profile }`

---

## 2. Course Management Endpoints

### `GET /api/courses`
Lists courses accessible to the authenticated persona.
- **Query Params**: `?role=faculty|student&userId=string`
- **Response**: `{ "courses": [Course & { students_count, modules_count, assessments_count }] }`

### `POST /api/courses`
Creates a new course and generates a unique enrollment code.
- **Payload**: `{ "code": string, "title": string, "description"?: string, "academic_term"?: string }`
- **Response**: `{ "success": true, "course": Course }`

### `GET /api/courses/[id]`
Returns complete course hierarchy: modules, course outcomes (CO1..CO6), approved materials, assessments, and enrolled student roster.

### `POST /api/courses/[id]/enroll`
Enrolls student into a course using its unique enrollment code.
- **Payload**: `{ "enrollmentCode": string, "studentId"?: string }`

---

## 3. Learning Materials & Ingestion Endpoints

### `GET /api/materials`
Lists course materials with extraction status and approval status.
- **Query Params**: `?courseId=string`

### `POST /api/materials`
Handles document uploads (PDF, DOCX, PPTX, TXT) or raw syllabus text ingestion.
- **Payload**: `FormData` containing `courseId`, `file` or `manualText`, `filename`.
- **Response**: `{ "success": true, "material": LearningMaterial, "wordCount": number }`

### `PATCH /api/materials`
Faculty toggles approval status (`'approved'` vs `'pending'`). Only approved materials are fed into the AI Question Generator and Remediation Engine.
- **Payload**: `{ "id": string, "approvalStatus": "approved" | "pending" }`

### `DELETE /api/materials?id=string`
Removes material and cleans text references.

---

## 4. Assessment & AI Generation Endpoints

### `GET /api/assessments`
Lists published assessments for students, or all drafts for faculty.

### `POST /api/assessments`
Initializes a new assessment container (Diagnostic, Module, Final).
- **Payload**: `{ "course_id": string, "title": string, "type": "diagnostic"|"final", "duration_minutes": number, "total_marks": number }`

### `GET /api/assessments/[id]`
- **CRITICAL SECURITY BOUNDARY**:
  - If requested by **Student**: Returns questions with `options`, `maximum_marks`, `primary_trait`, `difficulty`. Answer keys, rubrics, and hints are **strictly stripped**.
  - If requested by **Faculty**: Returns full question package including `answer_key`, `rubric`, and `hints`.

### `POST /api/assessments/generate-questions`
Invokes Groq AI Question Generator grounded in approved course documents.
- **Payload**: `{ "assessmentId": string, "questionCount"?: number }`
- **Validation**: Enforces strict `GeneratedAssessmentPackageSchema` with Zod. Automatically splits public questions, secret answer keys, rubrics, and progressive hints into segregated storage.

### `PATCH /api/assessments/[id]/questions`
Updates question text, answer keys, accepted variations, rubrics, progressive hints, or approval status.

### `POST /api/assessments/[id]/publish`
Approves all questions, locks question package version, and transitions status to `'published'`.

---

## 5. Examination & Progressive 2-Hint State Machine

### `POST /api/attempts`
Starts or resumes a student assessment attempt.

### `GET /api/attempts/[attemptId]`
Returns current student attempt, existing response history, and unlocked progressive hints.

### `POST /api/attempts/[attemptId]/submit-response`
Executes response evaluation and 2-hint state machine transition.
- **Payload**: `{ "questionId": string, "submittedAnswer": string }`
- **Rules Enforced**:
  - Evaluates answer deterministically (exact/numeric/accepted variation) or via AI rubric.
  - If Response #1 is correct -> finalize question.
  - If Response #1 is incorrect -> unlock Hint 1.
  - If Response #2 is correct -> finalize question.
  - If Response #2 is incorrect -> unlock Hint 2.
  - If Response #3 -> evaluate and finalize question. Reject any further attempts on backend.
  - On completing all questions, calculates overall score and invokes `calculateTraitScores` across the 6 Bloom traits.
- **Response**: `{ "success": true, "response": ResponseRecord, "transition": { "isFinal": boolean, "isCorrect": boolean, "unlockedHintNumber"?: 1|2, "unlockedHintText"?: string }, "isAssessmentComplete": boolean }`

---

## 6. Personalized Interventions & Practice Endpoints

### `GET /api/interventions`
Returns personalized learning packages. Students can access only released packages assigned to their user ID.

### `POST /api/interventions/generate`
Generates a grounded 10-point remediation package targeting student's weak traits.
- **Payload**: `{ "courseId": string, "studentId": string, "weakTraits": string[] }`
- **Status Initialized**: `'pending_approval'` (requires faculty review).

### `POST /api/interventions/[id]/approve`
Faculty reviews, edits explanations/analogies, and approves or releases the package.
- **Payload**: `{ "action": "release" | "reject", "editedContent"?: object, "facultyFeedback"?: string }`

### `POST /api/interventions/[id]/practice-submit`
Evaluates student practice question answer, providing immediate correctness and pedagogical explanation.
- **Payload**: `{ "practiceQuestionId": string, "studentAnswer": string }`

---

## 7. Analytics & Improvement Reports

### `GET /api/analytics/[courseId]`
- When called without `studentId`: Returns class averages across all 6 traits, baseline vs final comparisons, weakest traits, and candidates needing remediation.
- When called with `?studentId=string`: Returns individual student trait deltas, percentage point growth, evidence counts, and reliability confidence.
