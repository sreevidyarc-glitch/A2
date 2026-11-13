import { NextRequest, NextResponse } from 'next/server';
import { mockStore, DEMO_FACULTY, DEMO_STUDENTS } from '@/lib/data/mock-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = mockStore.profiles.find(p => p.id === user.id) || {
        id: user.id,
        email: user.email || 'user@apex.edu',
        full_name: user.user_metadata?.full_name || 'Adaptive User',
        role: (user.user_metadata?.role as any) || 'faculty',
        institution: 'Apex Institute of Technology',
        created_at: user.created_at,
        updated_at: user.created_at,
      };
      return NextResponse.json({ profile });
    }
  }

  // Active mock user profile
  const profile = mockStore.profiles.find(p => p.id === mockStore.currentUserId) || DEMO_FACULTY[0];
  return NextResponse.json({
    profile,
    availableProfiles: {
      faculty: DEMO_FACULTY,
      students: DEMO_STUDENTS.slice(0, 10),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (userId) {
      mockStore.setUser(userId);
      const profile = mockStore.profiles.find(p => p.id === userId);
      return NextResponse.json({ success: true, profile });
    }

    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

