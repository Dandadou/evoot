import {createHash,randomBytes} from 'node:crypto';
import {NextResponse} from 'next/server';
import {AUTH_COOKIE} from '@/lib/auth';
import {getDB} from '@/lib/db';

const SESSION_DAYS=30;
const hashToken=(token:string)=>createHash('sha256').update(token).digest('hex');

function redirectToLogin(req:Request,error:string){
  const url=new URL('/login',req.url);
  url.searchParams.set('error',error);
  return NextResponse.redirect(url);
}

export async function GET(req:Request){
  try{
    const token=new URL(req.url).searchParams.get('token')?.trim();
    if(!token)return redirectToLogin(req,'invalid');

    const db=getDB();
    const challenge=await db.prepare(`SELECT id,email FROM auth_login_challenges WHERE token_hash=? AND consumed_at IS NULL AND expires_at>CURRENT_TIMESTAMP LIMIT 1`).bind(hashToken(token)).first<{id:number;email:string}>();
    if(!challenge)return redirectToLogin(req,'expired');

    const consumed=await db.prepare(`UPDATE auth_login_challenges SET consumed_at=CURRENT_TIMESTAMP WHERE id=? AND consumed_at IS NULL`).bind(challenge.id).run();
    if(!consumed.meta?.changes)return redirectToLogin(req,'expired');

    const user=await db.prepare(`SELECT id FROM users WHERE email=? AND status='ACTIVE' LIMIT 1`).bind(challenge.email.toLowerCase()).first<{id:number}>();
    if(!user)return redirectToLogin(req,'unauthorized');

    const memberships=await db.prepare(`SELECT organization_id organizationId,role FROM organization_members WHERE user_id=? AND status='ACTIVE' ORDER BY CASE WHEN role='EVOOT_ADMIN' THEN 0 ELSE 1 END,id`).bind(user.id).all<{organizationId:string;role:string}>();
    const active=memberships.results||[];
    if(!active.length)return redirectToLogin(req,'unauthorized');

    const isEvootAdmin=active.some(m=>m.organizationId==='evoot'&&m.role==='EVOOT_ADMIN');
    const customer=active.find(m=>m.role!=='EVOOT_ADMIN');
    const sessionToken=randomBytes(32).toString('base64url');
    const expires=new Date(Date.now()+SESSION_DAYS*86400000);

    await db.prepare(`INSERT INTO auth_sessions (user_id,token_hash,active_organization_id,expires_at) VALUES (?,?,?,?)`).bind(user.id,hashToken(sessionToken),customer?.organizationId??null,expires.toISOString()).run();

    let destination='/learner';
    if(isEvootAdmin)destination='/evoot-admin';
    else if(customer?.role==='ORG_ADMIN')destination='/admin';
    else if(customer?.role==='TRAINER')destination='/trainer';

    const response=NextResponse.redirect(new URL(destination,req.url));
    response.cookies.set(AUTH_COOKIE,sessionToken,{httpOnly:true,secure:true,sameSite:'lax',path:'/',expires});
    return response;
  }catch(error){
    console.error('EVOOT login callback failed',error instanceof Error?error.message:'unknown');
    return redirectToLogin(req,'failed');
  }
}
