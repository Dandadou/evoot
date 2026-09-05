import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {getAuthContext} from '@/lib/auth';

export async function POST(request:Request){
 const auth=await getAuthContext();if(!auth?.organizationId||(!auth.roles.includes('TRAINER')&&!auth.roles.includes('ORG_ADMIN')))return NextResponse.json({error:'Accès formateur requis.'},{status:401});
 const {trainingSlug}=await request.json().catch(()=>({}));if(!trainingSlug)return NextResponse.json({error:'Formation requise.'},{status:400});const db=getDB(),org=auth.organizationId;
 const training=await db.prepare(`SELECT t.id,t.slug FROM trainings t WHERE t.slug=? AND (t.organization_id=? OR EXISTS(SELECT 1 FROM organization_trainings ot WHERE ot.organization_id=? AND ot.training_id=t.id AND ot.status='ACTIVE')) LIMIT 1`).bind(String(trainingSlug),org,org).first<any>();if(!training)return NextResponse.json({error:'Formation non disponible dans cette organisation.'},{status:404});
 for(let attempt=0;attempt<8;attempt++){const code=String(Math.floor(100000+Math.random()*900000));try{await db.prepare('INSERT INTO live_sessions (code,organization_id,training_slug) VALUES (?,?,?)').bind(code,org,training.slug).run();return NextResponse.json({code})}catch(error){if(attempt===7){console.error(error);return NextResponse.json({error:'Impossible de créer la séance.'},{status:500})}}}return NextResponse.json({error:'Impossible de créer la séance.'},{status:500})}
