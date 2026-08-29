import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';

function slugify(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'nouvelle-formation'}

export async function POST(request:Request){
 const body=await request.json().catch(()=>({}));
 const title=String(body.title||'Nouvelle formation').trim()||'Nouvelle formation';
 const db=getDB();
 const base=slugify(title);let slug=base;let n=2;
 while(await db.prepare(`SELECT id FROM trainings WHERE organization_id='evolution-pme' AND slug=?`).bind(slug).first()){slug=`${base}-${n++}`;}
 await db.prepare(`INSERT INTO trainings (organization_id,slug,title,description,status,target_duration_minutes,delivery_mode) VALUES ('evolution-pme',?,?,?,'DRAFT',NULL,'BOTH')`).bind(slug,title,'').run();
 return NextResponse.json({ok:true,slug},{status:201});
}
