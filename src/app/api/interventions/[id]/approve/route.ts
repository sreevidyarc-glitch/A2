import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, facultyFeedback, editedContent } = body;

    const intervention = mockStore.interventions.find(i => i.id === id);
    if (!intervention) {
      return NextResponse.json({ error: 'Intervention not found' }, { status: 404 });
    }

    if (editedContent) {
      intervention.content_package = editedContent;
    }

    if (facultyFeedback) {
      intervention.faculty_feedback = facultyFeedback;
    }

    if (action === 'release' || action === 'approve') {
      intervention.status = 'released';
      intervention.released_at = new Date().toISOString();
    } else if (action === 'reject') {
      intervention.status = 'rejected';
    } else if (action === 'approve_only') {
      intervention.status = 'approved';
    }

    intervention.updated_at = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: `Intervention package ${intervention.status} successfully.`,
      intervention,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
