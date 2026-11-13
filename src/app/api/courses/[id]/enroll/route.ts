import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { enrollmentCode, studentId } = body;

    const course = mockStore.courses.find(c => c.id === id || c.enrollment_code === enrollmentCode);
    if (!course) {
      return NextResponse.json({ error: 'Course or enrollment code not found' }, { status: 404 });
    }

    const targetStudentId = studentId || mockStore.currentUserId;

    // Check if already enrolled
    const existing = mockStore.enrollments.find(
      e => e.course_id === course.id && e.student_id === targetStudentId
    );
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Already enrolled in this course',
        courseId: course.id,
      });
    }

    const newEnrollment = {
      id: `enr-${Date.now()}`,
      course_id: course.id,
      student_id: targetStudentId,
      enrolled_at: new Date().toISOString(),
    };

    mockStore.enrollments.push(newEnrollment);

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${course.code}: ${course.title}`,
      courseId: course.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

