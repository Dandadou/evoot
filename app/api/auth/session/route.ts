import {randomBytes,createHash} from 'node:crypto';
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {AUTH_COOKIE,getAuthContext} from '@/lib/auth';
import {getDB} from '@/lib/db';

const SESSION_DAYS=30;

function hashToken(token:string){return createHash('sha256').update(token).digest('hex')}

export async function GET(){
  const auth=await getAuthContext();
  if(!auth)return NextResponse.json({authenticated:false},{status:401});
  return NextResponse.json({authenticated:true,user:{id:auth.userId,email:auth.email,displayName:auth.displayName},organizationId:auth.organizationId,roles:auth.roles,isEvootAdmin:auth.isEvootAdmin});
}

// Called only after a login challenge has been verified.
export async function POST(req:Request){
  try{
    const body=await req.json();
    const challengeToken=String(body.challengeToken||'').trim();
    if(!challengeToken)return NextResponse.json({error:'Jeton de connexion requis'},{status:400});

    const db=getDB();
    const challenge=await db.prepare(`SELECT id,email FROM auth_login_challenges WHERE token_hash=? AND consumed_at IS NULL AND expires_at>CURRENT_TIMESTAMP LIMIT 1`).bind(hashToken(challengeToken)).first<{id:number;email:string}>();
    if(!challenge)return NextResponse.json({error:'Lien ou code invalide ou expiré'},{status:401});

    const user=await db.prepare(`SELECT id FROM users WHERE email=? AND status='ACTIVE' LIMIT 1`).bind(challenge.email.toLowerCase()).first<{id:number}>();
    if(!user)return NextResponse.json({error:'Compte non autorisé'},{status:403});

    const memberships=await db.prepare(`SELECT organization_id organizationId,role FROM organization_members WHERE user_id=? AND status='ACTIVE' ORDER BY CASE WHEN role='EVOOT_ADMIN' THEN 0 ELSE 1 END,id`).bind(user.id).all<{organizationId:string;role:string}>();
    const active=memberships.results||[];
    if(!active.length)return NextResponse.json({error:'Aucun accès actif'},{status:403});

    const customerMembership=active.find(m=>m.role!=='EVOOT_ADMIN');
    const activeOrganizationId=customerMembership?.organizationId??null;
    const sessionToken=randomBytes(32).toString('base64url');
    const expires=new Date(Date.now()+SESSION_DAYS*86400000);

    await db.batch([
      db.prepare(`UPDATE auth_login_challenges SET consumed_at=CURRENT_TIMESTAMP WHERE id=? AND consumed_at IS NULL`).bind(challenge.id),
      db.prepare(`INSERT INTO auth_sessions (user_id,token_hash,active_organization_id,expires_at) VALUES (?,?,?,?)`).bind(user.id,hashToken(sessionToken),activeOrganizationId,expires.toISOString())
    ]);

    const store=await cookies();
    store.set(AUTH_COOKIE,sessionToken,{httpOnly:true,secure:true,sameSite:'lax',path:'/',expires});
    return NextResponse.json({ok:true,expiresAt:expires.toISOString()});
  }catch{
    return NextResponse.json({error:'Impossible de créer la session'},{status:500});
  }
}

export async function DELETE(){
  const store=await cookies();
  const token=store.get(AUTH_COOKIE)?.value?.trim();
  if(token){
    const db=getDB();
    await db.prepare(`UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE token_hash=? AND revoked_at IS NULL`).bind(hashToken(token)).run();
  }
  store.set(AUTH_COOKIE,'',{httpOnly:true,secure:true,sameSite:'lax',path:'/',expires:new Date(0)});
  return NextResponse.json({ok:true});
}
