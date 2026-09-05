import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {getAuthContext} from '@/lib/auth';

export async function GET(){
  try{
    const auth=await getAuthContext();
    if(!auth||!auth.organizationId) return NextResponse.json({error:'Non autorisé'},{status:401});
    const admin=auth.roles.includes('ORG_ADMIN');
    const trainer=auth.roles.includes('TRAINER');
    if(!admin&&!trainer) return NextResponse.json({error:'Accès formateur requis'},{status:403});
    const db=getDB();
    const org=auth.organizationId;
    const organization=await db.prepare(`SELECT id,name,branding_json brandingJson FROM organizations WHERE id=? AND status='ACTIVE' LIMIT 1`).bind(org).first<{id:string;name:string;brandingJson:string|null}>();
    if(!organization)return NextResponse.json({error:'Organisation introuvable'},{status:404});
    const sessions=await db.prepare(`SELECT cs.id,cs.title,cs.delivery_mode deliveryMode,cs.status,cs.starts_at startsAt,cs.ends_at endsAt,t.title trainingTitle,c.name cohortName,(SELECT COUNT(*) FROM attendance a WHERE a.course_session_id=cs.id) participantCount,(SELECT COUNT(*) FROM classroom_interactions ci WHERE ci.course_session_id=cs.id AND ci.status='OPEN') openInteractions FROM course_sessions cs JOIN trainings t ON t.id=cs.training_id LEFT JOIN cohorts c ON c.id=cs.cohort_id WHERE cs.organization_id=? AND (cs.trainer_user_id=? OR ?=1) AND cs.status IN ('SCHEDULED','READY','IN_PROGRESS') ORDER BY CASE WHEN cs.status='IN_PROGRESS' THEN 0 WHEN cs.starts_at IS NULL THEN 2 ELSE 1 END,cs.starts_at LIMIT 50`).bind(org,auth.userId,admin?1:0).all();
    const groups=await db.prepare(`SELECT c.id,c.name,t.title trainingTitle,COUNT(DISTINCT cm.user_id) learnerCount FROM cohorts c JOIN trainings t ON t.id=c.training_id LEFT JOIN cohort_members mine ON mine.cohort_id=c.id AND mine.user_id=? AND mine.role='TRAINER' AND mine.status='ACTIVE' LEFT JOIN cohort_members cm ON cm.cohort_id=c.id AND cm.role='LEARNER' AND cm.status='ACTIVE' WHERE c.organization_id=? AND (?=1 OR mine.id IS NOT NULL) GROUP BY c.id ORDER BY c.name`).bind(auth.userId,org,admin?1:0).all();
    const resources=await db.prepare(`SELECT id,title,mime_type mimeType,size_bytes sizeBytes,created_at createdAt FROM course_resources WHERE organization_id=? AND deleted_at IS NULL AND (uploaded_by_user_id=? OR ?=1) ORDER BY created_at DESC LIMIT 20`).bind(org,auth.userId,admin?1:0).all();
    const stats=await db.prepare(`SELECT COUNT(*) total,COALESCE(SUM(CASE WHEN status='IN_PROGRESS' THEN 1 ELSE 0 END),0) live FROM course_sessions WHERE organization_id=? AND (trainer_user_id=? OR ?=1) AND status IN ('SCHEDULED','READY','IN_PROGRESS')`).bind(org,auth.userId,admin?1:0).first();
    let branding:any={};try{branding=organization.brandingJson?JSON.parse(organization.brandingJson):{}}catch{}
    return NextResponse.json({ok:true,organization:{id:organization.id,name:organization.name,logoUrl:branding.logoUrl||null,primaryColor:branding.primaryColor||null,secondaryColor:branding.secondaryColor||null},sessions:sessions.results||[],groups:groups.results||[],resources:resources.results||[],stats:stats||{total:0,live:0}});
  }catch(e){
    console.error('Trainer overview failed',e);
    return NextResponse.json({error:'Impossible de charger le portail formateur'},{status:500});
  }
}
