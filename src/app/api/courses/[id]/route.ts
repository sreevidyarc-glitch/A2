import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = mockStore.courses.find(c => c.id === id);

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const faculty = mockStore.profiles.find(p => p.id === course.faculty_id);
  const modules = mockStore.modules
    .filter(m => m.course_id === id)
    .sort((a, b) => a.order_index - b.order_index);
  const courseOutcomes = mockStore.courseOutcomes.filter(co => co.course_id === id);
  const materials = mockStore.materials.filter(m => m.course_id === id);
  const assessments = mockStore.assessments.filter(a => a.course_id === id);
  const enrolledStudentIds = mockStore.enrollments
    .filter(e => e.course_id === id)
    .map(e => e.student_id);
  const enrolledStudents = mockStore.profiles.filter(p => enrolledStudentIds.includes(p.id));

  return NextResponse.json({
    course: {
      ...course,
      faculty,
      modules,
      course_outcomes: courseOutcomes,
      materials,
      assessments,
      enrolled_students: enrolledStudents,
      students_count: enrolledStudents.length,
    },
  });
}
