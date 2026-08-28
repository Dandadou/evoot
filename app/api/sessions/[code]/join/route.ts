import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const { name, jobTitle } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 });
  const db = getDB();
  const session = await db.prepare('SELECT id, state FROM live_sessions WHERE code = ?').bind(code).first<{id:number;state:string}>();
  if (!session) return NextResponse.json({ error: 'Code de séance invalide.' }, { status: 404 });
  if (session.state === 'FINISHED') return NextResponse.json({ error: 'Cette séance est terminée.' }, { status: 409 });
  const result = await db.prepare('INSERT INTO participants (session_id, name, job_title) VALUES (?, ?, ?)')
    .bind(session.id, name.trim(), jobTitle?.trim() || null).run();
  return NextResponse.json({ participantId: result.meta.last_row_id, state: session.state });
}
