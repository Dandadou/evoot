import {createHash,randomBytes} from 'node:crypto';
import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';

const CHALLENGE_MINUTES=15;
function hashToken(token:string){return createHash('sha256').update(token).digest('hex')}

export async function POST(req:Request){
  try{
    const body=await req.json();
    const email=String(body.email||'').trim().toLowerCase();
    if(!email||!email.includes('@'))return NextResponse.json({error:'Courriel invalide'},{status:400});

    const db=getDB();
    const user=await db.prepare(`SELECT id FROM users WHERE email=? AND status='ACTIVE' LIMIT 1`).bind(email).first<{id:number}>();

    // Always return the same public response so this endpoint cannot be used
    // to discover which email addresses have EVOOT accounts.
    if(!user)return NextResponse.json({ok:true,message:'Si ce compte existe, un lien de connexion sera envoyé.'});

    const access=await db.prepare(`SELECT 1 ok FROM organization_members WHERE user_id=? AND status='ACTIVE' LIMIT 1`).bind(user.id).first<{ok:number}>();
    if(!access)return NextResponse.json({ok:true,message:'Si ce compte existe, un lien de connexion sera envoyé.'});

    const token=randomBytes(32).toString('base64url');
    const expires=new Date(Date.now()+CHALLENGE_MINUTES*60_000);
    await db.prepare(`INSERT INTO auth_login_challenges (email,token_hash,purpose,expires_at) VALUES (?,?,'LOGIN',?)`).bind(email,hashToken(token),expires.toISOString()).run();

    // Mail delivery is deliberately separated from challenge creation.
    // Never return the raw token in production responses. A mail provider
    // (Resend or equivalent) will receive this token server-side next.
    return NextResponse.json({ok:true,message:'Si ce compte existe, un lien de connexion sera envoyé.',deliveryConfigured:false});
  }catch{
    return NextResponse.json({error:'Impossible de préparer la connexion'},{status:500});
  }
}
