import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

type QuestionInput={stage:string;prompt:string;answers:string[];why:string;relances:string[]};
type QuestionRow={position:number;stage:string;prompt:string;answers_json:string;why:string;relances_json:string};

export async function GET(_request:Request, context:{params:Promise<{slug:string}>}){
 const {slug}=await context.params;const db=getDB();
 const training=await db.prepare(`SELECT id,slug,title,description,status FROM trainings WHERE organization_id='evolution-pme' AND slug=?`).bind(slug).first<{id:number;slug:string;title:string;description:string|null;status:string}>();
 if(!training)return NextResponse.json({error:'Formation introuvable.'},{status:404});
 const rows=await db.prepare('SELECT position,stage,prompt,answers_json,why,relances_json FROM training_questions WHERE training_id=? ORDER BY position').bind(training.id).all<QuestionRow>();
 return NextResponse.json({training:{slug:training.slug,title:training.title,description:training.description||'',status:training.status,questions:rows.results.map(q=>({stage:q.stage,prompt:q.prompt,answers:JSON.parse(q.answers_json),why:q.why,relances:JSON.parse(q.relances_json)}))}});
}

export async function PUT(request:Request, context:{params:Promise<{slug:string}>}){
 const {slug}=await context.params;const body=await request.json();const db=getDB();
 const title=String(body.title||'').trim();const description=String(body.description||'').trim();const questions=(body.questions||[]) as QuestionInput[];
 if(!title||!Array.isArray(questions)||questions.length===0)return NextResponse.json({error:'Titre et au moins une question requis.'},{status:400});
 const training=await db.prepare(`SELECT id FROM trainings WHERE organization_id='evolution-pme' AND slug=?`).bind(slug).first<{id:number}>();
 if(!training)return NextResponse.json({error:'Formation introuvable.'},{status:404});
 await db.prepare('UPDATE trainings SET title=?,description=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(title,description,training.id).run();
 await db.prepare('DELETE FROM training_questions WHERE training_id=?').bind(training.id).run();
 for(let i=0;i<questions.length;i++){
  const q=questions[i];
  await db.prepare(`INSERT INTO training_questions (training_id,position,stage,prompt,answers_json,why,relances_json) VALUES (?,?,?,?,?,?,?)`).bind(training.id,i,String(q.stage||'QUESTION').trim(),String(q.prompt||'').trim(),JSON.stringify((q.answers||[]).map(String)),String(q.why||'').trim(),JSON.stringify((q.relances||[]).map(String))).run();
 }
 return NextResponse.json({ok:true});
}
