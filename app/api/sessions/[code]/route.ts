import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const db = getDB();
  const session = await db.prepare('SELECT id, code, training_slug, state, current_question FROM live_sessions WHERE code = ?').bind(code).first<{id:number;code:string;training_slug:string;state:string;current_question:number}>();
  if (!session) return NextResponse.json({ error: 'Séance introuvable.' }, { status: 404 });

  const participants = await db.prepare('SELECT id, name, job_title FROM participants WHERE session_id = ? ORDER BY joined_at').bind(session.id).all();
  const responses = await db.prepare(`SELECT answer_index, COUNT(*) AS count FROM responses
    WHERE session_id = ? AND question_index = ? GROUP BY answer_index ORDER BY answer_index`)
    .bind(session.id, session.current_question).all<{answer_index:number;count:number}>();

  const distribution = [0, 0, 0, 0];
  for (const row of responses.results) {
    if (row.answer_index >= 0 && row.answer_index < distribution.length) distribution[row.answer_index] = Number(row.count);
  }
  const responseCount = distribution.reduce((sum, count) => sum + count, 0);

  return NextResponse.json({ session, participants: participants.results, responses: { count: responseCount, distribution } });
}

export async function PATCH(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const { state, currentQuestion } = await request.json();
  const db = getDB();
  await db.prepare('UPDATE live_sessions SET state = COALESCE(?, state), current_question = COALESCE(?, current_question) WHERE code = ?')
    .bind(state ?? null, currentQuestion ?? null, code).run();
  return NextResponse.json({ ok: true });
}
