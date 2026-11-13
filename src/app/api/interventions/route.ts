import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  const studentId = searchParams.get('studentId');
  const role = searchParams.get('role') || mockStore.currentUserRole;

  let list = [...mockStore.interventions];

  if (courseId) {
    list = list.filter(i => i.course_id === courseId);
  }
  if (studentId) {
    list = list.filter(i => i.student_id === studentId);
  }

  // If student is viewing, only show released interventions!
  if (role === 'student') {
    list = list.filter(i => i.status === 'released' && i.student_id === (studentId || mockStore.currentUserId));
  }

  const enriched = list.map(item => {
    const student = mockStore.profiles.find(p => p.id === item.student_id);
    const course = mockStore.courses.find(c => c.id === item.course_id);
    const practice = mockStore.practiceQuestions.filter(pq => pq.intervention_id === item.id);
    return {
      ...item,
      student,
      course,
      practice_questions: practice,
    };
  });

  return NextResponse.json({ interventions: enriched });
}
