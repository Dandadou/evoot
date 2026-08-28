import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const db = getDB();
  const session = await db.prepare('SELECT id, code, training_slug, state, current_question FROM live_sessions WHERE code = ?').bind(code).first();
  if (!session) return NextResponse.json({ error: 'Séance introuvable.' }, { status: 404 });
  const participants = await db.prepare('SELECT id, name, job_title FROM participants WHERE session_id = ? ORDER BY joined_at').bind(session.id).all();
  return NextResponse.json({ session, participants: participants.results });
}

export async function PATCH(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const { state, currentQuestion } = await request.json();
  const db = getDB();
  await db.prepare('UPDATE live_sessions SET state = COALESCE(?, state), current_question = COALESCE(?, current_question) WHERE code = ?')
    .bind(state ?? null, currentQuestion ?? null, code).run();
  return NextResponse.json({ ok: true });
}
