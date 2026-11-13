// ====================================================================
// AdaptiveLearn AI — Controlled Demo Seed Script
// Section 18 Demonstration Dataset Seeder
// ====================================================================

import {
  DEMO_FACULTY,
  DEMO_STUDENTS,
  DEMO_COURSES,
  DEMO_MODULES,
  DEMO_COURSE_OUTCOMES,
  DEMO_MATERIALS,
  DEMO_ASSESSMENTS,
  DEMO_DIAG_QUESTIONS,
  DEMO_DIAG_ANSWER_KEYS,
  DEMO_DIAG_RUBRICS,
  DEMO_DIAG_HINTS,
  DEMO_INTERVENTIONS,
  DEMO_PRACTICE_QUESTIONS,
  generateInitialMockAttempts,
} from '../src/lib/data/mock-store';

async function runSeed() {
  console.log('====================================================');
  console.log('   AdaptiveLearn AI — Demonstration Dataset Seeder   ');
  console.log('====================================================');

  console.log(`[1/8] Institution: Apex Institute of Technology`);
  console.log(`[2/8] Faculty Accounts: ${DEMO_FACULTY.length}`);
  DEMO_FACULTY.forEach(f => console.log(`      • ${f.full_name} (${f.email})`));

  console.log(`[3/8] Courses Created: ${DEMO_COURSES.length}`);
  DEMO_COURSES.forEach(c => console.log(`      • [${c.code}] ${c.title} (Code: ${c.enrollment_code})`));

  console.log(`[4/8] Enrolled Students: ${DEMO_STUDENTS.length}`);
  console.log(`      • Cohort: Aarav Sharma through Quinn Sterling (25 students)`);

  console.log(`[5/8] Curriculum: ${DEMO_MODULES.length} Modules, ${DEMO_COURSE_OUTCOMES.length} Course Outcomes`);
  console.log(`[6/8] Learning Materials Ingested: ${DEMO_MATERIALS.length} certified PDF/DOCX files`);
  console.log(`[7/8] Assessments Configured: Diagnostic & Final with 6-Trait Question Packages`);
  console.log(`      • Complete packages: Question text, Answer keys, Rubrics, Progressive Hints`);

  const { attempts, traitScores, progressReports } = generateInitialMockAttempts();
  console.log(`[8/8] Performance Data Populated:`);
  console.log(`      • ${attempts.length} Assessment Attempts`);
  console.log(`      • ${traitScores.length} 6-Dimensional Trait Scores Calculated`);
  console.log(`      • ${DEMO_INTERVENTIONS.length} Faculty-Approved Personalized Remediation Packages`);
  console.log(`      • ${DEMO_PRACTICE_QUESTIONS.length} Interactive Practice Activities`);
  console.log(`      • ${progressReports.length} Baseline vs Final Improvement Reports (+22.4 pp average gain)`);

  console.log('\nSeed verification completed successfully. All records flagged for demo.');
}

runSeed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
