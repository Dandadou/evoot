import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {requireOrganizationRole} from '@/lib/auth';

function unauthorized(e:unknown){return e instanceof Error&&e.message==='UNAUTHORIZED'}

export async function GET(){
  try{
    const auth=await requireOrganizationRole('LEARNER');
    const org=auth.organizationId!;
    const userId=auth.userId;
    const db=getDB();

    const organization=await db.prepare('SELECT id,name,branding_json brandingJson FROM organizations WHERE id=? AND status=\'ACTIVE\' LIMIT 1').bind(org).first<{id:string;name:string;brandingJson:string|null}>();
    if(!organization)return NextResponse.json({error:'Organisation introuvable'},{status:404});

    const enrollments=await db.prepare(`SELECT e.id,e.training_id trainingId,e.status,e.available_from availableFrom,e.available_until availableUntil,t.title trainingTitle,COALESCE(lp.progress_percent,0) progressPercent,lp.completed_at completedAt FROM enrollments e JOIN trainings t ON t.id=e.training_id LEFT JOIN learner_progress lp ON lp.enrollment_id=e.id WHERE e.organization_id=? AND e.user_id=? AND e.status IN ('ENROLLED','ACTIVE','IN_PROGRESS','COMPLETED') ORDER BY CASE WHEN lp.completed_at IS NULL THEN 0 ELSE 1 END,t.title`).bind(org,userId).all();

    const sessions=await db.prepare(`SELECT DISTINCT cs.id,cs.title,cs.delivery_mode deliveryMode,cs.status,cs.starts_at startsAt,cs.ends_at endsAt,t.title trainingTitle FROM course_sessions cs JOIN trainings t ON t.id=cs.training_id LEFT JOIN enrollments e ON e.organization_id=cs.organization_id AND e.training_id=cs.training_id AND e.user_id=? LEFT JOIN cohort_members cm ON cm.user_id=? AND cm.role='LEARNER' AND cm.status='ACTIVE' LEFT JOIN cohorts c ON c.id=cm.cohort_id AND c.organization_id=cs.organization_id AND c.id=cs.cohort_id WHERE cs.organization_id=? AND (e.id IS NOT NULL OR c.id IS NOT NULL) AND cs.status IN ('SCHEDULED','READY','IN_PROGRESS') ORDER BY cs.starts_at LIMIT 30`).bind(userId,userId,org).all();

    const resources=await db.prepare(`SELECT DISTINCT cr.id,cr.title,cr.mime_type mimeType,cr.size_bytes sizeBytes,cr.created_at createdAt FROM course_resources cr LEFT JOIN enrollments e ON e.organization_id=cr.organization_id AND e.training_id=cr.training_id AND e.user_id=? LEFT JOIN resource_recipients rr ON rr.resource_id=cr.id AND rr.user_id=? WHERE cr.organization_id=? AND cr.deleted_at IS NULL AND ((cr.visibility='ENROLLED' AND e.id IS NOT NULL) OR (cr.visibility='INDIVIDUAL' AND rr.user_id IS NOT NULL)) ORDER BY cr.created_at DESC LIMIT 30`).bind(userId,userId,org).all();

    let branding:any={};
    try{branding=organization.brandingJson?JSON.parse(organization.brandingJson):{}}catch{}

    return NextResponse.json({organization:{id:organization.id,name:organization.name,logoUrl:branding.logoUrl||null,primaryColor:branding.primaryColor||null,secondaryColor:branding.secondaryColor||null},enrollments:enrollments.results||[],sessions:sessions.results||[],resources:resources.results||[]});
  }catch(e){
    if(unauthorized(e))return NextResponse.json({error:'Non autorisé'},{status:401});
    console.error('Learner overview failed',e);
    return NextResponse.json({error:'Impossible de charger le portail apprenant'},{status:500});
  }
}
