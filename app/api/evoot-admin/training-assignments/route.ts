import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {requireEvootAdmin} from '@/lib/auth';

function denied(e:unknown){return e instanceof Error&&e.message==='UNAUTHORIZED'?NextResponse.json({error:'Non autorisé'},{status:401}):NextResponse.json({error:'Impossible de gérer les attributions'},{status:500})}

export async function GET(){
 try{
  await requireEvootAdmin();const db=getDB();
  const [trainings,organizations,assignments]=await Promise.all([
   db.prepare(`SELECT t.id,t.slug,t.title,t.organization_id ownerOrganizationId,o.name ownerOrganizationName FROM trainings t JOIN organizations o ON o.id=t.organization_id ORDER BY t.title`).all(),
   db.prepare(`SELECT id,name,status FROM organizations WHERE id!='evoot' AND status='ACTIVE' ORDER BY name`).all(),
   db.prepare(`SELECT ot.id,ot.organization_id organizationId,o.name organizationName,ot.training_id trainingId,t.title trainingTitle,ot.status,ot.assigned_at assignedAt FROM organization_trainings ot JOIN organizations o ON o.id=ot.organization_id JOIN trainings t ON t.id=ot.training_id WHERE ot.status='ACTIVE' ORDER BY o.name,t.title`).all()
  ]);
  return NextResponse.json({trainings:trainings.results||[],organizations:organizations.results||[],assignments:assignments.results||[]});
 }catch(e){return denied(e)}
}

export async function POST(req:Request){
 try{
  const auth=await requireEvootAdmin();const b=await req.json();const organizationId=String(b.organizationId||'').trim();const trainingId=Number(b.trainingId);if(!organizationId||!trainingId)return NextResponse.json({error:'Organisation et formation requises'},{status:400});
  const db=getDB();const [organization,training]=await Promise.all([db.prepare(`SELECT id FROM organizations WHERE id=? AND status='ACTIVE'`).bind(organizationId).first(),db.prepare(`SELECT id,organization_id ownerOrganizationId FROM trainings WHERE id=?`).bind(trainingId).first<{id:number;ownerOrganizationId:string}>()]);
  if(!organization||!training)return NextResponse.json({error:'Organisation ou formation introuvable'},{status:404});
  if(training.ownerOrganizationId===organizationId)return NextResponse.json({error:'Cette organisation possède déjà cette formation'},{status:409});
  await db.prepare(`INSERT INTO organization_trainings (organization_id,training_id,status,assigned_by_user_id,assigned_at,revoked_at,updated_at) VALUES (?,?,'ACTIVE',?,CURRENT_TIMESTAMP,NULL,CURRENT_TIMESTAMP) ON CONFLICT(organization_id,training_id) DO UPDATE SET status='ACTIVE',assigned_by_user_id=excluded.assigned_by_user_id,assigned_at=CURRENT_TIMESTAMP,revoked_at=NULL,updated_at=CURRENT_TIMESTAMP`).bind(organizationId,trainingId,auth.userId).run();
  return NextResponse.json({ok:true},{status:201});
 }catch(e){return denied(e)}
}

export async function DELETE(req:Request){
 try{
  await requireEvootAdmin();const b=await req.json().catch(()=>({}));const organizationId=String(b.organizationId||'').trim();const trainingId=Number(b.trainingId);if(!organizationId||!trainingId)return NextResponse.json({error:'Organisation et formation requises'},{status:400});const db=getDB();
  const assignment=await db.prepare(`SELECT id FROM organization_trainings WHERE organization_id=? AND training_id=? AND status='ACTIVE'`).bind(organizationId,trainingId).first();if(!assignment)return NextResponse.json({error:'Attribution introuvable'},{status:404});
  const inUse=await db.prepare(`SELECT (SELECT COUNT(*) FROM cohorts WHERE organization_id=? AND training_id=? AND status!='ARCHIVED')+(SELECT COUNT(*) FROM course_sessions WHERE organization_id=? AND training_id=? AND status NOT IN ('CANCELLED','COMPLETED')) n`).bind(organizationId,trainingId,organizationId,trainingId).first<{n:number}>();
  if((inUse?.n||0)>0)return NextResponse.json({error:'Cette formation est encore utilisée par un groupe ou une séance active. Archive ou termine ces éléments avant de retirer l’accès.'},{status:409});
  await db.prepare(`UPDATE organization_trainings SET status='REVOKED',revoked_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE organization_id=? AND training_id=?`).bind(organizationId,trainingId).run();return NextResponse.json({ok:true});
 }catch(e){return denied(e)}
}
