import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const { participantId, questionIndex, answerIndex } = await request.json();

  if (!Number.isInteger(participantId) || !Number.isInteger(questionIndex) || !Number.isInteger(answerIndex)) {
    return NextResponse.json({ error: 'Réponse invalide.' }, { status: 400 });
  }

  const db = getDB();
  const session = await db.prepare('SELECT id, state, current_question FROM live_sessions WHERE code = ?').bind(code).first<{id:number;state:string;current_question:number}>();
  if (!session) return NextResponse.json({ error: 'Séance introuvable.' }, { status: 404 });
  if (session.state !== 'QUESTION') return NextResponse.json({ error: 'Aucune question active.' }, { status: 409 });
  if (questionIndex !== session.current_question) return NextResponse.json({ error: 'Cette question n’est plus active.' }, { status: 409 });

  const participant = await db.prepare('SELECT id FROM participants WHERE id = ? AND session_id = ?').bind(participantId, session.id).first();
  if (!participant) return NextResponse.json({ error: 'Participant invalide.' }, { status: 403 });

  await db.prepare(`INSERT INTO responses (session_id, participant_id, question_index, answer_index)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(participant_id, question_index) DO UPDATE SET answer_index = excluded.answer_index, created_at = CURRENT_TIMESTAMP`)
    .bind(session.id, participantId, questionIndex, answerIndex).run();

  return NextResponse.json({ ok: true });
}
