# AdaptiveLearn AI — Automated Testing Report

## 1. Test Suite Summary
Automated unit and integration tests were executed using the Node.js native test runner (`node --test`) with TypeScript loader (`tsx`).

- **Total Test Suites**: 4
- **Total Test Cases**: 14
- **Passed**: 14
- **Failed**: 0
- **Duration**: ~1.45 seconds

Execution command:
```bash
npm test
```

---

## 2. Test Execution Breakdown

### Suite 1: Evaluation Engine — Deterministic Evaluators (`tests/unit/evaluation-engine.test.ts`)
- `ok 1 - correctly evaluates exact match for MCQ & True/False`: Verified exact answer comparison, awarded marks, and percentage scoring.
- `ok 2 - correctly handles case-insensitive and punctuation in exact matches`: Verified that variations like `" Supervised Learning! "` match `"supervised learning"`.
- `ok 3 - evaluates multiple-select with full and partial credit`: Verified exact match on option sets and penalty for extraneous incorrect selections.
- `ok 4 - evaluates numeric answers with specified tolerance`: Verified that answers within mathematical tolerance (`|sub - exp| <= tol`) are marked correct, while out-of-tolerance calculations are rejected.
- `ok 5 - evaluates accepted variations for short answer`: Verified canonical phrase matching across accepted variations (`'convnet'` matching `'Convolutional Neural Network'`).

### Suite 2: Progressive 2-Hint State Machine (`tests/unit/hint-state-machine.test.ts`)
- `ok 1 - finalizes question on first attempt if correct without unlocking hints`: Confirmed that a correct initial response awards full marks and leaves hints locked.
- `ok 2 - unlocks Hint 1 on first incorrect attempt without finalizing`: Confirmed that a wrong first response unlocks Hint 1 and maintains `isFinal: false`.
- `ok 3 - unlocks Hint 2 on second incorrect attempt without finalizing`: Confirmed that a wrong second response unlocks Hint 2 and maintains `isFinal: false`.
- `ok 4 - finalizes question on third attempt and prevents any fourth attempt`: Confirmed that Response #3 finalizes the question and subsequent submission attempts are rejected by the backend.

### Suite 3: Question Package Schema Validation (`tests/unit/question-package-schema.test.ts`)
- `ok 1 - accepts a complete, valid question package`: Confirmed Zod schema validation passes for a comprehensive question package with rubrics, marks, hints, and traits.
- `ok 2 - rejects incomplete packages lacking hints or rubrics`: Confirmed validation failure and descriptive error issues when mandatory package fields are omitted.
- `ok 3 - validates a complete assessment package containing multiple questions`: Verified top-level assessment schema parsing.

### Suite 4: Academic Trait Calculator (`tests/unit/trait-calculator.test.ts`)
- `ok 1 - calculates weighted trait scores without double counting secondary traits`: Verified that when a question has primary and secondary traits, weightings (70% / 30%) are distributed without double-counting marks.
- `ok 2 - accurately calculates trait improvement percentage points`: Verified that $\Delta \text{Trait} = \text{Final} - \text{Baseline}$ is accurately computed in percentage points.

---

## 3. Production Build Verification
- Command: `npm run build`
- Next.js Version: 15.1.7+
- Output: 18 static and dynamic routes compiled successfully with zero type or bundling errors.
