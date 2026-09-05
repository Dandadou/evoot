import {createHash,randomBytes} from 'node:crypto';
import {NextResponse} from 'next/server';
import {AUTH_COOKIE} from '@/lib/auth';
import {getDB} from '@/lib/db';

const SESSION_DAYS=30;
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');

export async function POST(req:Request){
 try{
  const body=await req.json();const email=String(body.email||'').trim().toLowerCase();const code=String(body.code||'').replace(/\D/g,'').slice(0,6);
  if(!email||code.length!==6)return NextResponse.json({error:'Code invalide'},{status:400});
  const db=getDB();
  const challenge=await db.prepare(`SELECT id FROM auth_login_challenges WHERE email=? AND code_hash=? AND consumed_at IS NULL AND expires_at>CURRENT_TIMESTAMP AND attempts<5 ORDER BY id DESC LIMIT 1`).bind(email,hash(code)).first<{id:number}>();
  if(!challenge){await db.prepare(`UPDATE auth_login_challenges SET attempts=attempts+1 WHERE email=? AND consumed_at IS NULL AND expires_at>CURRENT_TIMESTAMP`).bind(email).run();return NextResponse.json({error:'Code invalide ou expiré'},{status:401});}
  const consumed=await db.prepare(`UPDATE auth_login_challenges SET consumed_at=CURRENT_TIMESTAMP WHERE id=? AND consumed_at IS NULL`).bind(challenge.id).run();if(!consumed.meta?.changes)return NextResponse.json({error:'Code déjà utilisé'},{status:401});
  const user=await db.prepare(`SELECT id FROM users WHERE email=? AND status='ACTIVE' LIMIT 1`).bind(email).first<{id:number}>();if(!user)return NextResponse.json({error:'Accès refusé'},{status:403});
  const memberships=await db.prepare(`SELECT organization_id organizationId,role FROM organization_members WHERE user_id=? AND status='ACTIVE' ORDER BY CASE WHEN role='EVOOT_ADMIN' THEN 0 ELSE 1 END,id`).bind(user.id).all<{organizationId:string;role:string}>();const active=memberships.results||[];if(!active.length)return NextResponse.json({error:'Accès refusé'},{status:403});
  const isEvootAdmin=active.some(m=>m.organizationId==='evoot'&&m.role==='EVOOT_ADMIN');const customer=active.find(m=>m.role!=='EVOOT_ADMIN');const activeOrganizationId=isEvootAdmin?'evoot':customer?.organizationId??null;const sessionToken=randomBytes(32).toString('base64url');const expires=new Date(Date.now()+SESSION_DAYS*86400000);
  await db.prepare(`INSERT INTO auth_sessions (user_id,token_hash,active_organization_id,expires_at) VALUES (?,?,?,?)`).bind(user.id,hash(sessionToken),activeOrganizationId,expires.toISOString()).run();
  let destination='/learner';if(isEvootAdmin)destination='/evoot-admin';else if(customer?.role==='ORG_ADMIN')destination='/admin';else if(customer?.role==='TRAINER')destination='/trainer';
  const response=NextResponse.json({ok:true,destination});response.cookies.set(AUTH_COOKIE,sessionToken,{httpOnly:true,secure:true,sameSite:'lax',path:'/',expires});return response;
 }catch(error){console.error('EVOOT code verification failed',error instanceof Error?error.message:'unknown');return NextResponse.json({error:'Connexion impossible'},{status:500});}
}
