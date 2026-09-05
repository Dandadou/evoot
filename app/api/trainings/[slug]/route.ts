import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {requireOrganizationRole} from '@/lib/auth';

type QuestionInput={stage:string;prompt:string;answers:string[];why:string;relances:string[]};type QuestionRow={position:number;stage:string;prompt:string;answers_json:string;why:string;relances_json:string};type BlockInput={type:string;title?:string;content?:Record<string,unknown>;durationMinutes?:number|null;visibility?:string};type BlockRow={position:number;type:string;title:string|null;content_json:string;duration_minutes:number|null;visibility:string};
function unauthorized(e:unknown){return e instanceof Error&&e.message==='UNAUTHORIZED'}

export async function GET(_request:Request,context:{params:Promise<{slug:string}>}){
 try{
  const auth=await requireOrganizationRole('ORG_ADMIN');const org=auth.organizationId!;const {slug}=await context.params;const db=getDB();
  const training=await db.prepare(`SELECT id,slug,title,description,status,target_duration_minutes,delivery_mode FROM trainings WHERE organization_id=? AND slug=?`).bind(org,slug).first<{id:number;slug:string;title:string;description:string|null;status:string;target_duration_minutes:number|null;delivery_mode:string}>();
  if(!training)return NextResponse.json({error:'Formation introuvable.'},{status:404});
  const rows=await db.prepare('SELECT position,stage,prompt,answers_json,why,relances_json FROM training_questions WHERE training_id=? ORDER BY position').bind(training.id).all<QuestionRow>();const blockRows=await db.prepare('SELECT position,type,title,content_json,duration_minutes,visibility FROM training_blocks WHERE training_id=? ORDER BY position').bind(training.id).all<BlockRow>();
  return NextResponse.json({training:{slug:training.slug,title:training.title,description:training.description||'',status:training.status,targetDurationMinutes:training.target_duration_minutes,deliveryMode:training.delivery_mode,questions:rows.results.map(q=>({stage:q.stage,prompt:q.prompt,answers:JSON.parse(q.answers_json),why:q.why,relances:JSON.parse(q.relances_json)})),blocks:blockRows.results.map(b=>({type:b.type,title:b.title||'',content:JSON.parse(b.content_json||'{}'),durationMinutes:b.duration_minutes,visibility:b.visibility}))}});
 }catch(e){if(unauthorized(e))return NextResponse.json({error:'Non autorisé'},{status:401});return NextResponse.json({error:'Impossible de charger la formation'},{status:500});}
}

export async function PUT(request:Request,context:{params:Promise<{slug:string}>}){
 try{
  const auth=await requireOrganizationRole('ORG_ADMIN');const org=auth.organizationId!;const {slug}=await context.params;const body=await request.json();const db=getDB();const title=String(body.title||'').trim();const description=String(body.description||'').trim();const questions=(body.questions||[]) as QuestionInput[];const blocks=(body.blocks||[]) as BlockInput[];
  if(!title)return NextResponse.json({error:'Titre requis.'},{status:400});
  const training=await db.prepare(`SELECT id FROM trainings WHERE organization_id=? AND slug=?`).bind(org,slug).first<{id:number}>();if(!training)return NextResponse.json({error:'Formation introuvable.'},{status:404});
  const target=body.targetDurationMinutes===null||body.targetDurationMinutes===''?null:Number.isFinite(Number(body.targetDurationMinutes))?Math.max(0,Number(body.targetDurationMinutes)):null;const delivery=['LIVE','SELF_PACED','BOTH'].includes(body.deliveryMode)?body.deliveryMode:'BOTH';
  await db.prepare('UPDATE trainings SET title=?,description=?,target_duration_minutes=?,delivery_mode=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND organization_id=?').bind(title,description,target,delivery,training.id,org).run();
  if(Array.isArray(body.questions)){await db.prepare('DELETE FROM training_questions WHERE training_id=?').bind(training.id).run();for(let i=0;i<questions.length;i++){const q=questions[i];await db.prepare(`INSERT INTO training_questions (training_id,position,stage,prompt,answers_json,why,relances_json) VALUES (?,?,?,?,?,?,?)`).bind(training.id,i,String(q.stage||'QUESTION').trim(),String(q.prompt||'').trim(),JSON.stringify((q.answers||[]).map(String)),String(q.why||'').trim(),JSON.stringify((q.relances||[]).map(String))).run();}}
  if(Array.isArray(body.blocks)){await db.prepare('DELETE FROM training_blocks WHERE training_id=?').bind(training.id).run();for(let i=0;i<blocks.length;i++){const b=blocks[i];const visibility=['LIVE','SELF_PACED','BOTH','TRAINER'].includes(String(b.visibility))?String(b.visibility):'BOTH';const duration=b.durationMinutes===null||b.durationMinutes===undefined?null:Number.isFinite(Number(b.durationMinutes))?Math.max(0,Number(b.durationMinutes)):null;await db.prepare(`INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility) VALUES (?,?,?,?,?,?,?)`).bind(training.id,i,String(b.type||'TEXT'),String(b.title||''),JSON.stringify(b.content||{}),duration,visibility).run();}}
  return NextResponse.json({ok:true});
 }catch(e){if(unauthorized(e))return NextResponse.json({error:'Non autorisé'},{status:401});return NextResponse.json({error:'Impossible d’enregistrer la formation'},{status:500});}
}
