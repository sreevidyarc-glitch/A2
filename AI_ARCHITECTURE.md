# AdaptiveLearn AI — AI Architecture & Generation Pipeline

## 1. Core Principle: Zero Inference During Student Renders
In strict accordance with Section 5 of the blueprint, **the AI never runs on every student page render**. 

Instead:
1. Complete question packages (question text, options, answer key, reference answer, accepted variations, rubric criteria, weights, difficulty, progressive Hint 1, and progressive Hint 2) are **pre-generated at assessment authoring time**.
2. Generated packages are reviewed, edited, and approved by faculty.
3. During examination, responses are evaluated **deterministically** (MCQ, multiple-select, numeric with tolerance, accepted string variations) without invoking expensive LLM inference per answer.
4. AI Rubric evaluation is reserved for unrestricted long-form descriptive answers, with results cached by `response_id` + `package_version` for idempotency.

---

## 2. Grounding in Approved Course Materials
The AI Question Generator and Remediation Engine use **strictly certified course materials** uploaded by faculty:
- Ingested PDF, DOCX, and PPTX files are parsed server-side.
- Extracted text is sanitized and stored in `learning_materials`.
- Faculty toggles `approval_status = 'approved'`.
- Only approved materials for the specific `course_id` are fed into the prompt context window.
- The prompt instructs the model to refuse hallucinating unstated course facts and instead ground all concepts in the provided text.

---

## 3. Strict Zod Schema Validation & Retry Bounds
All AI completions are requested in strict JSON mode and validated against `GeneratedAssessmentPackageSchema` and `GeneratedInterventionPackageSchema`.

```mermaid
flowchart TD
    Req[Faculty Triggers Generation] --> Context[Aggregate Approved Course Notes + Outcomes]
    Context --> Prompt[Build Structured System & User Prompts]
    Prompt --> Groq[Call Groq Llama-3.3-70B (temp: 0.2)]
    Groq --> Parse[Parse JSON Output]
    Parse --> Validate{Zod Schema SafeParse}
    Validate -- Valid --> Segregate[Split Public Questions, Secret Answer Keys, Rubrics, Hints]
    Validate -- Invalid (Attempt < 3) --> Retry[Bounded Retry with Feedback]
    Retry --> Groq
    Validate -- Invalid (Attempt >= 3) --> Fallback[Grounded Academic Deterministic Generator]
    Segregate --> Persist[(Store in Supabase)]
    Persist --> FacultyStudio[Faculty Review & Approval UI]
```

### Complete Question Package Schema
```typescript
export const GeneratedQuestionSchema = z.object({
  question_text: z.string().min(10),
  question_type: z.enum(['mcq', 'multiple_select', 'true_false', 'numeric', 'short_answer', 'long_answer']),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1),
  reference_answer: z.string().min(1),
  accepted_variations: z.array(z.string()).default([]),
  explanation: z.string().min(5),
  rubric: z.object({
    criteria: z.array(z.object({
      description: z.string(),
      marks: z.number().positive(),
    })).min(1),
    total_marks: z.number().positive(),
    ai_evaluation_prompt: z.string().optional(),
  }),
  maximum_marks: z.number().positive(),
  primary_trait: z.enum(['Remembering', 'Understanding', 'Application', 'Analysis', 'Creativity', 'Evaluation']),
  secondary_trait: z.enum(['Remembering', 'Understanding', 'Application', 'Analysis', 'Creativity', 'Evaluation']).optional(),
  course_outcome_code: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  hint_1: z.string().min(5),
  hint_2: z.string().min(5),
  evaluation_method: z.enum(['deterministic_exact', 'deterministic_numeric', 'concept_match', 'ai_rubric']),
  numeric_tolerance: z.number().default(0.0),
});
```

---

## 4. 10-Point Personalized Remediation Package
When a student scores below 60% in diagnostic trait dimensions, the Remediation Engine produces a structured 10-point package:

1. **Learning Gap Summary**: Precise diagnosis of what went wrong in baseline assessments.
2. **Simplified Academic Explanation**: Core theory broken into digestible language.
3. **Core Concepts**: Key principles, formulas, and laws.
4. **Step-by-Step Procedure**: Algorithmic rules for solving the problem.
5. **Worked Examples**: 2-3 concrete problems with solutions and takeaways.
6. **Conceptual Analogy**: Intuitive physical model.
7. **Common Misconceptions & Corrections**: Correcting flawed intuition.
8. **Revision Checklist**: Self-audit checklist before taking the final exam.
9. **Interactive Practice Activities**: Immediate feedback questions.
10. **Recommended Next Steps**: Recommended office hours and textbook sections.
