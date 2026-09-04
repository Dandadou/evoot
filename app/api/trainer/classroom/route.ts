import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {requireOrganizationRole} from '@/lib/auth';

export async function GET(req:Request){
  try{
    const auth=await requireOrganizationRole('TRAINER');
    const db=getDB();
    const org=auth.organizationId!;
    const {searchParams}=new URL(req.url);
    const requested=Number(searchParams.get('sessionId')||0);
    const session=await db.prepare(`SELECT cs.id,cs.title,cs.training_id trainingId,cs.cohort_id cohortId,cs.trainer_user_id trainerUserId,cs.delivery_mode deliveryMode,cs.status,cs.starts_at startsAt,cs.ends_at endsAt,cs.timezone,t.title trainingTitle,t.slug trainingSlug,c.name cohortName,u.display_name trainerName FROM course_sessions cs JOIN trainings t ON t.id=cs.training_id LEFT JOIN cohorts c ON c.id=cs.cohort_id LEFT JOIN users u ON u.id=cs.trainer_user_id WHERE cs.organization_id=? AND (cs.trainer_user_id=? OR ?=1) ${requested?'AND cs.id=?':''} ORDER BY CASE WHEN cs.status='IN_PROGRESS' THEN 0 WHEN cs.status='SCHEDULED' THEN 1 ELSE 2 END,CASE WHEN cs.starts_at IS NULL THEN 1 ELSE 0 END,cs.starts_at LIMIT 1`).bind(...(requested?[org,auth.userId,auth.roles.includes('ORG_ADMIN')?1:0,requested]:[org,auth.userId,auth.roles.includes('ORG_ADMIN')?1:0])).first<any>();
    if(!session)return NextResponse.json({session:null,participants:[],interactions:[],blocks:[]});
    const [attendance,interactions,blocks]=await Promise.all([
      db.prepare(`SELECT a.status,a.joined_at joinedAt,a.left_at leftAt,u.id userId,u.display_name displayName,u.email FROM attendance a JOIN users u ON u.id=a.user_id WHERE a.course_session_id=? ORDER BY u.display_name`).bind(session.id).all(),
      db.prepare(`SELECT ci.id,ci.type,ci.body,ci.visibility,ci.status,ci.created_at createdAt,u.display_name displayName FROM classroom_interactions ci JOIN users u ON u.id=ci.user_id WHERE ci.organization_id=? AND ci.course_session_id=? AND ci.status='OPEN' ORDER BY ci.created_at DESC`).bind(org,session.id).all(),
      db.prepare(`SELECT id,position,type,title,content_json contentJson,trainer_notes trainerNotes,duration_minutes durationMinutes FROM training_blocks WHERE training_id=? ORDER BY position`).bind(session.trainingId).all()
    ]);
    return NextResponse.json({session,participants:attendance.results||[],interactions:interactions.results||[],blocks:blocks.results||[]});
  }catch(e){
    if(e instanceof Error&&e.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});
    console.error('Trainer classroom load failed',e);
    return NextResponse.json({error:'Impossible de charger la Régie'},{status:500});
  }
}
