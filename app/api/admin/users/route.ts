import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';

const ORG='evolution-pme';
const ALLOWED_ROLES=['ORG_ADMIN','TRAINER','LEARNER'] as const;
type Role=(typeof ALLOWED_ROLES)[number];

export async function GET(){
  try{
    const db=getDB();
    const users=await db.prepare(`SELECT u.id,u.display_name displayName,u.email,u.status,GROUP_CONCAT(om.role) roles FROM users u JOIN organization_members om ON om.user_id=u.id WHERE om.organization_id=? GROUP BY u.id,u.display_name,u.email,u.status ORDER BY u.display_name COLLATE NOCASE`).bind(ORG).all();
    return NextResponse.json({users:users.results||[]});
  }catch(e){return NextResponse.json({error:String(e)},{status:500})}
}

export async function POST(req:Request){
  try{
    const b=await req.json();
    const displayName=String(b.displayName||'').trim();
    const email=String(b.email||'').trim().toLowerCase();
    const role=String(b.role||'').trim().toUpperCase() as Role;
    if(!displayName||!email)return NextResponse.json({error:'Nom et courriel requis'},{status:400});
    if(!ALLOWED_ROLES.includes(role))return NextResponse.json({error:'Rôle invalide'},{status:400});
    const db=getDB();
    let user=await db.prepare('SELECT id FROM users WHERE email=?').bind(email).first<{id:number}>();
    if(!user){const r=await db.prepare(`INSERT INTO users (email,display_name,status,locale) VALUES (?,?,'ACTIVE','fr-CA')`).bind(email,displayName).run();user={id:Number(r.meta.last_row_id)}}
    else await db.prepare(`UPDATE users SET display_name=?,status='ACTIVE',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(displayName,user.id).run();
    await db.prepare(`INSERT OR IGNORE INTO organization_members (organization_id,user_id,role,status) VALUES (?,?,?,'ACTIVE')`).bind(ORG,user.id,role).run();
    await db.prepare(`UPDATE organization_members SET status='ACTIVE' WHERE organization_id=? AND user_id=? AND role=?`).bind(ORG,user.id,role).run();
    return NextResponse.json({ok:true,userId:user.id,role},{status:201});
  }catch(e){return NextResponse.json({error:String(e)},{status:500})}
}

export async function PATCH(req:Request){
  try{
    const b=await req.json();const id=Number(b.id);const role=String(b.role||'').trim().toUpperCase() as Role;
    if(!id||!ALLOWED_ROLES.includes(role))return NextResponse.json({error:'Utilisateur ou rôle invalide'},{status:400});
    const db=getDB();
    await db.prepare(`UPDATE organization_members SET status='INACTIVE' WHERE organization_id=? AND user_id=? AND role IN ('ORG_ADMIN','TRAINER','LEARNER')`).bind(ORG,id).run();
    await db.prepare(`INSERT OR IGNORE INTO organization_members (organization_id,user_id,role,status) VALUES (?,?,?,'ACTIVE')`).bind(ORG,id,role).run();
    await db.prepare(`UPDATE organization_members SET status='ACTIVE' WHERE organization_id=? AND user_id=? AND role=?`).bind(ORG,id,role).run();
    return NextResponse.json({ok:true,role});
  }catch(e){return NextResponse.json({error:String(e)},{status:500})}
}
