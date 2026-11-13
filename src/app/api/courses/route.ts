import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';
import { z } from 'zod';

const CreateCourseSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(3),
  description: z.string().optional(),
  academic_term: z.string().default('Fall 2026'),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role') || mockStore.currentUserRole;
  const userId = searchParams.get('userId') || mockStore.currentUserId;

  let courses = [...mockStore.courses];

  if (role === 'faculty') {
    courses = courses.filter(c => c.faculty_id === userId);
  } else if (role === 'student') {
    const studentEnrollments = mockStore.enrollments
      .filter(e => e.student_id === userId)
      .map(e => e.course_id);
    courses = courses.filter(c => studentEnrollments.includes(c.id));
  }

  // Attach enriched counts
  const enriched = courses.map(c => {
    const enrollmentsCount = mockStore.enrollments.filter(e => e.course_id === c.id).length;
    const modulesCount = mockStore.modules.filter(m => m.course_id === c.id).length;
    const assessmentsCount = mockStore.assessments.filter(a => a.course_id === c.id).length;
    const faculty = mockStore.profiles.find(p => p.id === c.faculty_id);

    return {
      ...c,
      faculty,
      students_count: enrollmentsCount,
      modules_count: modulesCount,
      assessments_count: assessmentsCount,
    };
  });

  return NextResponse.json({ courses: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateCourseSchema.parse(body);

    const facultyId = mockStore.currentUserId;
    const newCourse = {
      id: `course-${Date.now()}`,
      faculty_id: facultyId,
      code: data.code.toUpperCase(),
      title: data.title,
      description: data.description || '',
      enrollment_code: `${data.code.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      academic_term: data.academic_term,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockStore.courses.push(newCourse);

    // Default modules & course outcomes for the course
    mockStore.modules.push(
      {
        id: `mod-${Date.now()}-1`,
        course_id: newCourse.id,
        title: 'Module 1: Principles & Foundations',
        description: 'Core concepts and introductory theorems.',
        order_index: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: `mod-${Date.now()}-2`,
        course_id: newCourse.id,
        title: 'Module 2: Advanced Formulations & Practice',
        description: 'Computational modeling and real-world methods.',
        order_index: 2,
        created_at: new Date().toISOString(),
      }
    );

    mockStore.courseOutcomes.push(
      {
        id: `co-${Date.now()}-1`,
        course_id: newCourse.id,
        code: 'CO1',
        description: 'Demonstrate comprehension of foundational models and definitions.',
        created_at: new Date().toISOString(),
      },
      {
        id: `co-${Date.now()}-2`,
        course_id: newCourse.id,
        code: 'CO2',
        description: 'Formulate and apply mathematical solutions to concrete scenarios.',
        created_at: new Date().toISOString(),
      }
    );

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
