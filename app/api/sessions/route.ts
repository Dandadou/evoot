import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request: Request) {
  const { trainingSlug = 'comprendre-ses-reactions' } = await request.json().catch(() => ({}));
  const db = getDB();

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    try {
      await db.prepare('INSERT INTO live_sessions (code, training_slug) VALUES (?, ?)').bind(code, trainingSlug).run();
      return NextResponse.json({ code });
    } catch (error) {
      if (attempt === 7) return NextResponse.json({ error: 'Impossible de créer la séance.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Impossible de créer la séance.' }, { status: 500 });
}
