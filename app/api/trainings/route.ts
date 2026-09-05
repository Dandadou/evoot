import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {requireOrganizationRole} from '@/lib/auth';

function slugify(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'nouvelle-formation'}
function unauthorized(e:unknown){return e instanceof Error&&e.message==='UNAUTHORIZED'}

export async function GET(){
 try{
  const auth=await requireOrganizationRole('ORG_ADMIN');const org=auth.organizationId!;const db=getDB();
  const result=await db.prepare(`SELECT slug,title,description,status,target_duration_minutes AS targetDurationMinutes,delivery_mode AS deliveryMode FROM trainings WHERE organization_id=? ORDER BY id DESC`).bind(org).all();
  return NextResponse.json({trainings:result.results||[]});
 }catch(e){if(unauthorized(e))return NextResponse.json({error:'Non autorisé'},{status:401});return NextResponse.json({error:'Impossible de charger les formations'},{status:500});}
}

export async function POST(request:Request){
 try{
  const auth=await requireOrganizationRole('ORG_ADMIN');const org=auth.organizationId!;
  const body=await request.json().catch(()=>({}));const title=String(body.title||'Nouvelle formation').trim()||'Nouvelle formation';const db=getDB();const base=slugify(title);let slug=base;let n=2;
  while(await db.prepare(`SELECT id FROM trainings WHERE organization_id=? AND slug=?`).bind(org,slug).first()){slug=`${base}-${n++}`;}
  await db.prepare(`INSERT INTO trainings (organization_id,slug,title,description,status,target_duration_minutes,delivery_mode) VALUES (?,?,?,?,'DRAFT',NULL,'BOTH')`).bind(org,slug,title,'').run();
  return NextResponse.json({ok:true,slug},{status:201});
 }catch(e){if(unauthorized(e))return NextResponse.json({error:'Non autorisé'},{status:401});return NextResponse.json({error:'Impossible de créer la formation'},{status:500});}
}
