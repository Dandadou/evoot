import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

type QuestionRow={position:number;stage:string;prompt:string;answers_json:string;why:string;relances_json:string};
type BlockRow={position:number;title:string|null;content_json:string};

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const db = getDB();
  const session = await db.prepare('SELECT id, code, training_slug, state, current_question FROM live_sessions WHERE code = ?').bind(code).first<{id:number;code:string;training_slug:string;state:string;current_question:number}>();
  if (!session) return NextResponse.json({ error: 'Séance introuvable.' }, { status: 404 });

  const training = await db.prepare(`SELECT id, slug, title, description FROM trainings
    WHERE organization_id = 'evolution-pme' AND slug = ?`).bind(session.training_slug).first<{id:number;slug:string;title:string;description:string|null}>();
  if (!training) return NextResponse.json({ error: 'Formation introuvable.' }, { status: 404 });

  const blockRows = await db.prepare(`SELECT position, title, content_json FROM training_blocks
    WHERE training_id = ? AND type = 'LIVE_QUESTION' AND visibility IN ('LIVE','BOTH') ORDER BY position`).bind(training.id).all<BlockRow>();

  let questions = blockRows.results.map(row => {
    const content = JSON.parse(row.content_json || '{}') as {prompt?:string;answers?:string[];why?:string;relances?:string[]};
    return {
      position: row.position,
      stage: row.title || 'QUESTION',
      prompt: String(content.prompt || ''),
      answers: Array.isArray(content.answers) ? content.answers.map(String) : [],
      why: String(content.why || ''),
      relances: Array.isArray(content.relances) ? content.relances.map(String) : []
    };
  });

  // Compatibilité avec les anciennes formations qui utilisent encore training_questions.
  if (!questions.length) {
    const questionRows = await db.prepare(`SELECT position, stage, prompt, answers_json, why, relances_json FROM training_questions
      WHERE training_id = ? ORDER BY position`).bind(training.id).all<QuestionRow>();
    questions = questionRows.results.map(row => ({
      position: row.position,
      stage: row.stage,
      prompt: row.prompt,
      answers: JSON.parse(row.answers_json) as string[],
      why: row.why,
      relances: JSON.parse(row.relances_json) as string[]
    }));
  }

  const participants = await db.prepare('SELECT id, name, job_title FROM participants WHERE session_id = ? ORDER BY joined_at').bind(session.id).all();
  const responses = await db.prepare(`SELECT answer_index, COUNT(*) AS count FROM responses
    WHERE session_id = ? AND question_index = ? GROUP BY answer_index ORDER BY answer_index`)
    .bind(session.id, session.current_question).all<{answer_index:number;count:number}>();

  const answerCount = questions[session.current_question]?.answers.length || 4;
  const distribution = Array(answerCount).fill(0) as number[];
  for (const row of responses.results) {
    if (row.answer_index >= 0 && row.answer_index < distribution.length) distribution[row.answer_index] = Number(row.count);
  }
  const responseCount = distribution.reduce((sum, count) => sum + count, 0);

  return NextResponse.json({ session, training, questions, participants: participants.results, responses: { count: responseCount, distribution } });
}

export async function PATCH(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const { state, currentQuestion } = await request.json();
  const db = getDB();
  await db.prepare('UPDATE live_sessions SET state = COALESCE(?, state), current_question = COALESCE(?, current_question) WHERE code = ?')
    .bind(state ?? null, currentQuestion ?? null, code).run();
  return NextResponse.json({ ok: true });
}
