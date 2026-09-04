import {NextRequest,NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {requireEvootAdmin} from '@/lib/auth';

const IDLE_MINUTES=120;

async function cleanup(db:ReturnType<typeof getDB>){
  // A session is not considered connected forever just because its login token
  // has not reached its absolute expiry. Revoke expired and genuinely idle sessions.
  await db.prepare(`UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE revoked_at IS NULL AND (expires_at<=CURRENT_TIMESTAMP OR last_seen_at<datetime('now',?))`).bind(`-${IDLE_MINUTES} minutes`).run();
}

export async function GET(){
  try{
    const auth=await requireEvootAdmin();
    const db=getDB();
    await cleanup(db);
    const rows=await db.prepare(`SELECT s.id,s.user_id userId,u.email,u.display_name displayName,s.active_organization_id organizationId,o.name organizationName,s.created_at createdAt,s.last_seen_at lastSeenAt,s.expires_at expiresAt,CASE WHEN s.id=? THEN 1 ELSE 0 END isCurrent FROM auth_sessions s JOIN users u ON u.id=s.user_id LEFT JOIN organizations o ON o.id=s.active_organization_id WHERE s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP AND s.last_seen_at>=datetime('now',?) ORDER BY isCurrent DESC,s.last_seen_at DESC LIMIT 300`).bind(auth.sessionId,`-${IDLE_MINUTES} minutes`).all();
    return NextResponse.json({ok:true,idleMinutes:IDLE_MINUTES,sessions:rows.results||[]});
  }catch(e){
    if(e instanceof Error&&e.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});
    console.error('EVOOT sessions load failed',e);
    return NextResponse.json({error:'Impossible de charger les sessions'},{status:500});
  }
}

export async function DELETE(req:NextRequest){
  try{
    const auth=await requireEvootAdmin();
    const body=await req.json() as {id?:number|string;allOthers?:boolean};
    const db=getDB();
    if(body.allOthers){
      const result=await db.prepare(`UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE revoked_at IS NULL AND id<>?`).bind(auth.sessionId).run();
      return NextResponse.json({ok:true,revoked:result.meta?.changes||0});
    }
    const id=Number(body.id);
    if(!Number.isInteger(id)||id<=0)return NextResponse.json({error:'Session requise'},{status:400});
    if(id===auth.sessionId)return NextResponse.json({error:'La session utilisée en ce moment doit rester ouverte.'},{status:400});
    const session=await db.prepare(`SELECT id FROM auth_sessions WHERE id=? AND revoked_at IS NULL`).bind(id).first();
    if(!session)return NextResponse.json({error:'Session introuvable ou déjà fermée'},{status:404});
    await db.prepare(`UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
    return NextResponse.json({ok:true});
  }catch(e){
    if(e instanceof Error&&e.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});
    console.error('EVOOT session revoke failed',e);
    return NextResponse.json({error:'Impossible de fermer la session'},{status:500});
  }
}
