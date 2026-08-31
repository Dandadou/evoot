import { NextResponse } from 'next/server';
import { getDB } from '../../../../lib/db';

const ORG='evolution-pme';

export async function GET(){
 try{
  const db=getDB();
  const [trainings,cohorts,trainers,learners,sessions]=await Promise.all([
   db.prepare('SELECT COUNT(*) n FROM trainings WHERE organization_id=?').bind(ORG).first<{n:number}>(),
   db.prepare("SELECT COUNT(*) n FROM cohorts WHERE organization_id=? AND status!='ARCHIVED'").bind(ORG).first<{n:number}>(),
   db.prepare("SELECT COUNT(DISTINCT user_id) n FROM organization_members WHERE organization_id=? AND role='TRAINER' AND status='ACTIVE'").bind(ORG).first<{n:number}>(),
   db.prepare("SELECT COUNT(DISTINCT user_id) n FROM organization_members WHERE organization_id=? AND role='LEARNER' AND status='ACTIVE'").bind(ORG).first<{n:number}>(),
   db.prepare("SELECT COUNT(*) n FROM course_sessions WHERE organization_id=? AND status='SCHEDULED'").bind(ORG).first<{n:number}>(),
  ]);
  return NextResponse.json({organizationId:ORG,counts:{trainings:trainings?.n||0,cohorts:cohorts?.n||0,trainers:trainers?.n||0,learners:learners?.n||0,sessions:sessions?.n||0}});
 }catch(e){return NextResponse.json({error:String(e)},{status:500})}
}
