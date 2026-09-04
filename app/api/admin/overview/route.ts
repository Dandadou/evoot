import {NextResponse} from 'next/server';
import {getDB} from '../../../../lib/db';
import {requireOrganizationRole} from '../../../../lib/auth';

export async function GET(){
 try{
  const auth=await requireOrganizationRole('ORG_ADMIN');
  const db=getDB();
  const orgId=auth.organizationId!;
  const [organization,trainings,cohorts,trainers,learners,sessions]=await Promise.all([
   db.prepare('SELECT id,name,branding_json brandingJson FROM organizations WHERE id=? LIMIT 1').bind(orgId).first<{id:string;name:string;brandingJson:string|null}>(),
   db.prepare('SELECT COUNT(*) n FROM trainings WHERE organization_id=?').bind(orgId).first<{n:number}>(),
   db.prepare("SELECT COUNT(*) n FROM cohorts WHERE organization_id=? AND status!='ARCHIVED'").bind(orgId).first<{n:number}>(),
   db.prepare("SELECT COUNT(DISTINCT user_id) n FROM organization_members WHERE organization_id=? AND role='TRAINER' AND status='ACTIVE'").bind(orgId).first<{n:number}>(),
   db.prepare("SELECT COUNT(DISTINCT user_id) n FROM organization_members WHERE organization_id=? AND role='LEARNER' AND status='ACTIVE'").bind(orgId).first<{n:number}>(),
   db.prepare("SELECT COUNT(*) n FROM course_sessions WHERE organization_id=? AND status='SCHEDULED'").bind(orgId).first<{n:number}>(),
  ]);
  let branding:any={};
  try{branding=organization?.brandingJson?JSON.parse(organization.brandingJson):{}}catch{}
  return NextResponse.json({organization:{id:organization?.id||orgId,name:organization?.name||'Organisation',logoUrl:branding.logoUrl||null,primaryColor:branding.primaryColor||null,secondaryColor:branding.secondaryColor||null},counts:{trainings:trainings?.n||0,cohorts:cohorts?.n||0,trainers:trainers?.n||0,learners:learners?.n||0,sessions:sessions?.n||0}});
 }catch(e){
  if(e instanceof Error&&e.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});
  console.error('Admin overview failed',e);
  return NextResponse.json({error:'Impossible de charger le portail'},{status:500});
 }
}
