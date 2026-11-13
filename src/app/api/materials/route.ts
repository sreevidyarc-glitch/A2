import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/data/mock-store';
import { parseDocumentBuffer } from '@/lib/parsers/document-parser';
import { LearningMaterial } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');

  let list = [...mockStore.materials];
  if (courseId) {
    list = list.filter(m => m.course_id === courseId);
  }

  return NextResponse.json({ materials: list });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const courseId = formData.get('courseId') as string;
    const moduleId = (formData.get('moduleId') as string) || undefined;
    const file = formData.get('file') as File | null;
    const manualText = formData.get('manualText') as string | null;
    const filenameParam = formData.get('filename') as string | null;

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    let filename = filenameParam || 'Uploaded_Document.txt';
    let fileType: 'pdf' | 'docx' | 'pptx' | 'ppt' | 'txt' = 'txt';
    let fileSize = 0;
    let extractedText = '';
    let processingStatus: 'completed' | 'failed' = 'completed';
    let processingError: string | undefined = undefined;

    if (file) {
      filename = file.name;
      fileSize = file.size;
      const ext = filename.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'pptx', 'ppt', 'txt'].includes(ext || '')) {
        fileType = ext as any;
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parseRes = await parseDocumentBuffer(buffer, fileType);

      if (parseRes.success) {
        extractedText = parseRes.text;
      } else {
        processingStatus = 'failed';
        processingError = parseRes.error;
      }
    } else if (manualText) {
      extractedText = manualText.trim();
      fileSize = Buffer.byteLength(extractedText, 'utf8');
      filename = filenameParam || 'Course_Lecture_Notes.txt';
      fileType = 'txt';
    } else {
      return NextResponse.json({ error: 'Either file or manualText is required' }, { status: 400 });
    }

    const newMaterial: LearningMaterial = {
      id: `mat-${Date.now()}`,
      course_id: courseId,
      module_id: moduleId,
      uploader_id: mockStore.currentUserId,
      filename,
      storage_path: `course-materials/${courseId}/${filename}`,
      file_type: fileType,
      file_size: fileSize,
      extracted_text: extractedText,
      processing_status: processingStatus,
      approval_status: 'pending', // Requires faculty review & approval!
      processing_error: processingError,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockStore.materials.unshift(newMaterial);

    return NextResponse.json({
      success: true,
      material: newMaterial,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, approvalStatus } = body;

    const item = mockStore.materials.find(m => m.id === id);
    if (!item) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    if (approvalStatus) {
      item.approval_status = approvalStatus;
      item.updated_at = new Date().toISOString();
    }

    return NextResponse.json({ success: true, material: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
  }

  mockStore.materials = mockStore.materials.filter(m => m.id !== id);
  return NextResponse.json({ success: true, message: 'Material deleted' });
}
