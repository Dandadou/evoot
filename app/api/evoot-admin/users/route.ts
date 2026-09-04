import {NextRequest,NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {requireEvootAdmin} from '@/lib/auth';

export async function GET(request:NextRequest){
 try{
  await requireEvootAdmin();const db=getDB();const q=(request.nextUrl.searchParams.get('q')||'').trim().toLowerCase();const like=`%${q}%`;
  const rows=await db.prepare(`SELECT u.id,u.email,u.display_name displayName,u.status,u.locale,u.created_at createdAt,COUNT(DISTINCT CASE WHEN om.status='ACTIVE' THEN om.organization_id END) organizations,COUNT(DISTINCT CASE WHEN om.status='ACTIVE' THEN om.id END) accesses,GROUP_CONCAT(DISTINCT CASE WHEN om.status='ACTIVE' THEN o.name END) organizationNames,GROUP_CONCAT(DISTINCT CASE WHEN om.status='ACTIVE' THEN om.role END) roles FROM users u LEFT JOIN organization_members om ON om.user_id=u.id LEFT JOIN organizations o ON o.id=om.organization_id WHERE (?='' OR lower(u.email) LIKE ? OR lower(u.display_name) LIKE ? OR lower(COALESCE(o.name,'')) LIKE ?) GROUP BY u.id ORDER BY CASE WHEN u.status='ACTIVE' THEN 0 ELSE 1 END,u.display_name,u.email LIMIT 200`).bind(q,like,like,like).all();
  return NextResponse.json({ok:true,users:rows.results||[]});
 }catch(e){if(e instanceof Error&&e.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});console.error('EVOOT users load failed',e);return NextResponse.json({error:'Impossible de charger les utilisateurs'},{status:500});}
}

export async function PATCH(request:NextRequest){
 try{
  const auth=await requireEvootAdmin();const body=await request.json() as {id?:number;status?:string};const id=Number(body.id);const status=body.status==='INACTIVE'?'INACTIVE':body.status==='ACTIVE'?'ACTIVE':'';if(!id||!status)return NextResponse.json({error:'Utilisateur ou statut invalide'},{status:400});const db=getDB();
  if(auth.userId===id&&status==='INACTIVE')return NextResponse.json({error:'Tu ne peux pas désactiver ton propre compte ÉVOOT.'},{status:400});
  const user=await db.prepare(`SELECT id,email FROM users WHERE id=?`).bind(id).first<{id:number;email:string}>();if(!user)return NextResponse.json({error:'Utilisateur introuvable'},{status:404});
  await db.prepare(`UPDATE users SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(status,id).run();
  if(status==='INACTIVE'){await db.prepare(`UPDATE organization_members SET status='INACTIVE' WHERE user_id=?`).bind(id).run();await db.prepare(`UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=? AND revoked_at IS NULL`).bind(id).run();}
  return NextResponse.json({ok:true,id,status});
 }catch(e){if(e instanceof Error&&e.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});console.error('EVOOT user update failed',e);return NextResponse.json({error:'Impossible de modifier cet utilisateur'},{status:500});}
}
