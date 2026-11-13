import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';
import { ACADEMIC_TRAITS, AcademicTrait } from '@/types';
import { BLOOMS_TRAIT_INFO } from '@/lib/constants';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');

  const course = mockStore.courses.find(c => c.id === courseId);
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // If studentId is supplied, return individual student report
  if (studentId) {
    const student = mockStore.profiles.find(p => p.id === studentId);
    const report = mockStore.progressReports.find(
      r => r.course_id === courseId && r.student_id === studentId
    );

    const studentTraitScores = mockStore.traitScores.filter(
      ts => ts.student_id === studentId
    );

    // Filter diagnostic and final
    const diagScores = studentTraitScores.filter(ts => ts.assessment_id === 'asmt-diag');
    const finalScores = studentTraitScores.filter(ts => ts.assessment_id === 'asmt-final');

    const traitComparison = ACADEMIC_TRAITS.map(trait => {
      const base = diagScores.find(ts => ts.trait === trait);
      const fin = finalScores.find(ts => ts.trait === trait);

      const basePct = base ? Number(base.percentage_score) : (report?.trait_deltas?.[trait]?.baseline_score || 0);
      const finPct = fin ? Number(fin.percentage_score) : (report?.trait_deltas?.[trait]?.final_score || 0);
      const delta = Number((finPct - basePct).toFixed(1));

      return {
        trait,
        baseline: basePct,
        final: finPct,
        delta_pp: delta,
        confidence: base?.confidence_level || 'medium',
        badgeColor: BLOOMS_TRAIT_INFO[trait].badgeColor,
        chartColor: BLOOMS_TRAIT_INFO[trait].chartColor,
        description: BLOOMS_TRAIT_INFO[trait].description,
      };
    });

    return NextResponse.json({
      student,
      course,
      report,
      traitComparison,
      overallBaseline: report?.baseline_overall_score || 55.0,
      overallFinal: report?.final_overall_score || 78.0,
      overallImprovementPp: report?.overall_improvement_pp || 23.0,
    });
  }

  // Otherwise, calculate Class-Level Aggregates for Faculty
  const enrolledStudentIds = mockStore.enrollments
    .filter(e => e.course_id === courseId)
    .map(e => e.student_id);

  const courseReports = mockStore.progressReports.filter(
    r => r.course_id === courseId && enrolledStudentIds.includes(r.student_id)
  );

  // Compute Class Averages across the 6 traits
  const traitAggregates: Record<AcademicTrait, { baseSum: number; finSum: number; count: number }> = {
    Remembering: { baseSum: 0, finSum: 0, count: 0 },
    Understanding: { baseSum: 0, finSum: 0, count: 0 },
    Application: { baseSum: 0, finSum: 0, count: 0 },
    Analysis: { baseSum: 0, finSum: 0, count: 0 },
    Creativity: { baseSum: 0, finSum: 0, count: 0 },
    Evaluation: { baseSum: 0, finSum: 0, count: 0 },
  };

  courseReports.forEach(r => {
    ACADEMIC_TRAITS.forEach(trait => {
      const td = r.trait_deltas[trait];
      if (td) {
        traitAggregates[trait].baseSum += td.baseline_score;
        traitAggregates[trait].finSum += td.final_score;
        traitAggregates[trait].count += 1;
      }
    });
  });

  const classTraitSummary = ACADEMIC_TRAITS.map(trait => {
    const agg = traitAggregates[trait];
    const baseAvg = agg.count > 0 ? Number((agg.baseSum / agg.count).toFixed(1)) : 0;
    const finAvg = agg.count > 0 ? Number((agg.finSum / agg.count).toFixed(1)) : 0;
    const delta = Number((finAvg - baseAvg).toFixed(1));

    return {
      trait,
      classBaselineAvg: baseAvg,
      classFinalAvg: finAvg,
      improvementDeltaPp: delta,
      chartColor: BLOOMS_TRAIT_INFO[trait].chartColor,
      badgeColor: BLOOMS_TRAIT_INFO[trait].badgeColor,
      description: BLOOMS_TRAIT_INFO[trait].description,
    };
  });

  // Identify weak traits (baseline average < 60%)
  const weakTraits = classTraitSummary
    .filter(t => t.classBaselineAvg < 60)
    .sort((a, b) => a.classBaselineAvg - b.classBaselineAvg);

  // Identify students requiring intervention (overall baseline < 60%)
  const studentsRequiringIntervention = courseReports
    .filter(r => r.baseline_overall_score < 60)
    .map(r => {
      const student = mockStore.profiles.find(p => p.id === r.student_id);
      const studentWeakest = ACADEMIC_TRAITS
        .map(t => ({ trait: t, score: r.trait_deltas[t]?.baseline_score || 0 }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 2)
        .map(x => x.trait);

      const hasIntervention = mockStore.interventions.some(
        i => i.course_id === courseId && i.student_id === r.student_id
      );

      return {
        student,
        baselineScore: r.baseline_overall_score,
        finalScore: r.final_overall_score,
        improvementPp: r.overall_improvement_pp,
        weakestTraits: studentWeakest,
        hasIntervention,
      };
    });

  return NextResponse.json({
    course,
    totalEnrolled: enrolledStudentIds.length,
    classTraitSummary,
    weakTraits,
    studentsRequiringIntervention,
    classBaselineOverall: courseReports.length > 0
      ? Number((courseReports.reduce((acc, r) => acc + r.baseline_overall_score, 0) / courseReports.length).toFixed(1))
      : 0,
    classFinalOverall: courseReports.length > 0
      ? Number((courseReports.reduce((acc, r) => acc + r.final_overall_score, 0) / courseReports.length).toFixed(1))
      : 0,
  });
}
