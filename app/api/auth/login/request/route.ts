import {createHash,randomBytes} from 'node:crypto';
import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {sendLoginEmail} from '@/lib/auth-email';

const CHALLENGE_MINUTES=15;
const PUBLIC_RESPONSE={ok:true,message:'Si ce compte existe, un lien de connexion sera envoyé.'};
function hashToken(token:string){return createHash('sha256').update(token).digest('hex')}

export async function POST(req:Request){
  try{
    const body=await req.json();
    const email=String(body.email||'').trim().toLowerCase();
    if(!email||!email.includes('@'))return NextResponse.json({error:'Courriel invalide'},{status:400});

    const db=getDB();
    const user=await db.prepare(`SELECT id FROM users WHERE email=? AND status='ACTIVE' LIMIT 1`).bind(email).first<{id:number}>();
    if(!user)return NextResponse.json(PUBLIC_RESPONSE);

    const access=await db.prepare(`SELECT 1 ok FROM organization_members WHERE user_id=? AND status='ACTIVE' LIMIT 1`).bind(user.id).first<{ok:number}>();
    if(!access)return NextResponse.json(PUBLIC_RESPONSE);

    // Basic anti-spam throttle: at most one active login email per minute.
    const recent=await db.prepare(`SELECT 1 ok FROM auth_login_challenges WHERE email=? AND consumed_at IS NULL AND created_at>datetime('now','-1 minute') LIMIT 1`).bind(email).first<{ok:number}>();
    if(recent)return NextResponse.json(PUBLIC_RESPONSE);

    const token=randomBytes(32).toString('base64url');
    const expires=new Date(Date.now()+CHALLENGE_MINUTES*60_000);

    await db.prepare(`UPDATE auth_login_challenges SET consumed_at=CURRENT_TIMESTAMP WHERE email=? AND consumed_at IS NULL`).bind(email).run();
    const inserted=await db.prepare(`INSERT INTO auth_login_challenges (email,token_hash,purpose,expires_at) VALUES (?,?,'LOGIN',?)`).bind(email,hashToken(token),expires.toISOString()).run();

    try{
      await sendLoginEmail({email,token,origin:new URL(req.url).origin});
    }catch(error){
      console.error('EVOOT login email delivery failed',error instanceof Error?error.message:'unknown');
      const challengeId=inserted.meta?.last_row_id;
      if(challengeId)await db.prepare(`UPDATE auth_login_challenges SET consumed_at=CURRENT_TIMESTAMP WHERE id=?`).bind(challengeId).run();
    }

    return NextResponse.json(PUBLIC_RESPONSE);
  }catch(error){
    console.error('EVOOT login request failed',error instanceof Error?error.message:'unknown');
    return NextResponse.json(PUBLIC_RESPONSE);
  }
}
