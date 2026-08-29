import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const { participantId, questionIndex, answerIndex } = await request.json();
  if (!Number.isInteger(participantId)||!Number.isInteger(questionIndex)||!Number.isInteger(answerIndex)) return NextResponse.json({error:'Réponse invalide.'},{status:400});
  const db=getDB();
  const session=await db.prepare('SELECT id, training_slug, state, current_question FROM live_sessions WHERE code = ?').bind(code).first<{id:number;training_slug:string;state:string;current_question:number}>();
  if(!session)return NextResponse.json({error:'Séance introuvable.'},{status:404});
  if(session.state!=='BLOCK'&&session.state!=='QUESTION')return NextResponse.json({error:'Aucune question active.'},{status:409});
  const training=await db.prepare(`SELECT id FROM trainings WHERE organization_id='evolution-pme' AND slug=?`).bind(session.training_slug).first<{id:number}>();
  if(!training)return NextResponse.json({error:'Formation introuvable.'},{status:404});
  const liveBlocks=await db.prepare(`SELECT position,type FROM training_blocks WHERE training_id=? AND visibility IN ('LIVE','BOTH','TRAINER') ORDER BY position`).bind(training.id).all<{position:number;type:string}>();
  const currentBlock=liveBlocks.results[session.current_question];
  if(currentBlock&&currentBlock.type!=='LIVE_QUESTION')return NextResponse.json({error:'Aucune question active.'},{status:409});
  const questionBlocks=liveBlocks.results.filter(b=>b.type==='LIVE_QUESTION');
  const activeQuestionIndex=currentBlock?questionBlocks.findIndex(b=>b.position===currentBlock.position):session.current_question;
  if(questionIndex!==activeQuestionIndex)return NextResponse.json({error:'Cette question n’est plus active.'},{status:409});
  const participant=await db.prepare('SELECT id FROM participants WHERE id=? AND session_id=?').bind(participantId,session.id).first();
  if(!participant)return NextResponse.json({error:'Participant invalide.'},{status:403});
  await db.prepare(`INSERT INTO responses (session_id,participant_id,question_index,answer_index) VALUES (?,?,?,?) ON CONFLICT(participant_id,question_index) DO UPDATE SET answer_index=excluded.answer_index,created_at=CURRENT_TIMESTAMP`).bind(session.id,participantId,activeQuestionIndex,answerIndex).run();
  return NextResponse.json({ok:true});
}
